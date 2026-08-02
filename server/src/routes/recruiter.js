import { Router } from "express";
import multer from "multer";
import mongoose from "mongoose";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { parseResumeFile } from "../services/documentParser.js";
import { analyzeResume } from "../services/scoringEngine.js";
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
const jobs = new Map();
const candidates = new Map();
const STAGES = ["New", "Screened", "Shortlisted", "Interview", "Selected", "Rejected"];
const DEFAULT_WEIGHTS = { skills: 35, experience: 25, evidence: 20, impact: 15, education: 5 };

router.use(requireAuth, requireRole("employer"));

const publicJob = (job) => {
  const source = typeof job.toObject === "function" ? job.toObject() : job;
  return { ...source, id: String(source._id || source.id), _id: undefined, __v: undefined };
};

function featureScore(analysis, weights = DEFAULT_WEIGHTS) {
  const byName = new Map(analysis.categories.map((item) => [item.name, item.score]));
  const average = (...names) => names.reduce((sum, name) => sum + (byName.get(name) || 0), 0) / names.length;
  const features = {
    skills: average("Mandatory match", "Role relevance", "Skill evidence"),
    experience: average("Role relevance", "Impact"),
    evidence: average("Skill evidence", "Consistency"),
    impact: average("Impact", "Clarity"),
    education: byName.get("Education fit") || 0
  };
  const total = Object.values(weights).reduce((sum, value) => sum + Number(value), 0) || 100;
  const fit = Math.round(Object.entries(weights).reduce((sum, [key, weight]) => sum + features[key] * Number(weight) / total, 0));
  return { fit, features };
}

function candidateView(record, job, weights = job.weights || DEFAULT_WEIGHTS) {
  const source = typeof record.toObject === "function" ? record.toObject() : record;
  const analysis = source.analysis;
  const scored = featureScore(analysis, weights);
  const initials = source.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  const mandatoryCategory = analysis.categories.find((item) => item.name === "Mandatory match");
  const demonstrated = analysis.skillEvidence.filter((item) => item.level === "demonstrated");
  return {
    id: String(source._id || source.id), name: source.name, initials, fileName: source.fileName, stage: source.stage,
    fit: scored.fit, confidence: analysis.confidenceValue, mandatory: Math.round((mandatoryCategory?.score || 0) / 20),
    evidence: demonstrated.length, skills: analysis.skillEvidence.filter((item) => item.level !== "missing").map((item) => item.skill),
    strengths: analysis.strengths.map((item) => item.title),
    gaps: analysis.losses.map((item) => item.title),
    excerpts: [...analysis.strengths.map((item) => item.evidence?.text), ...analysis.losses.map((item) => item.evidence?.text)].filter(Boolean).slice(0, 4),
    features: scored.features, analysis
  };
}

async function getJob(ownerId, id) {
  if (mongoose.connection.readyState === 1) return Job.findOne({ _id: id, ownerId });
  const job = jobs.get(id);
  return job?.ownerId === ownerId ? job : null;
}

async function listCandidateRecords(ownerId, jobId) {
  if (mongoose.connection.readyState === 1) return Candidate.find({ ownerId, jobId }).sort({ createdAt: 1 });
  return [...candidates.values()].filter((item) => item.ownerId === ownerId && item.jobId === jobId);
}

router.get("/jobs", async (req, res) => {
  const rows = mongoose.connection.readyState === 1 ? await Job.find({ ownerId: req.user.sub }).sort({ createdAt: -1 }) : [...jobs.values()].filter((item) => item.ownerId === req.user.sub);
  res.json({ jobs: rows.map(publicJob) });
});

router.post("/jobs", async (req, res) => {
  const title = String(req.body.title || "").trim();
  if (title.length < 3) return res.status(400).json({ message: "Enter a clear job title." });
  const payload = { ownerId: req.user.sub, title, location: String(req.body.location || "").trim(), description: String(req.body.description || "").trim(), weights: DEFAULT_WEIGHTS };
  const record = mongoose.connection.readyState === 1 ? await Job.create(payload) : { ...payload, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  if (mongoose.connection.readyState !== 1) jobs.set(record.id, record);
  res.status(201).json({ job: publicJob(record) });
});

router.get("/jobs/:jobId/rankings", async (req, res) => {
  const job = await getJob(req.user.sub, req.params.jobId);
  if (!job) return res.status(404).json({ message: "Job not found." });
  const rows = await listCandidateRecords(req.user.sub, String(req.params.jobId));
  const ranked = rows.map((item) => candidateView(item, job)).sort((a, b) => b.fit - a.fit).map((item, index) => ({ ...item, rank: index + 1 }));
  res.json({ candidates: ranked, decisionSupportOnly: true });
});

router.post("/jobs/:jobId/candidates", upload.single("resume"), async (req, res) => {
  try {
    const job = await getJob(req.user.sub, req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found." });
    const resumeText = req.file ? await parseResumeFile(req.file) : String(req.body.resumeText || "");
    if (!resumeText.trim()) return res.status(400).json({ message: "Upload a resume or paste resume text." });
    const fallbackName = resumeText.split(/\r?\n/).map((line) => line.trim()).find(Boolean)?.replace(/[^a-zA-Z .'-]/g, "").trim();
    const name = String(req.body.candidateName || fallbackName || "Unnamed candidate").slice(0, 80);
    const analysis = analyzeResume({ resumeText, targetRole: job.title, seniority: req.body.seniority || "Mid-level", jobDescription: job.description });
    const payload = { ownerId: req.user.sub, jobId: String(req.params.jobId), name, fileName: req.file?.originalname || "Pasted resume", stage: "New", analysis };
    const record = mongoose.connection.readyState === 1 ? await Candidate.create(payload) : { ...payload, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    if (mongoose.connection.readyState !== 1) candidates.set(record.id, record);
    res.status(201).json({ candidate: candidateView(record, job) });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

router.post("/jobs/:jobId/rerank", async (req, res) => {
  const job = await getJob(req.user.sub, req.params.jobId);
  if (!job) return res.status(404).json({ message: "Job not found." });
  const weights = { ...DEFAULT_WEIGHTS, ...req.body.weights };
  if (mongoose.connection.readyState === 1) { job.weights = weights; await job.save(); } else { job.weights = weights; jobs.set(job.id, job); }
  const rows = await listCandidateRecords(req.user.sub, String(req.params.jobId));
  const ranked = rows.map((item) => candidateView(item, job, weights)).sort((a, b) => b.fit - a.fit).map((item, index) => ({ ...item, rank: index + 1 }));
  res.json({ candidates: ranked });
});

router.patch("/candidates/:candidateId/stage", async (req, res) => {
  if (!STAGES.includes(req.body.stage)) return res.status(400).json({ message: "Invalid hiring stage." });
  let record;
  if (mongoose.connection.readyState === 1) record = await Candidate.findOneAndUpdate({ _id: req.params.candidateId, ownerId: req.user.sub }, { stage: req.body.stage }, { new: true });
  else { record = candidates.get(req.params.candidateId); if (record?.ownerId === req.user.sub) { record.stage = req.body.stage; candidates.set(record.id, record); } else record = null; }
  if (!record) return res.status(404).json({ message: "Candidate not found." });
  res.json({ id: String(record._id || record.id), stage: record.stage });
});

router.post("/interview-questions", async (req, res) => {
  const record = mongoose.connection.readyState === 1 ? await Candidate.findOne({ _id: req.body.candidateId, ownerId: req.user.sub }) : candidates.get(req.body.candidateId);
  if (!record || String(record.ownerId) !== req.user.sub) return res.status(404).json({ message: "Candidate not found." });
  const analysis = record.analysis;
  const strongest = analysis.strengths[0]?.evidence?.text || analysis.strengths[0]?.title || "your strongest relevant project";
  const gap = analysis.losses[0]?.detail || "an important requirement with limited evidence";
  const skill = analysis.skillEvidence.find((item) => item.level === "demonstrated")?.skill || analysis.role.targetRole;
  res.json({ questions: [
    `Your resume states: “${strongest}” What was your individual contribution and how was the result verified?`,
    `Walk us through a difficult decision you made while using ${skill}. What alternatives did you reject?`,
    `The resume has limited evidence for this area: ${gap} What relevant experience can you clarify?`,
    `If you joined this ${analysis.role.targetRole} role, what would you aim to understand in your first 30 days?`,
    "Describe a disagreement with a stakeholder or teammate. What evidence changed the final decision?"
  ] });
});

export default router;

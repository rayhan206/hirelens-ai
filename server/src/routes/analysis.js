import { Router } from "express";
import multer from "multer";
import { analyzeResume, extractJobRequirements } from "../services/scoringEngine.js";
import { parseResumeFile } from "../services/documentParser.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import mongoose from "mongoose";
import Analysis from "../models/Analysis.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.post("/resume", requireAuth, requireRole("candidate"), upload.single("resume"), async (req, res) => {
  try {
    const resumeText = req.file ? await parseResumeFile(req.file) : req.body.resumeText;
    if (!resumeText?.trim()) return res.status(400).json({ message: "Upload a resume or paste resume text." });
    const analysis = analyzeResume({ resumeText, targetRole: req.body.targetRole, seniority: req.body.seniority, jobDescription: req.body.jobDescription });
    if (mongoose.connection.readyState === 1) await Analysis.create({ userId: req.user.sub, targetRole: analysis.role.targetRole, seniority: analysis.role.seniority, score: analysis.score, confidence: analysis.confidence, modelVersion: analysis.metadata.modelVersion, rubricVersion: analysis.metadata.rubricVersion, result: analysis });
    res.json({ analysis });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/jd", requireAuth, (req, res) => res.json({ requirements: extractJobRequirements(req.body.jobDescription || "") }));
export default router;

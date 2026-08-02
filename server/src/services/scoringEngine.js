import { ROLE_RUBRICS, resolveRole } from "../data/roleRubrics.js";

const SECTION_PATTERN = /^(summary|objective|experience|work experience|employment|projects?|skills?|education|certifications?|publications?|research|portfolio|achievements?|leadership)\s*:?[\s]*$/i;
const CONTACT = { email: /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/, phone: /(?:\+?\d[\d\s()-]{8,}\d)/, link: /(?:linkedin\.com|github\.com|behance\.net|dribbble\.com|https?:\/\/)/i };
const METRIC = /\b(?:\d+(?:\.\d+)?%?|\$[\d,.]+|₹[\d,.]+|\d+[kKmM]\+?|\d+\s+(?:users?|clients?|projects?|months?|years?|records?|people|members?))\b/;
const WEAK_OPENINGS = /^(worked on|responsible for|helped with|assisted with|involved in|did)\b/i;
const ACTION_VERBS = /\b(built|created|designed|developed|implemented|led|launched|improved|optimized|analysed|analyzed|managed|delivered|increased|reduced|deployed|researched|published|trained|evaluated|audited|forecasted|shipped)\b/i;

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));
const uniq = (values) => [...new Set(values.filter(Boolean))];

function tokenize(value) {
  return new Set((value.toLowerCase().match(/[a-z][a-z0-9+#.-]{1,}/g) || []).filter((term) => term.length > 2));
}

export function extractJobRequirements(jobDescription = "") {
  const sentences = jobDescription.split(/\n|(?<=[.!?])\s+/).map((item) => item.trim()).filter(Boolean);
  const mandatory = sentences.filter((line) => /\b(must|required|minimum|need to|essential)\b/i.test(line)).slice(0, 8);
  const preferred = sentences.filter((line) => /\b(preferred|nice to have|bonus|ideally|desirable)\b/i.test(line)).slice(0, 8);
  const responsibilities = sentences.filter((line) => /\b(build|design|manage|lead|develop|create|analyse|analyze|deliver|own|work with)\b/i.test(line)).slice(0, 8);
  return { mandatory, preferred, responsibilities };
}

function findEvidence(lines, term) {
  const normalized = term.toLowerCase().replace(/[^a-z0-9+#. ]/g, " ").split(/\s+/).filter((part) => part.length > 2);
  return lines.findIndex((line) => normalized.some((part) => line.toLowerCase().includes(part)));
}

function parseSections(lines) {
  const sections = [];
  let current = "header";
  lines.forEach((text, index) => {
    if (SECTION_PATTERN.test(text.trim())) current = text.trim().toLowerCase().replace(/:$/, "");
    sections.push({ line: index + 1, section: current, text });
  });
  return sections;
}

export function analyzeResume({ resumeText, targetRole = "Software Engineer", seniority = "Mid-level", jobDescription = "" }) {
  const cleanText = String(resumeText || "").replace(/\r/g, "").replace(/[\t ]+/g, " ").trim();
  const lines = cleanText.split("\n").map((line) => line.trim()).filter(Boolean);
  const roleKey = resolveRole(targetRole);
  const rubric = ROLE_RUBRICS[roleKey];
  const jd = extractJobRequirements(jobDescription);
  const resumeTokens = tokenize(cleanText);
  const jdTokens = tokenize(jobDescription);
  const matchedTerms = rubric.terms.filter((term) => findEvidence(lines, term) >= 0);
  const jdSignalTerms = [...jdTokens].filter((term) => !/must|required|preferred|role|work|team|year|with|from/.test(term));
  const matchedJdTerms = jdSignalTerms.filter((term) => resumeTokens.has(term));
  const sectionLines = parseSections(lines);
  const sectionNames = new Set(sectionLines.map((entry) => entry.section));
  const bulletLines = sectionLines.filter((entry) => /^(?:[-•*]|\d+[.)])\s+/.test(entry.text));
  const evidenceBullets = bulletLines.filter((entry) => ACTION_VERBS.test(entry.text));
  const metricBullets = bulletLines.filter((entry) => METRIC.test(entry.text));
  const weakBullets = bulletLines.filter((entry) => WEAK_OPENINGS.test(entry.text.replace(/^(?:[-•*]|\d+[.)])\s+/, "")));
  const duplicateCount = lines.length - new Set(lines.map((line) => line.toLowerCase())).size;
  const contactCount = Object.values(CONTACT).filter((pattern) => pattern.test(cleanText)).length;
  const requiredSections = roleKey === "research" ? ["education", "research"] : ["experience", "education", "skills"];
  const foundSections = requiredSections.filter((name) => [...sectionNames].some((section) => section.includes(name)));
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

  const parseability = clamp(45 + contactCount * 10 + foundSections.length * 9 + (wordCount >= 180 ? 12 : 0) - (wordCount > 1200 ? 8 : 0));
  const mandatoryMatch = jobDescription ? clamp((matchedJdTerms.length / Math.max(6, jdSignalTerms.length)) * 115) : clamp((matchedTerms.length / Math.max(4, rubric.terms.length)) * 140);
  const roleRelevance = clamp((matchedTerms.length / rubric.terms.length) * 100 + Math.min(18, matchedJdTerms.length * 2));
  const evidenceStrength = clamp(30 + matchedTerms.filter((term) => {
    const idx = findEvidence(lines, term);
    return idx >= 0 && ACTION_VERBS.test(lines[idx]);
  }).length * 9 + Math.min(25, evidenceBullets.length * 3));
  const impact = clamp(28 + metricBullets.length * 12 + Math.max(0, evidenceBullets.length - metricBullets.length) * 2);
  const framing = clamp(52 + evidenceBullets.length * 4 - weakBullets.length * 11);
  const education = clamp(sectionNames.has("education") ? 82 : 38);
  const consistency = clamp(92 - duplicateCount * 8 - (/(20[3-9]\d)/.test(cleanText) ? 12 : 0));
  const presentation = clamp(foundSections.length * 22 + (wordCount <= 900 ? 25 : 12));

  const categories = [
    ["ATS structure", parseability, 10], ["Mandatory match", mandatoryMatch, 20], ["Role relevance", roleRelevance, 20],
    ["Skill evidence", evidenceStrength, 15], ["Impact", impact, 15], ["Clarity", framing, 8],
    ["Education fit", education, 5], ["Consistency", consistency, 4], ["Role presentation", presentation, 3]
  ].map(([name, score, weight]) => ({ name, score, weight, contribution: Math.round((score * weight) / 100) }));
  const score = clamp(categories.reduce((total, category) => total + category.score * category.weight / 100, 0));
  const confidenceValue = clamp(45 + Math.min(25, lines.length / 2) + (jobDescription ? 12 : 0) + foundSections.length * 4);
  const confidence = confidenceValue >= 78 ? "High" : confidenceValue >= 58 ? "Medium" : "Low";

  const skillEvidence = rubric.terms.map((skill) => {
    const index = findEvidence(lines, skill);
    if (index < 0) return { skill, level: "missing", evidence: null };
    const line = lines[index];
    const strong = ACTION_VERBS.test(line) || METRIC.test(line);
    return { skill, level: strong ? "demonstrated" : "listed", evidence: { line: index + 1, text: line } };
  });

  const losses = [];
  if (impact < 72) losses.push({ category: "Impact", points: Math.min(10, Math.round((72 - impact) * .15)), title: "Outcomes are under-evidenced", detail: metricBullets.length ? "Only a few bullets include verified scale or outcomes." : "No measurable scale or verified outcome was detected.", evidence: weakBullets[0] || bulletLines[0] || null, action: "Answer a targeted scale or outcome question for your strongest project." });
  if (roleRelevance < 70) losses.push({ category: "Role relevance", points: Math.min(12, Math.round((70 - roleRelevance) * .2)), title: `Missing ${rubric.label} evidence`, detail: `${rubric.terms.filter((term) => !matchedTerms.includes(term)).slice(0, 3).join(", ")} are not supported by resume lines.`, evidence: null, action: "Add only skills you can support with a project, role, certification or portfolio example." });
  if (parseability < 80) losses.push({ category: "ATS structure", points: Math.min(8, Math.round((80 - parseability) * .1)), title: "Resume structure needs attention", detail: `Found ${foundSections.length}/${requiredSections.length} core sections and ${contactCount}/3 contact signals.`, evidence: sectionLines[0] || null, action: "Use standard headings and include professional contact links." });
  if (weakBullets.length) losses.push({ category: "Clarity", points: Math.min(6, weakBullets.length * 2), title: "Weak bullet openings", detail: `${weakBullets.length} bullet${weakBullets.length === 1 ? "" : "s"} begin with passive or vague wording.`, evidence: weakBullets[0], action: "Lead with a precise action verb while preserving the original fact." });
  if (duplicateCount) losses.push({ category: "Consistency", points: Math.min(5, duplicateCount * 2), title: "Repeated statements need review", detail: `${duplicateCount} repeated line${duplicateCount === 1 ? "" : "s"} detected.`, evidence: null, action: "Remove duplicates or distinguish the scope of each achievement." });

  const strengths = [
    ...skillEvidence.filter((item) => item.level === "demonstrated").slice(0, 3).map((item) => ({ title: `${item.skill} is demonstrated`, evidence: item.evidence })),
    ...(metricBullets.length ? [{ title: `${metricBullets.length} quantified impact statement${metricBullets.length === 1 ? "" : "s"}`, evidence: metricBullets[0] }] : []),
    ...(parseability >= 80 ? [{ title: "ATS-readable core structure", evidence: null }] : [])
  ].slice(0, 4);

  const rewrites = weakBullets.slice(0, 3).map((entry) => {
    const original = entry.text.replace(/^(?:[-•*]|\d+[.)])\s+/, "");
    const suggested = original.replace(WEAK_OPENINGS, (match) => match.toLowerCase().startsWith("responsible") ? "Managed" : "Contributed to");
    return { line: entry.line, original, suggested, reason: "Uses a clearer action opening without adding tools, metrics or outcomes.", missingInformation: METRIC.test(original) ? null : "What was the scale, frequency, audience or verified outcome?" };
  });

  const simulation = [
    { id: "impact", label: "Add verified scale or outcomes", gain: Math.min(8, Math.max(2, Math.round((78 - impact) * .12))) },
    { id: "evidence", label: "Demonstrate missing role skills", gain: Math.min(7, Math.max(2, Math.round((76 - evidenceStrength) * .1))) },
    { id: "structure", label: "Resolve ATS structure issues", gain: Math.min(4, Math.max(1, Math.round((82 - parseability) * .07))) }
  ];

  return {
    score, confidence, confidenceValue, role: { key: roleKey, label: rubric.label, targetRole, seniority },
    categories, strengths, losses: losses.sort((a, b) => b.points - a.points), skillEvidence, rewrites, simulation,
    job: { ...jd, matchedTerms: uniq(matchedJdTerms).slice(0, 14), missingRoleTerms: rubric.terms.filter((term) => !matchedTerms.includes(term)).slice(0, 8) },
    resume: { wordCount, lines: sectionLines, sections: uniq(sectionLines.map((entry) => entry.section)), parseWarnings: parseability < 80 ? ["Use standard section headings and avoid text-box-only content."] : [] },
    metadata: { modelVersion: "rules-1.0", rubricVersion: `role-${roleKey}-1.0`, generatedAt: new Date().toISOString(), decisionSupportOnly: true }
  };
}

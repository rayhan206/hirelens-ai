import { ROLE_RUBRICS, resolveRole } from "../data/roleRubrics.js";

const SECTION_PATTERN = /^(summary|objective|experience|work experience|employment|projects?|skills?|education|certifications?|publications?|research|portfolio|achievements?|leadership)\s*:?\s*$/i;
const CONTACT = {
  email: /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/,
  phone: /(?:\+?\d[\d\s()-]{8,}\d)/,
  link: /(?:linkedin\.com|github\.com|behance\.net|dribbble\.com|https?:\/\/)/i
};
const BULLET = /^(?:[-*•]|\d+[.)])\s+/;
const METRIC = /(?:\b\d+(?:\.\d+)?%|[$₹€£]\s?[\d,.]+|\b\d+(?:\.\d+)?\s?[kKmMbB]\+?\b|\b\d+\s+(?:users?|clients?|projects?|months?|years?|records?|people|members?|requests?|transactions?|campaigns?|markets?|countries?|teams?|hours?|days?|weeks?|test cases?|participants?|respondents?)\b|\b\d+(?:\.\d+)?x\b)/i;
const OUTCOME = /\b(increased|grew|reduced|saved|improved|accelerated|raised|lowered|generated|delivered|achieved|resulted|enabled|prevented|converted|reached|accuracy|revenue|cost|latency|uptime|adoption|conversion|retention|efficiency|quality)\b/i;
const WEAK_OPENINGS = /^(worked on|responsible for|helped with|assisted with|involved in|participated in|did|handled)\b/i;
const ACTION_VERBS = /\b(built|created|designed|developed|implemented|led|launched|improved|optimized|optimised|analysed|analyzed|managed|delivered|increased|reduced|deployed|researched|published|trained|evaluated|audited|forecasted|shipped|automated|integrated|migrated|architected|tested|conducted|validated|modeled|modelled|presented|authored|generated|grew|converted|facilitated|advised|reconciled|prototyped|illustrated|directed|owned|coordinated|supported|contributed)\b/i;
const VAGUE_CLAIMS = /\b(hard[- ]working|team player|go[- ]getter|passionate|results[- ]oriented|excellent communication|fast learner|dynamic professional|responsible for various|worked on various)\b/i;
const FIRST_PERSON = /\b(i|me|my|mine|we|our)\b/i;
const EXPERIENCE_SECTIONS = /experience|employment|project|research|publication|leadership|achievement|portfolio/;
const COMMON_TYPOS = new Map([
  ["experiance", "experience"], ["developement", "development"], ["managment", "management"],
  ["responsibile", "responsible"], ["acheived", "achieved"], ["succesfully", "successfully"],
  ["seperate", "separate"], ["enviroment", "environment"], ["maintainance", "maintenance"]
]);
const STOP_WORDS = new Set("about after also and are been being build building can candidate company design experience for from have into interfaces must need preferred required role team that the their they this through user using will with work years your".split(" "));
const SKILL_ALIASES = {
  javascript: ["javascript", "js", "ecmascript"], typescript: ["typescript", "ts"], react: ["react", "react.js", "reactjs"],
  node: ["node", "node.js", "nodejs"], api: ["api", "rest", "graphql"], database: ["database", "postgresql", "mysql", "mongodb", "sql server"],
  testing: ["testing", "tests", "jest", "vitest", "cypress", "playwright"], cloud: ["cloud", "aws", "azure", "gcp"],
  deployment: ["deployment", "deployed", "ci/cd", "docker", "kubernetes"], "system design": ["system design", "architecture", "architected"],
  performance: ["performance", "latency", "throughput", "optimization", "optimisation"], python: ["python", "pytorch", "scikit-learn"],
  sql: ["sql", "postgresql", "mysql", "sqlite"], "machine learning": ["machine learning", "ml", "deep learning"],
  visualization: ["visualization", "visualisation", "tableau", "power bi", "matplotlib"], excel: ["excel", "spreadsheets", "vlookup", "pivot table"],
  seo: ["seo", "search engine optimization"], crm: ["crm", "salesforce", "hubspot"], figma: ["figma"], accessibility: ["accessibility", "accessible", "wcag", "aria"]
};
const OUTCOME_TEMPLATES = {
  software: "for [verified users/requests or system scale], improving [verified speed, reliability, quality, or delivery outcome]",
  data: "using [verified dataset/sample size], achieving [verified model or business outcome]",
  finance: "across [verified budget/revenue/portfolio scope], improving [verified cost, forecast, risk, or decision outcome]",
  consulting: "for [verified client/stakeholder group], leading to [verified decision or operational outcome]",
  marketing: "across [verified audience/leads/campaign scope], changing [verified conversion, revenue, or engagement metric]",
  design: "validated with [verified number/type of users], improving [verified usability, accessibility, or adoption outcome]",
  research: "using [verified sample/dataset size], producing [verified finding, publication, or research outcome]"
};

const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));
const uniq = (values) => [...new Set(values.filter(Boolean))];
const stripBullet = (text) => text.replace(BULLET, "").trim();
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9+#./ ]/g, " ").replace(/\s+/g, " ").trim();
}

function tokenize(value) {
  return new Set((normalize(value).match(/[a-z][a-z0-9+#/-]{1,}/g) || []).filter((term) => term.length > 2 && !STOP_WORDS.has(term)));
}

function containsTerm(text, term) {
  const value = normalize(text);
  const aliases = SKILL_ALIASES[term] || [term];
  return aliases.some((alias) => new RegExp(`(^|\\s)${escapeRegExp(normalize(alias))}(?=\\s|$|[.,/+])`, "i").test(value));
}

export function extractJobRequirements(jobDescription = "") {
  const sentences = jobDescription.split(/\n|(?<=[.!?])\s+/).map((item) => item.trim()).filter(Boolean);
  const mandatory = sentences.filter((line) => /\b(must|required|minimum|need to|essential)\b/i.test(line)).slice(0, 8);
  const preferred = sentences.filter((line) => /\b(preferred|nice to have|bonus|ideally|desirable)\b/i.test(line)).slice(0, 8);
  const responsibilities = sentences.filter((line) => /\b(build|design|manage|lead|develop|create|analyse|analyze|deliver|own|ship|test|research)\b/i.test(line)).slice(0, 8);
  return { mandatory, preferred, responsibilities };
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

function getSkillEvidence(sectionLines, skill) {
  const candidates = sectionLines.filter((entry) => containsTerm(entry.text, skill)).map((entry) => {
    const isBullet = BULLET.test(entry.text);
    const action = ACTION_VERBS.test(stripBullet(entry.text));
    const contextual = EXPERIENCE_SECTIONS.test(entry.section) && (isBullet || action);
    const demonstrated = contextual && (action || METRIC.test(entry.text));
    return { entry, level: demonstrated ? "demonstrated" : "listed", rank: demonstrated ? 2 : 1 };
  }).sort((a, b) => b.rank - a.rank || a.entry.line - b.entry.line);
  const best = candidates[0];
  return best ? { skill, level: best.level, evidence: { line: best.entry.line, text: best.entry.text } } : { skill, level: "missing", evidence: null };
}

function requirementSignals(requirement, rubric) {
  const roleTerms = rubric.terms.filter((term) => containsTerm(requirement, term));
  const contextualTerms = [...tokenize(requirement)]
    .map((term) => term === "accessible" ? "accessibility" : term)
    .filter((term) => term.length >= 4 && !STOP_WORDS.has(term) && !roleTerms.some((roleTerm) => containsTerm(term, roleTerm)));
  return uniq([...roleTerms, ...contextualTerms]).slice(0, 7);
}

function evaluateRequirements(requirements, cleanText, rubric) {
  return requirements.map((text) => {
    const signals = requirementSignals(text, rubric);
    const matchedSignals = signals.filter((signal) => containsTerm(cleanText, signal));
    const missingSignals = signals.filter((signal) => !matchedSignals.includes(signal));
    return { text, signals, matchedSignals, missingSignals, matched: signals.length > 0 && matchedSignals.length >= Math.max(1, Math.ceil(signals.length * .75)) };
  });
}

function improveOpening(original) {
  const replacements = {
    "worked on": "Contributed to", "responsible for": "Managed", "helped with": "Supported",
    "assisted with": "Supported", "involved in": "Contributed to", "participated in": "Contributed to",
    did: "Completed", handled: "Managed"
  };
  if (WEAK_OPENINGS.test(original)) return original.replace(WEAK_OPENINGS, (match) => replacements[match.toLowerCase()] || "Contributed to");
  if (!ACTION_VERBS.test(original.split(/[,;]/)[0])) return `Contributed to ${original.charAt(0).toLowerCase()}${original.slice(1)}`;
  return original;
}

function correctTypos(text) {
  let corrected = text;
  for (const [wrong, right] of COMMON_TYPOS) corrected = corrected.replace(new RegExp(`\\b${wrong}\\b`, "gi"), right);
  return corrected;
}

function buildRewrite(entry, roleKey, reasons = [], targetRole = "target-role professional") {
  const original = stripBullet(entry.text);
  if (VAGUE_CLAIMS.test(original)) {
    const suggested = BULLET.test(entry.text)
      ? "Collaborated with [specific team/stakeholder] to [specific action], resulting in [verified outcome]."
      : `${targetRole} with verified experience in [capability 1] and [capability 2], demonstrated through [specific project or result].`;
    return { line: entry.line, original, suggested, reason: "Replaces an unverifiable personality claim with evidence the reader can assess.", missingInformation: "Fill the brackets with one real situation and a result you can explain in an interview.", requiresFacts: true };
  }
  let suggested = correctTypos(improveOpening(original)).replace(/[.;]$/, "");
  const needsFacts = !METRIC.test(suggested) || !OUTCOME.test(suggested);
  if (needsFacts) suggested = `${suggested}, ${OUTCOME_TEMPLATES[roleKey]}.`;
  else suggested = `${suggested}.`;
  return {
    line: entry.line,
    original,
    suggested,
    reason: reasons.join(" ") || "Adds a clearer action, verified scope, and outcome while preserving the original claim.",
    missingInformation: needsFacts ? "Replace every bracketed phrase with a fact you can verify; delete any clause you cannot prove." : null,
    requiresFacts: needsFacts
  };
}

export function analyzeResume({ resumeText, targetRole = "Software Engineer", seniority = "Mid-level", jobDescription = "" }) {
  const cleanText = String(resumeText || "").replace(/\r/g, "").replace(/[\t ]+/g, " ").trim();
  const lines = cleanText.split("\n").map((line) => line.trim()).filter(Boolean);
  const roleKey = resolveRole(targetRole);
  const rubric = ROLE_RUBRICS[roleKey];
  const jd = extractJobRequirements(jobDescription);
  const sectionLines = parseSections(lines);
  const sectionNames = new Set(sectionLines.map((entry) => entry.section));
  const bulletLines = sectionLines.filter((entry) => BULLET.test(entry.text));
  const actionBullets = bulletLines.filter((entry) => ACTION_VERBS.test(stripBullet(entry.text)));
  const metricBullets = bulletLines.filter((entry) => METRIC.test(entry.text));
  const outcomeBullets = bulletLines.filter((entry) => OUTCOME.test(entry.text));
  const weakBullets = bulletLines.filter((entry) => WEAK_OPENINGS.test(stripBullet(entry.text)));
  const noActionBullets = bulletLines.filter((entry) => !ACTION_VERBS.test(stripBullet(entry.text)));
  const longBullets = bulletLines.filter((entry) => stripBullet(entry.text).split(/\s+/).length > 34);
  const vagueLines = sectionLines.filter((entry) => VAGUE_CLAIMS.test(entry.text));
  const firstPersonLines = sectionLines.filter((entry) => FIRST_PERSON.test(entry.text) && entry.section !== "header");
  const typoLines = sectionLines.filter((entry) => [...COMMON_TYPOS.keys()].some((word) => new RegExp(`\\b${word}\\b`, "i").test(entry.text)));
  const duplicateCount = lines.length - new Set(lines.map((line) => line.toLowerCase())).size;
  const contactCount = Object.values(CONTACT).filter((pattern) => pattern.test(cleanText)).length;
  const requiredSections = roleKey === "research" ? ["education", "research"] : ["experience", "education", "skills"];
  const foundSections = requiredSections.filter((name) => [...sectionNames].some((section) => section.includes(name)));
  const missingSections = requiredSections.filter((name) => !foundSections.includes(name));
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

  const skillEvidence = rubric.terms.map((skill) => getSkillEvidence(sectionLines, skill));
  const demonstrated = skillEvidence.filter((item) => item.level === "demonstrated");
  const listed = skillEvidence.filter((item) => item.level === "listed");
  const missing = skillEvidence.filter((item) => item.level === "missing");
  const mandatoryRequirements = evaluateRequirements(jd.mandatory, cleanText, rubric);
  const preferredRequirements = evaluateRequirements(jd.preferred, cleanText, rubric);
  const mandatoryMatched = mandatoryRequirements.filter((item) => item.matched).length;

  const parseability = clamp(25 + contactCount * 11 + foundSections.length * 12 + (wordCount >= 140 && wordCount <= 1000 ? 12 : wordCount >= 80 ? 5 : 0) - (wordCount > 1200 ? 12 : 0));
  const mandatoryMatch = jobDescription
    ? clamp((mandatoryMatched / Math.max(1, mandatoryRequirements.length)) * 85 + (preferredRequirements.filter((item) => item.matched).length / Math.max(1, preferredRequirements.length)) * 15)
    : clamp(((demonstrated.length + listed.length * .25) / rubric.terms.length) * 100);
  const roleRelevance = clamp(((demonstrated.length + listed.length * .3) / rubric.terms.length) * 100);
  const bulletCoverage = actionBullets.length / Math.max(3, bulletLines.length);
  const evidenceStrength = clamp((demonstrated.length / rubric.terms.length) * 75 + bulletCoverage * 25);
  const impact = clamp(12 + (metricBullets.length / Math.max(3, bulletLines.length)) * 58 + (outcomeBullets.length / Math.max(3, bulletLines.length)) * 30);
  const clarity = clamp(42 + bulletCoverage * 45 - weakBullets.length * 9 - noActionBullets.length * 5 - longBullets.length * 5 - vagueLines.length * 8 - firstPersonLines.length * 4 - typoLines.length * 7);
  const education = clamp(sectionNames.has("education") ? 82 : 32);
  const consistency = clamp(94 - duplicateCount * 9 - typoLines.length * 6 - (/(20[3-9]\d)/.test(cleanText) ? 12 : 0));
  const presentation = clamp(foundSections.length * 21 + (wordCount >= 140 && wordCount <= 1000 ? 27 : 14) + (bulletLines.length >= 3 ? 10 : 0));

  const categories = [
    ["ATS structure", parseability, 10], ["Mandatory match", mandatoryMatch, 20], ["Role relevance", roleRelevance, 20],
    ["Skill evidence", evidenceStrength, 15], ["Impact", impact, 15], ["Clarity", clarity, 8],
    ["Education fit", education, 5], ["Consistency", consistency, 4], ["Role presentation", presentation, 3]
  ].map(([name, score, weight]) => ({ name, score, weight, contribution: Math.round((score * weight) / 100) }));
  const score = clamp(categories.reduce((total, category) => total + category.score * category.weight / 100, 0));
  const confidenceValue = clamp(38 + Math.min(27, lines.length / 2) + (jobDescription ? 14 : 0) + foundSections.length * 5 + Math.min(8, bulletLines.length));
  const confidence = confidenceValue >= 78 ? "High" : confidenceValue >= 58 ? "Medium" : "Low";

  const rewriteTargets = new Map();
  const addRewriteTarget = (entry, reason) => {
    if (!entry) return;
    const existing = rewriteTargets.get(entry.line) || { entry, reasons: [] };
    existing.reasons.push(reason);
    rewriteTargets.set(entry.line, existing);
  };
  weakBullets.forEach((entry) => addRewriteTarget(entry, "Replaces a vague opening with a specific contribution verb."));
  noActionBullets.forEach((entry) => addRewriteTarget(entry, "Makes the candidate's contribution explicit."));
  actionBullets.filter((entry) => !METRIC.test(entry.text) || !OUTCOME.test(entry.text)).forEach((entry) => addRewriteTarget(entry, "Adds places for verified scope and outcome evidence."));
  typoLines.filter((entry) => BULLET.test(entry.text)).forEach((entry) => addRewriteTarget(entry, "Corrects spelling before the resume is submitted."));
  const rewrites = [...rewriteTargets.values()].slice(0, 6).map(({ entry, reasons }) => buildRewrite(entry, roleKey, uniq(reasons), targetRole));

  const losses = [];
  const pushLoss = (loss) => losses.push(loss);
  const failedMandatory = mandatoryRequirements.filter((item) => !item.matched);
  if (failedMandatory.length) {
    const missingRequired = failedMandatory[0].missingSignals.join(" and ") || "the required capability";
    pushLoss({ category: "Mandatory match", points: Math.min(14, failedMandatory.length * 4), title: "Mandatory job requirements lack proof", detail: failedMandatory.slice(0, 3).map((item) => item.text).join(" | "), evidence: null, action: "Address each required capability with evidence or do not claim the match.", suggestedChange: `If true, add: “Applied ${missingRequired} while delivering [specific task], for [verified scope], resulting in [verified outcome].” If not, treat ${missingRequired} as a learning priority.` });
  }
  if (impact < 72) {
    const target = actionBullets.find((entry) => !METRIC.test(entry.text) || !OUTCOME.test(entry.text)) || bulletLines[0] || null;
    const rewrite = target ? buildRewrite(target, roleKey, [], targetRole) : null;
    pushLoss({ category: "Impact", points: Math.min(10, Math.max(2, Math.round((72 - impact) * .16))), title: "Outcomes are under-evidenced", detail: `${metricBullets.length}/${Math.max(1, bulletLines.length)} bullets include measurable scale and ${outcomeBullets.length}/${Math.max(1, bulletLines.length)} state an outcome.`, evidence: target, action: "Add verified scope and result to the most relevant bullets.", suggestedChange: rewrite?.suggested || `Use: “Delivered [specific work] ${OUTCOME_TEMPLATES[roleKey]}.”` });
  }
  if (evidenceStrength < 68) pushLoss({ category: "Skill evidence", points: Math.min(12, Math.max(3, Math.round((68 - evidenceStrength) * .16))), title: "Skills are listed more often than demonstrated", detail: `${demonstrated.length} demonstrated, ${listed.length} only listed, and ${missing.length} missing for ${rubric.label}.`, evidence: listed[0]?.evidence || null, action: "Move the most relevant skills into project or experience bullets that explain how they were used.", suggestedChange: listed[0] ? `Instead of only listing “${listed[0].skill}”, add: “Built [specific deliverable] using ${listed[0].skill}, ${OUTCOME_TEMPLATES[roleKey]}.”` : `Add: “Built [specific deliverable] using [relevant skill], ${OUTCOME_TEMPLATES[roleKey]}.”` });
  if (roleRelevance < 62) pushLoss({ category: "Role relevance", points: Math.min(12, Math.max(3, Math.round((62 - roleRelevance) * .18))), title: `Missing ${rubric.label} evidence`, detail: `${missing.slice(0, 4).map((item) => item.skill).join(", ")} are not supported by resume lines.`, evidence: null, action: "Prioritize the missing capabilities required by the target job; do not keyword-stuff.", suggestedChange: `If true, add: “Created [specific project/deliverable] using ${missing.slice(0, 2).map((item) => item.skill).join(" and ") || "a target skill"}, ${OUTCOME_TEMPLATES[roleKey]}.” Otherwise build a small project before claiming the skill.` });
  if (parseability < 82) pushLoss({ category: "ATS structure", points: Math.min(8, Math.max(2, Math.round((82 - parseability) * .12))), title: "Resume structure needs attention", detail: `Missing sections: ${missingSections.join(", ") || "none"}. Found ${contactCount}/3 contact signals; resume length is ${wordCount} words.`, evidence: sectionLines[0] || null, action: "Use standard headings, complete contact details, and enough evidence for the target seniority.", suggestedChange: `Use this order: Contact details → Summary → Skills → Experience → Projects → Education. Add ${missingSections.join(" and ") || "a professional link and role-relevant evidence"}.` });
  if (weakBullets.length || noActionBullets.length) {
    const target = weakBullets[0] || noActionBullets[0];
    pushLoss({ category: "Clarity", points: Math.min(7, weakBullets.length * 2 + noActionBullets.length), title: "Bullets hide the candidate's contribution", detail: `${weakBullets.length} vague opening(s) and ${noActionBullets.length} bullet(s) without a clear action verb.`, evidence: target, action: "Start with the actual contribution, then add scope and outcome.", suggestedChange: buildRewrite(target, roleKey, [], targetRole).suggested });
  }
  if (vagueLines.length) pushLoss({ category: "Clarity", points: Math.min(5, vagueLines.length * 2), title: "Generic claims are not evidence", detail: "Claims such as hard-working or team player are not verifiable without an example.", evidence: vagueLines[0], action: "Replace the claim with one situation that proves the behavior.", suggestedChange: `Replace “${vagueLines[0].text}” with: “Led/Supported [specific situation] with [team/stakeholder], resulting in [verified outcome].”` });
  if (typoLines.length) pushLoss({ category: "Consistency", points: Math.min(5, typoLines.length * 2), title: "Spelling errors reduce credibility", detail: `${typoLines.length} likely spelling error${typoLines.length === 1 ? "" : "s"} detected.`, evidence: typoLines[0], action: "Correct the flagged wording and proofread proper nouns manually.", suggestedChange: `Replace with: “${correctTypos(typoLines[0].text)}”` });
  if (longBullets.length) pushLoss({ category: "Clarity", points: Math.min(4, longBullets.length), title: "Some bullets are difficult to scan", detail: `${longBullets.length} bullet${longBullets.length === 1 ? "" : "s"} exceed 34 words.`, evidence: longBullets[0], action: "Keep one contribution and one outcome per bullet.", suggestedChange: "Split this into: “Delivered [primary contribution], resulting in [verified outcome].” Put secondary context in a separate bullet." });
  if (duplicateCount) pushLoss({ category: "Consistency", points: Math.min(5, duplicateCount * 2), title: "Repeated statements need review", detail: `${duplicateCount} repeated line${duplicateCount === 1 ? "" : "s"} detected.`, evidence: null, action: "Remove duplicates or distinguish the scope of each achievement.", suggestedChange: "Keep the stronger version once; use the freed space for a different role-relevant achievement." });

  const strengths = [
    ...demonstrated.slice(0, 3).map((item) => ({ title: `${item.skill} is demonstrated`, evidence: item.evidence })),
    ...(metricBullets.length ? [{ title: `${metricBullets.length} quantified impact statement${metricBullets.length === 1 ? "" : "s"}`, evidence: metricBullets[0] }] : []),
    ...(parseability >= 82 ? [{ title: "ATS-readable core structure", evidence: null }] : [])
  ].slice(0, 4);

  const requiredSignals = uniq(failedMandatory.flatMap((item) => item.signals));
  const skillDevelopment = [
    ...requiredSignals.filter((signal) => !skillEvidence.some((item) => item.skill === signal && item.level !== "missing")).map((skill) => ({ skill, status: "Required by job", priority: "Critical", why: `The job description requires ${skill}, but the resume does not provide matching evidence.`, nextStep: `If you have this experience, document it precisely. If not, complete a focused project or course before claiming it.`, resumeChange: `“Applied ${skill} to [specific task], for [verified scope], resulting in [verified outcome].”` })),
    ...listed.map((item) => ({ skill: item.skill, status: "Listed, not proven", priority: "High", why: `The resume names ${item.skill}, but no experience/project bullet shows how it was used.`, nextStep: `Build or document one real task using ${item.skill}; be ready to explain the decision, difficulty, and result.`, resumeChange: `“Built [specific deliverable] using ${item.skill}, ${OUTCOME_TEMPLATES[roleKey]}.”` })),
    ...missing.map((item) => ({ skill: item.skill, status: "Missing role signal", priority: "Medium", why: `${item.skill} is common in the ${rubric.label} rubric but is absent from the resume.`, nextStep: `Check real target job descriptions before investing time; then build one portfolio-sized example if the skill is repeatedly required.`, resumeChange: `“Created [specific deliverable] using ${item.skill}, ${OUTCOME_TEMPLATES[roleKey]}.”` }))
  ].filter((item, index, rows) => rows.findIndex((other) => other.skill === item.skill) === index).slice(0, 6);

  const simulation = [
    { id: "impact", label: "Add verified scale or outcomes", gain: Math.min(8, Math.max(2, Math.round((78 - impact) * .12))) },
    { id: "evidence", label: "Demonstrate missing role skills", gain: Math.min(7, Math.max(2, Math.round((76 - evidenceStrength) * .1))) },
    { id: "structure", label: "Resolve ATS structure issues", gain: Math.min(4, Math.max(1, Math.round((82 - parseability) * .07))) }
  ];

  return {
    score, confidence, confidenceValue, role: { key: roleKey, label: rubric.label, targetRole, seniority },
    categories, strengths, losses: losses.sort((a, b) => b.points - a.points).slice(0, 9), skillEvidence, skillDevelopment, rewrites, simulation,
    job: { ...jd, requirements: { mandatory: mandatoryRequirements, preferred: preferredRequirements }, matchedTerms: demonstrated.map((item) => item.skill).slice(0, 14), missingRoleTerms: missing.map((item) => item.skill).slice(0, 8) },
    resume: { wordCount, lines: sectionLines, sections: uniq(sectionLines.map((entry) => entry.section)), parseWarnings: parseability < 82 ? ["Use standard section headings, complete contact details, and avoid text-box-only content."] : [] },
    metadata: { modelVersion: "rules-2.0", rubricVersion: `role-${roleKey}-2.0`, generatedAt: new Date().toISOString(), decisionSupportOnly: true }
  };
}

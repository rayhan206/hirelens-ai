export const demoResumeText = `MAYA RAO
maya.rao@example.com · +91 98765 43210 · behance.net/mayarao

SUMMARY
Product designer with 4 years of experience creating accessible web and mobile products.

EXPERIENCE
Product Designer, FinPay Technologies — Bengaluru | Jan 2022 – Present
- Worked on the onboarding experience for the mobile app.
- Collaborated with PMs and engineers to ship user-centered features.
- Conducted user research and usability testing with 18 participants.
- Increased feature adoption by 18% over 3 months.

Junior Designer, CloudSoft — Bengaluru | Jun 2020 – Dec 2021
- Responsible for wireframes and high-fidelity prototypes.
- Created reusable interaction patterns in Figma.

PROJECTS
- Designed a finance habit tracker from interviews through tested prototype.

SKILLS
Figma, user research, wireframes, prototypes, interaction design, Adobe

EDUCATION
B.Des Interaction Design, 2020`;

export const demoAnalysis = {
  score: 78, confidence: "High", confidenceValue: 84,
  role: { key: "design", label: "Design & Creative", targetRole: "Product Designer", seniority: "Mid-level" },
  categories: [
    { name: "Role relevance", score: 82, weight: 20 }, { name: "Skill evidence", score: 74, weight: 15 },
    { name: "Impact", score: 68, weight: 15 }, { name: "ATS structure", score: 88, weight: 10 }, { name: "Clarity", score: 76, weight: 8 }
  ],
  strengths: [
    { title: "User research is demonstrated", evidence: { line: 9, text: "Conducted user research and usability testing with 18 participants." } },
    { title: "A verified outcome is clearly quantified", evidence: { line: 10, text: "Increased feature adoption by 18% over 3 months." } },
    { title: "Figma is supported by project evidence", evidence: { line: 13, text: "Created reusable interaction patterns in Figma." } }
  ],
  losses: [
    { category: "Impact", points: 6, title: "No measurable outcome", detail: "The onboarding bullet says what changed but not the verified result.", evidence: { line: 7, text: "Worked on the onboarding experience for the mobile app." }, action: "Add a verified outcome, scale or learning if you have one." },
    { category: "Clarity", points: 4, title: "Weak bullet opening", detail: "“Responsible for” hides your level of ownership.", evidence: { line: 12, text: "Responsible for wireframes and high-fidelity prototypes." }, action: "Use an action verb that accurately reflects your contribution." },
    { category: "Role relevance", points: 3, title: "Design system evidence is missing", detail: "The skill is relevant to the target role but not present in a project or role.", evidence: null, action: "Only add it if you can point to a real component, guideline or contribution." }
  ],
  skillEvidence: [
    { skill: "user research", level: "demonstrated", evidence: { line: 9, text: "Conducted user research and usability testing with 18 participants." } },
    { skill: "figma", level: "demonstrated", evidence: { line: 13, text: "Created reusable interaction patterns in Figma." } },
    { skill: "prototype", level: "demonstrated", evidence: { line: 15, text: "Designed a finance habit tracker from interviews through tested prototype." } },
    { skill: "design system", level: "missing", evidence: null }, { skill: "accessibility", level: "listed", evidence: { line: 4, text: "Product designer with 4 years of experience creating accessible web and mobile products." } }
  ],
  rewrites: [{ line: 7, original: "Worked on the onboarding experience for the mobile app.", suggested: "Contributed to redesigning the mobile app onboarding experience.", reason: "Clarifies the task without changing your level of ownership or inventing a result.", missingInformation: "What changed after launch: completion, activation, support tickets, or user feedback?" }],
  simulation: [{ id: "impact", label: "Add verified outcomes to 3 bullets", gain: 5 }, { id: "evidence", label: "Demonstrate design system experience", gain: 2 }, { id: "structure", label: "Add a clear portfolio link label", gain: 1 }],
  job: { matchedTerms: ["figma", "user research", "prototype"], missingRoleTerms: ["design system", "accessibility testing", "a/b testing"] },
  resume: { lines: demoResumeText.split("\n").filter(Boolean).map((text, index) => ({ line: index + 1, text, section: "resume" })), wordCount: 132 },
  metadata: { modelVersion: "rules-1.0", rubricVersion: "role-design-1.0", decisionSupportOnly: true }
};

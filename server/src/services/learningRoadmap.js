const SKILL_GUIDES = {
  accessibility: { effort: "4–6 hours", learn: "Complete a WCAG and WAI-ARIA fundamentals module, then audit one interface with keyboard and screen-reader checks.", build: "Publish an accessibility audit with issues, fixes, and before/after evidence." },
  javascript: { effort: "8–10 hours", learn: "Practice arrays, objects, async code, error handling, and DOM events through focused exercises.", build: "Build a small interactive application with clean state handling and documented edge cases." },
  typescript: { effort: "5–7 hours", learn: "Model objects, API responses, unions, and reusable generics in a small TypeScript exercise set.", build: "Convert one JavaScript project to strict TypeScript and document the errors the type system prevented." },
  react: { effort: "6–8 hours", learn: "Build components using props, state, effects, forms, and accessible interaction patterns.", build: "Ship a responsive React feature with loading, empty, error, and success states." },
  node: { effort: "6–8 hours", learn: "Create REST endpoints with validation, authentication basics, structured errors, and tests.", build: "Publish a documented Node API backed by a real database and an automated test suite." },
  api: { effort: "4–6 hours", learn: "Study HTTP methods, status codes, pagination, validation, authentication, and resilient error handling.", build: "Integrate a real API into a searchable interface with loading, retry, empty, and failure states." },
  database: { effort: "6–8 hours", learn: "Practice schema design, joins, indexes, constraints, and query-plan inspection.", build: "Design a small production-style schema and document two query or indexing improvements." },
  testing: { effort: "5–7 hours", learn: "Write unit, integration, and one end-to-end test for a feature you already built.", build: "Add a CI-tested quality suite covering success, failure, and edge cases." },
  git: { effort: "2–3 hours", learn: "Practice feature branches, small commits, rebasing, resolving conflicts, and pull-request review.", build: "Present a clean project history with an issue, focused commits, and a reviewed pull request." },
  cloud: { effort: "6–8 hours", learn: "Learn deployment configuration, secrets, logs, health checks, and basic cost awareness on one cloud platform.", build: "Deploy a project with environment configuration, monitoring, and a short operations runbook." },
  deployment: { effort: "4–6 hours", learn: "Containerize an application and automate build, test, and deployment checks.", build: "Create a repeatable deployment pipeline with health checks and rollback notes." },
  "system design": { effort: "6–8 hours", learn: "Practice requirements, data flow, APIs, storage, caching, failure modes, and trade-offs on two cases.", build: "Write one system-design document with a diagram, scale assumptions, and rejected alternatives." },
  performance: { effort: "4–6 hours", learn: "Profile one application, identify the actual bottleneck, and measure a before/after improvement.", build: "Publish a performance case study with method, measurements, change, and verified result." },
  python: { effort: "6–8 hours", learn: "Practice functions, data structures, files, exceptions, environments, and testable modules.", build: "Create a documented Python analysis or automation tool with tests and reproducible setup." },
  sql: { effort: "6–8 hours", learn: "Solve joins, aggregations, window functions, CTEs, and query-optimization exercises.", build: "Publish a business analysis using a relational dataset and explain each query decision." },
  "machine learning": { effort: "10–12 hours", learn: "Study train/validation/test splits, leakage, baselines, evaluation metrics, and error analysis.", build: "Train and evaluate a baseline model with reproducible data preparation and honest limitations." },
  statistics: { effort: "8–10 hours", learn: "Practice distributions, sampling, confidence intervals, hypothesis testing, and experiment interpretation.", build: "Write an analysis that selects and defends a statistical method for a real question." },
  pandas: { effort: "4–6 hours", learn: "Practice cleaning, joins, grouping, missing data, vectorization, and validation on a messy dataset.", build: "Publish a reproducible notebook that turns raw data into checked, decision-ready outputs." },
  dataset: { effort: "4–6 hours", learn: "Study data dictionaries, missingness, leakage, bias, validation rules, and versioning.", build: "Create a dataset quality report with checks, failures, fixes, and documented limitations." },
  experiment: { effort: "5–7 hours", learn: "Define a hypothesis, primary metric, guardrails, sample assumptions, and interpretation rules.", build: "Produce an experiment brief plus a mock readout that explains uncertainty and next decisions." },
  visualization: { effort: "4–6 hours", learn: "Practice choosing chart types, labeling clearly, reducing clutter, and highlighting the decision-relevant signal.", build: "Create a compact dashboard with three charts and a written explanation of the design choices." },
  analytics: { effort: "5–7 hours", learn: "Translate a business question into metrics, segments, validation checks, and a concise conclusion.", build: "Publish an analysis that moves from question to validated recommendation and limitations." },
  figma: { effort: "4–6 hours", learn: "Practice auto layout, components, variants, constraints, and accessible handoff annotations.", build: "Create a responsive component set and a developer-ready interaction handoff." },
  "user research": { effort: "6–8 hours", learn: "Write a research plan, recruit ethically, conduct interviews, code themes, and separate evidence from assumptions.", build: "Publish a concise research report connecting observations to design decisions." },
  excel: { effort: "5–7 hours", learn: "Practice structured formulas, lookups, pivots, error checks, scenario analysis, and clear model organization.", build: "Create an auditable model with assumptions, calculations, outputs, and validation checks." },
  "financial modeling": { effort: "10–12 hours", learn: "Build linked statements, assumptions, scenarios, sensitivities, and error checks from a clean template.", build: "Deliver a documented model with base, upside, and downside cases and key decision drivers." },
  seo: { effort: "4–6 hours", learn: "Study search intent, technical crawlability, on-page structure, internal linking, and measurement.", build: "Audit a site and publish a prioritized SEO plan with baseline and follow-up metrics." }
};

const ROLE_INTERVIEW = {
  software: ["Technical problem solving", "System design explanation", "Behavioral evidence"],
  data: ["Analysis case practice", "Model and metric trade-offs", "Behavioral evidence"],
  finance: ["Commercial case practice", "Model assumptions and checks", "Stakeholder evidence"],
  consulting: ["Structured case practice", "Recommendation synthesis", "Stakeholder evidence"],
  marketing: ["Growth case practice", "Experiment and metric trade-offs", "Stakeholder evidence"],
  design: ["Portfolio walkthrough", "Design critique practice", "Research and stakeholder evidence"],
  research: ["Methods defense", "Paper and finding explanation", "Collaboration evidence"]
};

const INTERVIEW_GUIDES = {
  "Technical problem solving": ["6–8 hours", "Solve five representative problems aloud and review correctness, complexity, and edge cases.", "Publish commented solutions plus a short mistake log."],
  "System design explanation": ["4–6 hours", "Practice one architecture case from requirements through trade-offs and failure modes.", "Produce a system-design document and a five-minute walkthrough."],
  "Analysis case practice": ["5–7 hours", "Solve three analysis cases by defining the question, checks, method, and decision.", "Publish one case with reproducible calculations and limitations."],
  "Model and metric trade-offs": ["4–6 hours", "Explain model choice, baselines, metrics, leakage, and error analysis for one project.", "Create a model card and a concise trade-off summary."],
  "Commercial case practice": ["5–7 hours", "Work through three commercial cases with assumptions, calculations, sensitivities, and recommendations.", "Write one decision memo supported by an auditable model."],
  "Model assumptions and checks": ["4–6 hours", "Defend the assumptions and validation checks in one financial model.", "Create an assumptions register and model-check summary."],
  "Structured case practice": ["5–7 hours", "Solve three cases using a clear issue tree, prioritized analysis, and synthesized answer.", "Publish one case summary showing the reasoning path and recommendation."],
  "Recommendation synthesis": ["3–4 hours", "Turn a page of analysis into a one-minute answer with evidence, risk, and next step.", "Record three concise recommendation walkthroughs."],
  "Growth case practice": ["5–7 hours", "Diagnose a funnel, choose a segment, propose an experiment, and define success and guardrails.", "Publish a growth experiment brief with measurement plan."],
  "Experiment and metric trade-offs": ["4–6 hours", "Compare primary metrics, guardrails, attribution limits, and decision thresholds.", "Create an experiment readout with a go/no-go recommendation."],
  "Portfolio walkthrough": ["4–6 hours", "Practice explaining problem, constraints, research, iterations, decisions, and outcome for two projects.", "Record a ten-minute portfolio walkthrough and revise weak sections."],
  "Design critique practice": ["3–4 hours", "Critique three interfaces using user goals, hierarchy, accessibility, and trade-offs.", "Publish one structured critique with a revised flow."],
  "Research and stakeholder evidence": ["3–4 hours", "Prepare two stories showing how research or stakeholder evidence changed a decision.", "Write concise STAR/CAR stories with verifiable outcomes."],
  "Methods defense": ["5–7 hours", "Defend method choice, sampling, validity, limitations, and alternative approaches for one study.", "Create a methods defense sheet with likely questions and answers."],
  "Paper and finding explanation": ["4–6 hours", "Explain one paper's question, method, result, uncertainty, and contribution to a non-specialist.", "Record a five-minute research explanation and refine unclear sections."],
  "Behavioral evidence": ["3–4 hours", "Write and rehearse three stories covering ownership, conflict, and learning from a setback.", "Create a behavioral story bank with situation, action, and verified result."],
  "Stakeholder evidence": ["3–4 hours", "Prepare three examples of influencing, disagreement, and decision-making with stakeholders.", "Create a stakeholder story bank with evidence and outcomes."],
  "Collaboration evidence": ["3–4 hours", "Prepare examples covering authorship, peer feedback, disagreement, and shared research work.", "Create a collaboration story bank with your exact contribution." ]
};

const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function guideFor(item) {
  return SKILL_GUIDES[item.skill.toLowerCase()] || {
    effort: "4–6 hours",
    learn: `Complete one focused course or documentation path for ${item.skill}, then solve three practical exercises without copying a tutorial.`,
    build: `Create a small, reviewable project proving ${item.skill}; document the decisions, limitations, and result.`
  };
}

function skillStep(item, phaseId, index) {
  const guide = guideFor(item);
  return { id: `${phaseId}-${slug(item.skill)}`, number: index + 1, skill: item.skill, why: item.why, effort: guide.effort, learnTask: guide.learn, deliverable: guide.build, source: item.status };
}

function interviewStep(title, roleKey, index) {
  const [effort, learnTask, deliverable] = INTERVIEW_GUIDES[title] || INTERVIEW_GUIDES["Behavioral evidence"];
  return { id: `interview-${slug(title)}`, number: index + 1, skill: title, why: `Build interview-ready proof for the ${roleKey} role family instead of relying on memorized claims.`, effort, learnTask, deliverable, source: "Interview readiness" };
}

export function buildLearningRoadmap({ skillDevelopment = [], roleKey, targetRole }) {
  const foundations = skillDevelopment.filter((item) => item.priority === "Critical" || item.priority === "Medium").slice(0, 3);
  const foundationIds = new Set(foundations.map((item) => item.skill));
  const proof = skillDevelopment.filter((item) => !foundationIds.has(item.skill)).slice(0, 3);
  if (!foundations.length && proof.length) foundations.push(proof.shift());
  const interview = (ROLE_INTERVIEW[roleKey] || ROLE_INTERVIEW.software).map((title, index) => interviewStep(title, roleKey, index));
  const phases = [
    { id: "foundations", title: "Foundations", description: "Learn the highest-priority gaps required for the target role.", steps: foundations.map((item, index) => skillStep(item, "foundations", index)) },
    { id: "proof", title: "Build proof", description: "Turn listed knowledge into work a recruiter can inspect and discuss.", steps: proof.map((item, index) => skillStep(item, "proof", index)) },
    { id: "interview", title: "Interview readiness", description: "Practice explaining decisions, trade-offs, and verified outcomes.", steps: interview }
  ].filter((phase) => phase.steps.length);
  return { targetRole, phases, totalSteps: phases.reduce((sum, phase) => sum + phase.steps.length, 0), generatedFrom: "verified-skill-gaps" };
}

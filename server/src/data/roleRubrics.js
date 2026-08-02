export const ROLE_RUBRICS = {
  software: {
    label: "Software Engineering",
    terms: ["javascript", "typescript", "react", "node", "api", "database", "testing", "git", "cloud", "deployment", "system design", "performance"],
    evidence: ["built", "implemented", "deployed", "optimized", "tested", "designed", "shipped"],
    preferredSections: ["skills", "experience", "projects", "education"]
  },
  data: {
    label: "Data & ML",
    terms: ["python", "sql", "machine learning", "statistics", "pandas", "model", "dataset", "experiment", "accuracy", "deployment", "visualization", "analytics"],
    evidence: ["trained", "evaluated", "analysed", "modeled", "predicted", "deployed", "measured"],
    preferredSections: ["skills", "experience", "projects", "education"]
  },
  finance: {
    label: "Finance & MBA",
    terms: ["financial modeling", "excel", "valuation", "accounting", "audit", "forecast", "budget", "strategy", "market research", "stakeholder", "revenue", "cost"],
    evidence: ["modeled", "forecasted", "reconciled", "audited", "advised", "reduced", "increased"],
    preferredSections: ["summary", "experience", "education", "certifications"]
  },
  consulting: {
    label: "Consulting",
    terms: ["strategy", "analysis", "client", "stakeholder", "market", "operations", "problem solving", "presentation", "research", "recommendation", "leadership"],
    evidence: ["advised", "led", "analysed", "recommended", "delivered", "facilitated", "improved"],
    preferredSections: ["experience", "education", "leadership", "projects"]
  },
  marketing: {
    label: "Marketing & Sales",
    terms: ["campaign", "conversion", "seo", "content", "brand", "analytics", "crm", "sales", "pipeline", "audience", "research", "revenue"],
    evidence: ["launched", "grew", "converted", "managed", "generated", "increased", "optimized"],
    preferredSections: ["summary", "experience", "skills", "projects"]
  },
  design: {
    label: "Design & Creative",
    terms: ["figma", "portfolio", "user research", "wireframe", "prototype", "design system", "usability", "visual design", "interaction", "adobe", "brand", "accessibility"],
    evidence: ["designed", "researched", "prototyped", "tested", "shipped", "illustrated", "directed"],
    preferredSections: ["portfolio", "experience", "projects", "skills"]
  },
  research: {
    label: "Research & Academic",
    terms: ["research", "publication", "methodology", "dataset", "experiment", "literature", "conference", "citation", "teaching", "laboratory", "thesis", "analysis"],
    evidence: ["published", "investigated", "evaluated", "presented", "authored", "conducted", "validated"],
    preferredSections: ["research", "publications", "education", "experience"]
  }
};

export const DEFAULT_ROLE = "software";

export function resolveRole(role = "") {
  const value = role.toLowerCase();
  if (/data|machine learning|analytics|ai/.test(value)) return "data";
  if (/finance|mba|account|bank|commerce/.test(value)) return "finance";
  if (/consult|business analyst|strategy/.test(value)) return "consulting";
  if (/market|sales|growth/.test(value)) return "marketing";
  if (/design|creative|ux|ui/.test(value)) return "design";
  if (/research|academic|phd|scientist/.test(value)) return "research";
  return DEFAULT_ROLE;
}

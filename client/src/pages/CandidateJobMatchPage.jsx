import { AlertCircle, CheckCircle2, FileText, X } from "lucide-react";
import { Link } from "react-router-dom";
import CandidatePageShell from "../components/CandidatePageShell";
import { useCandidate } from "../components/CandidateProvider";

export default function CandidateJobMatchPage() {
  const { analysis, loading } = useCandidate();
  if (loading) return <CandidatePageShell><div className="center-panel"><span className="spinner" /> Loading job match…</div></CandidatePageShell>;
  if (!analysis) return <CandidatePageShell><div className="no-analysis-inline"><FileText /><h1>No job match yet.</h1><p>Analyze a resume against a role or job description first.</p><Link className="button button-primary" to="/candidate/dashboard">Go to Overview</Link></div></CandidatePageShell>;
  const groups = [
    ["Demonstrated skills", "Evidence appears in experience, projects or outcomes.", "demonstrated", CheckCircle2],
    ["Listed only", "Present in the resume, but not supported by a concrete example.", "listed", AlertCircle],
    ["Missing evidence", "Relevant to the role, but absent from this resume.", "missing", X]
  ];
  return <CandidatePageShell><div className="dashboard job-match-page"><div className="page-title"><div><h1>Role and job match</h1><p>{analysis.role.targetRole} · Skills are classified by evidence strength</p></div></div><div className="match-columns">{groups.map(([title, description, level, Icon]) => <section key={level} className={level}><header><Icon /><div><h2>{title}</h2><p>{description}</p></div><span>{analysis.skillEvidence.filter((item) => item.level === level).length}</span></header>{analysis.skillEvidence.filter((item) => item.level === level).map((item) => <article key={item.skill}><strong>{item.skill}</strong>{item.evidence ? <p>Line {item.evidence.line}: “{item.evidence.text}”</p> : <p>Add only if you can support it truthfully.</p>}</article>)}</section>)}</div>{analysis.job.matchedTerms.length || analysis.job.missingRoleTerms.length ? <section className="jd-summary"><h2>Job-description signals</h2><div><article><h3>Matched terms</h3><p>{analysis.job.matchedTerms.join(", ") || "No exact JD terms matched."}</p></article><article><h3>Role terms to verify</h3><p>{analysis.job.missingRoleTerms.join(", ") || "No major role terms are missing."}</p></article></div></section> : null}</div></CandidatePageShell>;
}

import { ArrowRight, CheckCircle2, FileSearch, ShieldCheck, Sparkles, Target, Upload } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CandidatePageShell from "../components/CandidatePageShell";
import AnalyzerModal from "../components/AnalyzerModal";
import { useCandidate } from "../components/CandidateProvider";

function ScoreRing({ score }) {
  return <div className="score-ring" style={{ "--score": score }}><div><strong>{score}</strong><span>Overall score</span><small>/100</small></div></div>;
}

export default function CandidateDashboard() {
  const { analysis, loading } = useCandidate();
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const navigate = useNavigate();
  if (loading) return <CandidatePageShell><div className="center-panel"><span className="spinner" /> Loading your workspace…</div></CandidatePageShell>;
  if (!analysis) return <CandidatePageShell><div className="dashboard"><section className="first-use-empty"><div className="empty-visual"><FileSearch /><span /><span /></div><div><h1>Analyze your resume now.</h1><p>Upload a resume, choose the role you are targeting and optionally paste a job description. HireLens will then create your first role-specific score and evidence-linked improvement plan.</p><button className="button button-primary button-large" onClick={() => setShowAnalyzer(true)}><Upload /> Start resume analysis</button><ul><li><ShieldCheck /> Your score is never generated before a resume is provided.</li><li><CheckCircle2 /> Rewrites cannot invent metrics, titles or achievements.</li><li><Target /> Technical, MBA, creative and research roles use different rubrics.</li></ul></div></section></div>{showAnalyzer ? <AnalyzerModal onClose={() => setShowAnalyzer(false)} onComplete={() => { setShowAnalyzer(false); navigate("/candidate/analysis"); }} /> : null}</CandidatePageShell>;
  return <CandidatePageShell><div className="dashboard candidate-home"><div className="page-title"><div><h1>Your latest analysis</h1><p>{analysis.role.targetRole} · {analysis.role.seniority} · {analysis.role.label}</p></div></div><section className="score-summary"><ScoreRing score={analysis.score} /><div className="confidence-block"><div className="confidence-icon"><ShieldCheck /></div><div><strong>{analysis.confidence} confidence</strong><p>{analysis.confidenceValue}% extraction and evidence confidence</p></div></div><div className="next-step"><span><Sparkles /> Next best step</span><h2>{analysis.losses[0]?.action || "Review the final application-readiness checks."}</h2><Link to="/candidate/analysis">View the supporting evidence <ArrowRight /></Link></div></section><div className="workspace-links"><Link to="/candidate/analysis"><FileSearch /><div><h2>Detailed analysis</h2><p>See every category score, deduction and exact resume line.</p></div><ArrowRight /></Link><Link to="/candidate/suggestions"><Sparkles /><div><h2>Suggestions</h2><p>Review truth-locked rewrites and your ordered action plan.</p></div><ArrowRight /></Link><Link to="/candidate/job-match"><Target /><div><h2>Job match</h2><p>Separate demonstrated, listed and missing skills.</p></div><ArrowRight /></Link></div></div></CandidatePageShell>;
}

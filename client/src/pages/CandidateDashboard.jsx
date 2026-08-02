import { AlertCircle, ArrowRight, BriefcaseBusiness, Check, CheckCircle2, ChevronRight, FileText, Info, Lightbulb, RefreshCw, ShieldCheck, Sparkles, Target, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { api } from "../lib/api";
import { demoAnalysis, demoResumeText } from "../data/demo";

function ScoreRing({ score }) {
  return <div className="score-ring" style={{ "--score": score }}><div><strong>{score}</strong><span>Overall score</span><small>/100</small></div></div>;
}

function AnalyzerModal({ onClose, onComplete }) {
  const [mode, setMode] = useState("text");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try { const { analysis } = await api("/analysis/resume", { method: "POST", body: form }); onComplete(analysis); onClose(); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="analyse-title"><header><div><h2 id="analyse-title">Analyze a resume</h2><p>Choose a role family and optionally add a job description for precise matching.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X /></button></header><form onSubmit={submit}>
    <div className="form-grid"><label>Target role<input name="targetRole" defaultValue="Product Designer" required /></label><label>Seniority<select name="seniority" defaultValue="Mid-level"><option>Fresher / Internship</option><option>Junior</option><option>Mid-level</option><option>Senior / Managerial</option></select></label></div>
    <div className="input-tabs"><button type="button" className={mode === "text" ? "active" : ""} onClick={() => setMode("text")}>Paste text</button><button type="button" className={mode === "file" ? "active" : ""} onClick={() => setMode("file")}>Upload PDF/DOCX</button></div>
    {mode === "text" ? <label>Resume text<textarea name="resumeText" rows="10" defaultValue={demoResumeText} required /></label> : <label className="file-drop"><Upload /><strong>Choose a resume</strong><span>PDF, DOCX or TXT · max 8 MB</span><input name="resume" type="file" accept=".pdf,.docx,.txt" required /></label>}
    <label>Job description <span className="optional">Optional</span><textarea name="jobDescription" rows="5" placeholder="Paste the target job description to separate mandatory, preferred and missing requirements." /></label>
    {error ? <div className="form-error">{error}</div> : null}<footer><span><ShieldCheck /> Protected traits are excluded from scoring.</span><button className="button button-primary" disabled={busy}>{busy ? "Analyzing evidence…" : "Analyze resume"}</button></footer>
  </form></section></div>;
}

export default function CandidateDashboard() {
  const [analysis, setAnalysis] = useState(demoAnalysis);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [selectedLoss, setSelectedLoss] = useState(0);
  const [selectedImprovements, setSelectedImprovements] = useState(() => new Set(["impact", "evidence", "structure"]));
  const [rewriteState, setRewriteState] = useState("pending");
  const selectedEvidenceLine = analysis.losses[selectedLoss]?.evidence?.line;
  const potential = useMemo(() => Math.min(100, analysis.score + analysis.simulation.filter((item) => selectedImprovements.has(item.id)).reduce((sum, item) => sum + item.gain, 0)), [analysis, selectedImprovements]);
  const toggleImprovement = (id) => setSelectedImprovements((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });
  const firstRewrite = analysis.rewrites[0];
  return <AppShell role="candidate" action={<button className="button button-secondary" onClick={() => setShowAnalyzer(true)}><Upload /> Analyze another resume</button>}>
    <div className="dashboard candidate-dashboard">
      <div className="page-title"><div><h1>Your resume, explained.</h1><p>Target: <strong>{analysis.role.targetRole}</strong> · {analysis.role.seniority} · {analysis.role.label}</p></div><span className="model-label"><Info /> {analysis.metadata.rubricVersion}</span></div>
      <div className="candidate-layout"><div className="candidate-primary">
        <section className="score-summary"><ScoreRing score={analysis.score} /><div className="confidence-block"><div className="confidence-icon"><ShieldCheck /></div><div><strong>{analysis.confidence} confidence</strong><p>{analysis.confidenceValue}% extraction and evidence confidence</p></div></div><div className="next-step"><span><Sparkles /> Next best step</span><h2>{analysis.losses[0]?.action || "Your resume is ready for a final review."}</h2><button onClick={() => setSelectedLoss(0)}>View evidence <ArrowRight /></button></div></section>
        <section className="score-breakdown"><header><h2>Score breakdown</h2><Info /></header><div>{analysis.categories.slice(0, 5).map((category) => <div className="metric" key={category.name}><span>{category.name}</span><strong>{category.score}<small>/100</small></strong><i><b style={{ width: `${category.score}%` }} /></i></div>)}</div></section>
        <div className="evidence-grid"><section className="loss-panel"><header><h2>Why you lost marks</h2><span>{analysis.losses.reduce((sum, item) => sum + item.points, 0)} pts explained</span></header>{analysis.losses.map((loss, index) => <button className={`loss-row ${selectedLoss === index ? "selected" : ""}`} key={`${loss.category}-${loss.title}`} onClick={() => setSelectedLoss(index)}><span className={`status-dot ${loss.points >= 5 ? "risk" : "warning"}`} /><span><strong>{loss.title}</strong><small>{loss.detail}</small>{loss.evidence ? <em>Line {loss.evidence.line}: “{loss.evidence.text}”</em> : <em>Missing evidence</em>}</span><b>-{loss.points}</b></button>)}</section>
        <section className="resume-panel"><header><div><FileText /><span><strong>Resume preview</strong><small>{analysis.resume.wordCount} words · click an issue to locate evidence</small></span></div><button className="icon-button" aria-label="Reanalyze" onClick={() => setShowAnalyzer(true)}><RefreshCw /></button></header><div className="resume-paper">{analysis.resume.lines.slice(0, 28).map((line) => { const strength = analysis.strengths.some((item) => item.evidence?.line === line.line); const weak = selectedEvidenceLine === line.line || analysis.losses.some((item) => item.evidence?.line === line.line); return <p id={`line-${line.line}`} className={selectedEvidenceLine === line.line ? "line-selected" : strength ? "line-strong" : weak ? "line-weak" : ""} key={line.line}><span>{line.line}</span>{line.text}</p>; })}</div><footer><span><i className="legend-good" /> Strong</span><span><i className="legend-weak" /> Needs work</span></footer></section></div>
        {firstRewrite ? <section className="rewrite-panel"><div className="rewrite-intro"><Sparkles /><div><h2>Truth Lock rewrite</h2><p>Improves framing without adding unsupported facts.</p></div></div><div><span>Original · line {firstRewrite.line}</span><p>{firstRewrite.original}</p></div><div className="suggested"><span>Suggested</span><p>{firstRewrite.suggested}</p></div><div><span>Why</span><p>{firstRewrite.reason}</p>{firstRewrite.missingInformation ? <small><Lightbulb /> Before adding a result: {firstRewrite.missingInformation}</small> : null}</div><div className="rewrite-actions">{rewriteState === "pending" ? <><button className="button button-primary" onClick={() => setRewriteState("approved")}><Check /> Approve</button><button className="button button-secondary" onClick={() => setRewriteState("rejected")}><X /> Reject</button></> : <div className={`rewrite-result ${rewriteState}`}><CheckCircle2 /> Suggestion {rewriteState}</div>}</div></section> : null}
      </div><aside className="insight-rail">
        <section className="job-match"><header><h2><BriefcaseBusiness /> Job match</h2><button>View details <ChevronRight /></button></header><div className="match-group"><strong>Demonstrated <span>{analysis.skillEvidence.filter((item) => item.level === "demonstrated").length}</span></strong>{analysis.skillEvidence.filter((item) => item.level === "demonstrated").slice(0, 5).map((item) => <p key={item.skill}><CheckCircle2 /> {item.skill}</p>)}</div><div className="match-group"><strong>Listed only</strong>{analysis.skillEvidence.filter((item) => item.level === "listed").slice(0, 4).map((item) => <p key={item.skill}><AlertCircle /> {item.skill}</p>)}</div><div className="match-group missing"><strong>Missing evidence</strong>{analysis.skillEvidence.filter((item) => item.level === "missing").slice(0, 4).map((item) => <p key={item.skill}><X /> {item.skill}</p>)}</div></section>
        <section className="potential-card"><header><div><h2>Potential score</h2><p>Simulation, not a guaranteed ATS result.</p></div><Info /></header><div className="potential-score"><strong>{analysis.score}</strong><ArrowRight /><strong>{potential}</strong></div>{analysis.simulation.map((item) => <label key={item.id}><input type="checkbox" checked={selectedImprovements.has(item.id)} onChange={() => toggleImprovement(item.id)} /><span>{item.label}</span><b>+{item.gain}</b></label>)}<button className="button button-secondary">Review selected improvements</button></section>
        <section className="readiness"><header><Target /><div><h2>Application readiness</h2><p>{analysis.losses.length} high-value checks remain</p></div></header><ul><li><Check /> Contact details found</li><li><Check /> Core sections readable</li><li className="todo"><AlertCircle /> Review evidence gaps</li></ul></section>
      </aside></div>
    </div>{showAnalyzer ? <AnalyzerModal onClose={() => setShowAnalyzer(false)} onComplete={(result) => { setAnalysis(result); setSelectedLoss(0); setSelectedImprovements(new Set(result.simulation.map((item) => item.id))); setRewriteState("pending"); }} /> : null}
  </AppShell>;
}

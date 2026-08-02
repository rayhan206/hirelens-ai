import { ShieldCheck, Upload, X } from "lucide-react";
import { useState } from "react";
import { useCandidate } from "./CandidateProvider";

export default function AnalyzerModal({ onClose, onComplete }) {
  const [mode, setMode] = useState("file");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { analyze } = useCandidate();
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try { const result = await analyze(new FormData(event.currentTarget)); onComplete(result); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="analyse-title"><header><div><h2 id="analyse-title">Analyze your resume</h2><p>Your first score is created only after your resume is parsed against a target role.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X /></button></header><form onSubmit={submit}>
    <div className="form-grid"><label>Target role<input name="targetRole" placeholder="e.g. Product Designer" required /></label><label>Seniority<select name="seniority" defaultValue="Mid-level"><option>Fresher / Internship</option><option>Junior</option><option>Mid-level</option><option>Senior / Managerial</option></select></label></div>
    <div className="input-tabs"><button type="button" className={mode === "file" ? "active" : ""} onClick={() => setMode("file")}>Upload PDF/DOCX</button><button type="button" className={mode === "text" ? "active" : ""} onClick={() => setMode("text")}>Paste text</button></div>
    {mode === "file" ? <label className="file-drop"><Upload /><strong>Choose your resume</strong><span>PDF, DOCX or TXT · max 8 MB</span><input name="resume" type="file" accept=".pdf,.docx,.txt" required /></label> : <label>Resume text<textarea name="resumeText" rows="10" placeholder="Paste the complete resume text here." required /></label>}
    <label>Job description <span className="optional">Optional, but improves accuracy</span><textarea name="jobDescription" rows="5" placeholder="Paste the target job description to identify mandatory, preferred and missing requirements." /></label>
    {error ? <div className="form-error">{error}</div> : null}<footer><span><ShieldCheck /> Protected traits are excluded from scoring.</span><button className="button button-primary" disabled={busy}>{busy ? "Analyzing evidence…" : "Analyze resume"}</button></footer>
  </form></section></div>;
}

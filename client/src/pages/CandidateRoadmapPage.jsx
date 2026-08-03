import { ArrowRight, Check, CheckCircle2, Clock3, Map, Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CandidatePageShell from "../components/CandidatePageShell";
import { useCandidate } from "../components/CandidateProvider";

const STORAGE_KEY = "hirelens_roadmap_progress";
const EMPTY_PROGRESS = { version: 1, roadmaps: {} };

function readProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored?.version === 1 && stored.roadmaps ? stored : EMPTY_PROGRESS;
  } catch {
    return EMPTY_PROGRESS;
  }
}

export default function CandidateRoadmapPage() {
  const { analysis, loading } = useCandidate();
  const [progressStore, setProgressStore] = useState(readProgress);
  const roadmapKey = analysis ? `${analysis.role.key}:${analysis.role.targetRole.toLowerCase()}` : "no-analysis";
  const steps = useMemo(() => analysis?.roadmap?.phases.flatMap((phase) => phase.steps) || [], [analysis]);
  const completed = (progressStore.roadmaps[roadmapKey] || []).filter((id) => steps.some((step) => step.id === id));
  const [focusedStepId, setFocusedStepId] = useState(null);
  const nextStep = steps.find((step) => !completed.includes(step.id));
  const focusedStep = steps.find((step) => step.id === focusedStepId) || nextStep;
  const percentage = steps.length ? Math.round((completed.length / steps.length) * 100) : 0;

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(progressStore)); }, [progressStore]);

  const toggleStep = (stepId) => setProgressStore((current) => {
    const currentSteps = current.roadmaps[roadmapKey] || [];
    const nextSteps = currentSteps.includes(stepId) ? currentSteps.filter((id) => id !== stepId) : [...currentSteps, stepId];
    return { version: 1, roadmaps: { ...current.roadmaps, [roadmapKey]: nextSteps } };
  });

  if (loading) return <CandidatePageShell><div className="center-panel"><span className="spinner" /> Building your roadmap…</div></CandidatePageShell>;
  if (!analysis) return <CandidatePageShell><div className="no-analysis-inline"><Map /><h1>No roadmap yet.</h1><p>Analyze a resume first so the roadmap can use your actual target role and skill gaps.</p><Link className="button button-primary" to="/candidate/dashboard">Analyze a resume</Link></div></CandidatePageShell>;
  if (!analysis.roadmap?.phases?.length) return <CandidatePageShell><div className="no-analysis-inline"><Map /><h1>Refresh your analysis.</h1><p>This analysis predates Roadmap mode. Analyze the resume again to generate an ordered study plan.</p><Link className="button button-primary" to="/candidate/dashboard">Analyze again</Link></div></CandidatePageShell>;

  return <CandidatePageShell><div className="roadmap-page">
    <main className="roadmap-main">
      <div className="roadmap-title"><h1>Your learning roadmap</h1><p>A focused study plan based on your target role and verified skill gaps.</p></div>
      <section className="roadmap-progress" aria-label="Roadmap progress"><div><span>Overall progress</span><strong>{percentage}%</strong></div><i><b style={{ width: `${percentage}%` }} /></i><div><span>Target role</span><strong>{analysis.role.targetRole}</strong></div></section>
      <div className="roadmap-phases">{analysis.roadmap.phases.map((phase, phaseIndex) => <section className="roadmap-phase" key={phase.id}>
        <header><b>{phaseIndex + 1}</b><div><h2>{phase.title}</h2><p>{phase.description}</p><span>{phase.steps.length} step{phase.steps.length === 1 ? "" : "s"}</span></div></header>
        <div className="roadmap-step-list">{phase.steps.map((step, stepIndex) => {
          const isComplete = completed.includes(step.id);
          const isFocused = focusedStep?.id === step.id;
          return <article className={`${isComplete ? "complete" : ""} ${isFocused ? "focused" : ""}`} key={step.id} onClick={() => setFocusedStepId(step.id)}>
            <div className="roadmap-skill"><span>{phaseIndex + 1}.{stepIndex + 1}</span><strong>{step.skill}</strong><small>{step.source}</small></div>
            <div><span>Why it matters</span><p>{step.why}</p></div>
            <div className="roadmap-effort"><span>Est. effort</span><p><Clock3 /> {step.effort}</p></div>
            <div><span>Learn</span><p>{step.learnTask}</p></div>
            <div><span>Build proof</span><p>{step.deliverable}</p></div>
            <button className="roadmap-check" onClick={(event) => { event.stopPropagation(); toggleStep(step.id); }} aria-label={`${isComplete ? "Mark incomplete" : "Mark complete"}: ${step.skill}`} aria-pressed={isComplete}>{isComplete ? <Check /> : null}</button>
          </article>;
        })}</div>
      </section>)}</div>
      <footer className="roadmap-tip"><Target /><span><strong>Use the roadmap honestly.</strong> Mark a step complete only after finishing both the learning task and the portfolio proof.</span></footer>
    </main>
    <aside className="roadmap-week"><h2>This week</h2><p>Your next best action</p>{focusedStep ? <><section><span>Next step</span><h3>{focusedStep.skill}</h3><p>{focusedStep.learnTask}</p><button className="button button-primary" onClick={() => toggleStep(focusedStep.id)}>{completed.includes(focusedStep.id) ? <>Mark incomplete</> : <>Mark complete <ArrowRight /></>}</button></section><div><h3>Why this step?</h3><p>{focusedStep.why}</p></div><div><span>Time estimate</span><p><Clock3 /> {focusedStep.effort}</p></div><div><span>You’ll deliver</span><p>{focusedStep.deliverable}</p></div></> : <section className="roadmap-done"><CheckCircle2 /><h3>Roadmap complete</h3><p>Re-analyze after gaining new evidence to create the next plan.</p></section>}</aside>
  </div></CandidatePageShell>;
}

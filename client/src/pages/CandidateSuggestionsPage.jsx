import { Check, CheckCircle2, FileText, Lightbulb, Sparkles, Target, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import CandidatePageShell from "../components/CandidatePageShell";
import { useCandidate } from "../components/CandidateProvider";

export default function CandidateSuggestionsPage() {
  const { analysis, loading } = useCandidate();
  const [decisions, setDecisions] = useState({});

  if (loading) return <CandidatePageShell><div className="center-panel"><span className="spinner" /> Loading suggestions…</div></CandidatePageShell>;
  if (!analysis) return <CandidatePageShell><div className="no-analysis-inline"><FileText /><h1>No suggestions yet.</h1><p>Analyze a resume first.</p><Link className="button button-primary" to="/candidate/dashboard">Go to Overview</Link></div></CandidatePageShell>;

  return <CandidatePageShell><div className="dashboard suggestions-page">
    <div className="page-title"><div><h1>Your improvement plan</h1><p>Specific changes, skill priorities, and truth-safe replacement wording.</p></div></div>
    <div className="suggestion-layout"><main>
      <section className="action-plan"><header><h2>Highest-impact corrections</h2><span>{analysis.losses.length} items</span></header>
        {analysis.losses.map((loss, index) => <article key={`${loss.category}-${loss.title}`}><b>{index + 1}</b><div>
          <span>{loss.category} · up to {loss.points} points</span><h3>{loss.title}</h3><p>{loss.detail}</p>
          {loss.evidence ? <blockquote>“{loss.evidence.text}”</blockquote> : null}
          <div className="recommended-change"><strong>Recommended change</strong><p>{loss.suggestedChange || loss.action}</p></div>
        </div></article>)}
      </section>

      <section className="skill-plan"><header><Target /><div><h2>Skill development plan</h2><p>Prioritized by job requirements, demonstrated evidence, and the selected role.</p></div></header>
        <div>{(analysis.skillDevelopment || []).map((item) => <article key={item.skill}>
          <div><span className={`priority priority-${item.priority.toLowerCase()}`}>{item.priority}</span><h3>{item.skill}</h3><small>{item.status}</small></div>
          <p>{item.why}</p><p><strong>How to improve:</strong> {item.nextStep}</p>
          <blockquote><strong>Resume example</strong>{item.resumeChange}</blockquote>
        </article>)}</div>
      </section>

      <section className="rewrite-list"><header><Sparkles /><div><h2>Suggested replacements</h2><p>Copy-ready structure with brackets wherever your verified facts are still needed.</p></div></header>
        {analysis.rewrites.length ? analysis.rewrites.map((rewrite) => <article key={rewrite.line}><div><span>Original · line {rewrite.line}</span><p>{rewrite.original}</p></div><div className="suggested"><span>Replace with</span><p>{rewrite.suggested}</p></div><div><span>Why this is stronger</span><p>{rewrite.reason}</p>{rewrite.missingInformation ? <small><Lightbulb /> {rewrite.missingInformation}</small> : null}</div><footer>{decisions[rewrite.line] ? <strong className={decisions[rewrite.line]}><CheckCircle2 /> {decisions[rewrite.line]}</strong> : <><button className="button button-primary" onClick={() => setDecisions((current) => ({ ...current, [rewrite.line]: "approved" }))}><Check /> Approve</button><button className="button button-secondary" onClick={() => setDecisions((current) => ({ ...current, [rewrite.line]: "rejected" }))}><X /> Reject</button></>}</footer></article>) : <div className="inline-success"><CheckCircle2 /> Every detected bullet already has a clear action and supported outcome.</div>}
      </section>
    </main><aside className="strength-list"><h2>What already works</h2>{analysis.strengths.map((strength) => <article key={strength.title}><CheckCircle2 /><div><strong>{strength.title}</strong>{strength.evidence ? <p>“{strength.evidence.text}”</p> : null}</div></article>)}</aside></div>
  </div></CandidatePageShell>;
}

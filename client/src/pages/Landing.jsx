import { ArrowRight, CheckCircle2, FileSearch, GitCompareArrows, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Brand from "../components/Brand";

export default function Landing() {
  return <div className="landing">
    <header className="landing-nav"><Brand /><nav><a href="#how">How it works</a><a href="#principles">Why HireLens</a><Link className="button button-ghost" to="/login">Sign in</Link></nav></header>
    <main>
      <section className="landing-hero">
        <div className="hero-copy"><h1>A resume score you can actually understand.</h1><p>Role-specific analysis for candidates. Evidence-linked ranking for recruiters. Every recommendation shows its reason—and never invents a fact.</p><div className="hero-actions"><Link className="button button-primary button-large" to="/login?role=candidate">Improve my resume <ArrowRight /></Link><Link className="button button-secondary button-large" to="/login?role=employer">Rank candidates</Link></div><div className="trust-line"><ShieldCheck /> Decision support, not automated rejection. Protected traits are never scored.</div></div>
        <div className="hero-product" aria-label="HireLens analysis preview">
          <div className="preview-top"><div><span>Product Designer</span><strong>Resume analysis</strong></div><span className="confidence">High confidence</span></div>
          <div className="preview-score"><div className="score-orbit"><strong>78</strong><span>role fit</span></div><div><small>Most useful next step</small><h2>Add verified outcomes to three project bullets.</h2><p>Estimated potential after approved improvements: <strong>86</strong></p></div></div>
          <div className="preview-evidence"><span className="evidence-good">Strong evidence</span><p>“Conducted usability testing with 18 participants.”</p><span className="evidence-warning">Needs evidence</span><p>“Worked on the onboarding experience.”</p></div>
        </div>
      </section>
      <section className="mode-section" id="how"><div><FileSearch /><span>For candidates</span><h2>Know what to fix—and why.</h2><p>See role-fit, ATS structure, missing evidence, truth-safe rewrites and a realistic potential-score simulation.</p><Link to="/login?role=candidate">Open candidate workspace <ArrowRight /></Link></div><div><GitCompareArrows /><span>For recruiters</span><h2>Compare evidence, not assumptions.</h2><p>Build a rubric, adjust weights, rank applicants, inspect trade-offs and create structured interviews.</p><Link to="/login?role=employer">Open recruiter workspace <ArrowRight /></Link></div></section>
      <section className="principles" id="principles"><div><Sparkles /><h2>Useful across industries</h2><p>Software, data, finance/MBA, consulting, marketing, creative and research roles use different evidence rubrics.</p></div><ul><li><CheckCircle2 /> Skills demonstrated in work receive more credit than skills merely listed.</li><li><CheckCircle2 /> Every major deduction links to a resume line or missing job requirement.</li><li><CheckCircle2 /> Rewrites preserve verified facts and ask before adding metrics.</li></ul></section>
    </main>
    <footer><Brand /><span>Explainable resume intelligence · B.Tech project</span></footer>
  </div>;
}

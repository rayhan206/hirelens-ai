import { Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "./AppShell";
import AnalyzerModal from "./AnalyzerModal";

export default function CandidatePageShell({ children }) {
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const navigate = useNavigate();
  return <AppShell role="candidate" action={<button className="button button-secondary" onClick={() => setShowAnalyzer(true)}><Upload /> Analyze resume</button>}>
    {children}
    {showAnalyzer ? <AnalyzerModal onClose={() => setShowAnalyzer(false)} onComplete={() => { setShowAnalyzer(false); navigate("/candidate/analysis"); }} /> : null}
  </AppShell>;
}

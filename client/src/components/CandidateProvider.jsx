import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const CandidateContext = createContext(null);

export function CandidateProvider({ children }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try { const data = await api("/analysis/resume/latest"); setAnalysis(data.analysis); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh().catch(() => setLoading(false)); }, [refresh]);
  const analyze = useCallback(async (formData) => { const data = await api("/analysis/resume", { method: "POST", body: formData }); setAnalysis(data.analysis); return data.analysis; }, []);
  const clear = useCallback(async () => { await api("/analysis/resume/latest", { method: "DELETE" }); setAnalysis(null); }, []);
  const value = useMemo(() => ({ analysis, loading, analyze, clear, refresh }), [analysis, loading, analyze, clear, refresh]);
  return <CandidateContext.Provider value={value}>{children}</CandidateContext.Provider>;
}

export const useCandidate = () => useContext(CandidateContext);

import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import CandidateDashboard from "./pages/CandidateDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { CandidateProvider } from "./components/CandidateProvider";
import CandidateAnalysisPage from "./pages/CandidateAnalysisPage";
import CandidateSuggestionsPage from "./pages/CandidateSuggestionsPage";
import CandidateJobMatchPage from "./pages/CandidateJobMatchPage";

const candidatePage = (Page) => <ProtectedRoute role="candidate"><CandidateProvider><Page /></CandidateProvider></ProtectedRoute>;

export default function App() {
  return <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/auth/callback" element={<AuthCallback />} />
    <Route path="/candidate/dashboard" element={candidatePage(CandidateDashboard)} />
    <Route path="/candidate/analysis" element={candidatePage(CandidateAnalysisPage)} />
    <Route path="/candidate/suggestions" element={candidatePage(CandidateSuggestionsPage)} />
    <Route path="/candidate/job-match" element={candidatePage(CandidateJobMatchPage)} />
    <Route path="/employer/dashboard" element={<ProtectedRoute role="employer"><RecruiterDashboard /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

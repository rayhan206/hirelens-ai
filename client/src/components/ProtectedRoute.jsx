import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen"><span className="spinner" /> Checking your secure session…</div>;
  if (!user) return <Navigate to={`/login?role=${role}`} replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}/dashboard?notice=role`} replace />;
  return children;
}

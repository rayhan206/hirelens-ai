import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";

export default function AuthCallback() {
  const { refresh } = useAuth(); const navigate = useNavigate();
  useEffect(() => { refresh().then((user) => navigate(`/${user.role}/dashboard`, { replace: true })).catch(() => navigate("/login?oauth=failed", { replace: true })); }, [refresh, navigate]);
  return <div className="center-screen"><span className="spinner" /> Completing Google sign-in…</div>;
}

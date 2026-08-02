import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Brand from "../components/Brand";
import { useAuth } from "../components/AuthProvider";
import { api } from "../lib/api";

export default function Login() {
  const [params] = useSearchParams();
  const initialRole = params.get("role") === "employer" ? "employer" : "candidate";
  const [role, setRole] = useState(initialRole);
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(params.get("oauth") === "setup-required" ? "Google sign-in needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your local .env file." : params.get("oauth") === "failed" ? "Google sign-in failed. Confirm the callback URL in Google Cloud matches the project configuration." : "");
  const [googleReady, setGoogleReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { api("/auth/providers").then((data) => setGoogleReady(Boolean(data.providers.google))).catch(() => setGoogleReady(false)); }, []);
  const title = useMemo(() => role === "candidate" ? "Improve your next application" : "Review candidates with evidence", [role]);
  const routeUser = (user) => navigate(`/${user.role}/dashboard`);
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(""); const values = Object.fromEntries(new FormData(event.currentTarget));
    try { routeUser(mode === "login" ? await login(values.email, values.password) : await register({ ...values, role })); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <div className="auth-page">
    <div className="auth-side"><Link to="/" className="back-link"><ArrowLeft /> Back</Link><Brand inverse /><div><h1>{title}</h1><p>{role === "candidate" ? "Understand every score, strengthen real evidence and keep every rewrite truthful." : "Rank for a specific job, inspect trade-offs and keep the final decision human."}</p></div><blockquote>“The best recommendation is one a user can verify.”</blockquote></div>
    <main className="auth-panel"><div className="auth-card"><div className="role-switch"><button className={role === "candidate" ? "active" : ""} onClick={() => setRole("candidate")}>Candidate</button><button className={role === "employer" ? "active" : ""} onClick={() => setRole("employer")}>Employer</button></div><h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2><p>{mode === "login" ? "Sign in to continue to your workspace." : "One secure account, routed by your selected role."}</p>{error ? <div className="form-error">{error}</div> : null}
      {googleReady ? <a className="button google-button" href={`/api/auth/google?role=${role}`}><span>G</span> Continue with Google</a> : <button className="button google-button google-disabled" type="button" onClick={() => setError("Google OAuth is not configured yet. Add the Google client ID and secret to .env, then restart the server.")}><span>G</span> Google sign-in requires setup</button>}<div className="or"><span>or use email</span></div>
      <form onSubmit={submit}>{mode === "register" ? <label>Full name<input name="name" required minLength="2" placeholder="Your name" /></label> : null}<label>Email address<input name="email" type="email" required placeholder="you@example.com" /></label><label>Password<div className="password-input"><input name="password" type={showPassword ? "text" : "password"} required minLength={mode === "register" ? 8 : 1} placeholder="At least 8 characters" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">{showPassword ? <EyeOff /> : <Eye />}</button></div></label>{mode === "register" && role === "employer" ? <label>Organisation <input name="organisation" placeholder="Company or team" /></label> : null}<button className="button button-primary submit-button" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button></form>
      <p className="auth-toggle">{mode === "login" ? "New to HireLens?" : "Already have an account?"} <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create account" : "Sign in"}</button></p></div></main>
  </div>;
}

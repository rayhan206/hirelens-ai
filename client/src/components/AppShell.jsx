import { BarChart3, BriefcaseBusiness, Columns3, FileSearch, GitCompareArrows, LayoutDashboard, LogOut, Map, Settings, Sparkles, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import Brand from "./Brand";

const candidateNav = [
  ["Overview", LayoutDashboard, "/candidate/dashboard"], ["Resume analysis", FileSearch, "/candidate/analysis"],
  ["Suggestions", Sparkles, "/candidate/suggestions"], ["Job match", BriefcaseBusiness, "/candidate/job-match"],
  ["Roadmap", Map, "/candidate/roadmap"]
];
const recruiterNav = [["Jobs", BriefcaseBusiness, "/employer/dashboard"], ["Candidates", Users, "/employer/dashboard"], ["Pipeline", Columns3, "/employer/dashboard"], ["Compare", GitCompareArrows, "/employer/dashboard"]];

export default function AppShell({ role, children, action }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const nav = role === "candidate" ? candidateNav : recruiterNav;
  const handleLogout = async () => { await logout(); navigate("/"); };
  return <div className={`app-shell ${role === "employer" ? "app-shell-recruiter" : ""}`}>
    <aside className="sidebar">
      <Brand />
      <nav aria-label="Primary navigation">
        {nav.map(([label, Icon, href]) => <button className={`nav-item ${location.pathname === href ? "active" : ""}`} key={label} onClick={() => navigate(href)}><Icon /> <span>{label}</span></button>)}
      </nav>
      <div className="sidebar-spacer" />
      <button className="nav-item"><Settings /> <span>Settings</span></button>
      <button className="nav-item" onClick={handleLogout}><LogOut /> <span>Log out</span></button>
      <div className="human-note"><Sparkles /><div><strong>Evidence first</strong><span>Advice is linked to the resume, never hidden behind a score.</span></div></div>
    </aside>
    <main className="app-main">
      <header className="app-header">
        <div className="mobile-brand"><Brand /></div>
        <div className="header-context"><BarChart3 /><span>{role === "candidate" ? "Candidate workspace" : "Recruiter workspace"}</span></div>
        <div className="header-actions">{action}<div className="avatar">{user?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div className="user-copy"><strong>{user?.name}</strong><span>{user?.role}</span></div><button className="icon-button header-logout" onClick={handleLogout} aria-label="Log out" title="Log out"><LogOut /></button></div>
      </header>
      {location.search.includes("notice=role") ? <div className="permission-banner">You were redirected to the workspace allowed for your account role.</div> : null}
      {children}
    </main>
  </div>;
}

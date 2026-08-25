import { Link, Outlet, useLocation } from "react-router-dom";
import { Home, BarChart2, ShieldCheck, Building2, Settings, LogOut, Mountain } from "lucide-react";
import "./AdminLayout.css";

const NAV_ITEMS = [
  { label: "대시보드", to: "/", icon: Home, match: ["/"] },
  { label: "통계 데이터 보드", to: "/stats", icon: BarChart2, match: ["/stats", "/monitoring"] },
  { label: "방문 인증", to: "/visit-auth", icon: ShieldCheck, match: ["/visit-auth"] },
  { label: "장소 관리", to: "/places", icon: Building2, match: ["/places"] },
  { label: "설정", to: "/settings", icon: Settings, match: ["/settings"] },
];

export default function AdminLayout() {
  const { pathname } = useLocation();

  const isActive = (matchers: string[]) =>
    matchers.some((m) => (m === "/" ? pathname === "/" : pathname.startsWith(m)));

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <span className="admin-sidebar-logo-icon">
            <Mountain size={18} strokeWidth={2.2} />
          </span>
          <span>고요행 관리자</span>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(({ label, to, icon: Icon, match }) => (
            <Link key={to} to={to} className={`admin-nav-item ${isActive(match) ? "active" : ""}`}>
              <Icon size={17} strokeWidth={2} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-illustration" aria-hidden="true" />

        <Link to="/login" className="admin-logout">
          <LogOut size={16} /> 로그아웃
        </Link>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

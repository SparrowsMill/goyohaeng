import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  BarChart2,
  ShieldCheck,
  Building2,
  Settings,
  LogOut,
  Mountain,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import "./AdminLayout.css";

const SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";

const NAV_ITEMS = [
  { label: "방문 인증", to: "/visit-auth", icon: ShieldCheck, match: ["/visit-auth"] },
  { label: "통계 데이터 보드", to: "/stats", icon: BarChart2, match: ["/stats", "/monitoring"] },
  { label: "장소 관리", to: "/places", icon: Building2, match: ["/places"] },
  { label: "설정", to: "/settings", icon: Settings, match: ["/settings"] },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1"
  );

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const isActive = (matchers: string[]) => matchers.some((m) => pathname.startsWith(m));

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <button
          type="button"
          className="admin-topbar-menu-btn"
          aria-label="메뉴 열기"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
        <span className="admin-sidebar-logo-icon">
          <Mountain size={16} strokeWidth={2.2} />
        </span>
        <span>고요행 관리자</span>
      </div>

      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""} ${collapsed ? "collapsed" : ""}`}>
        <div className="admin-sidebar-logo">
          <span className="admin-sidebar-logo-icon">
            <Mountain size={18} strokeWidth={2.2} />
          </span>
          <span className="admin-nav-label">고요행 관리자</span>
          <button
            type="button"
            className="admin-sidebar-collapse-btn"
            aria-label={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <PanelLeftOpen size={16} strokeWidth={2} /> : <PanelLeftClose size={16} strokeWidth={2} />}
          </button>
          <button
            type="button"
            className="admin-sidebar-close-btn"
            aria-label="메뉴 닫기"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(({ label, to, icon: Icon, match }) => (
            <Link
              key={to}
              to={to}
              className={`admin-nav-item ${isActive(match) ? "active" : ""}`}
              title={collapsed ? label : undefined}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={19} strokeWidth={2} />
              <span className="admin-nav-label">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-illustration" aria-hidden="true" />

        <Link to="/login" className="admin-logout">
          <LogOut size={18} strokeWidth={2} /> <span className="admin-nav-label">로그아웃</span>
        </Link>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

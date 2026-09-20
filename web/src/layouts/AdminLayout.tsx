import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart2,
  ShieldCheck,
  Building2,
  Clock,
  Settings,
  LogOut,
  Mountain,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import "./AdminLayout.css";

const SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";

const NAV_ITEMS = [
  { label: "방문 인증", to: "/visit-auth", icon: ShieldCheck, match: ["/visit-auth"] },
  { label: "통계 데이터 보드", to: "/stats", icon: BarChart2, match: ["/stats", "/monitoring"] },
  { label: "장소 관리", to: "/places", icon: Building2, match: ["/places"], exact: true },
  { label: "운영시간 관리", to: "/places/hours", icon: Clock, match: ["/places/hours"] },
  { label: "계정 관리", to: "/settings", icon: Settings, match: ["/settings"] },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1"
  );
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    // Modal/Toast portal straight to document.body, outside this component's
    // subtree, so the dark-mode scope has to live on body (not just this div)
    // for them to inherit the dark tokens too.
    document.body.dataset.theme = theme;
    return () => {
      delete document.body.dataset.theme;
    };
  }, [theme]);

  const isActive = (matchers: string[], exact?: boolean) =>
    matchers.some((m) => (exact ? pathname === m : pathname.startsWith(m)));

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
          {NAV_ITEMS.map(({ label, to, icon: Icon, match, exact }) => (
            <Link
              key={to}
              to={to}
              className={`admin-nav-item ${isActive(match, exact) ? "active" : ""}`}
              title={collapsed ? label : undefined}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={19} strokeWidth={2} />
              <span className="admin-nav-label">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-illustration" aria-hidden="true" />

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-logout"
            onClick={() => setLogoutConfirmOpen(true)}
          >
            <LogOut size={18} strokeWidth={2} /> <span className="admin-nav-label">로그아웃</span>
          </button>

          <button
            type="button"
            className="admin-theme-toggle"
            onClick={toggleTheme}
            title={collapsed ? (theme === "dark" ? "라이트모드" : "다크모드") : undefined}
            aria-label={theme === "dark" ? "라이트모드로 전환" : "다크모드로 전환"}
          >
            {theme === "dark" ? <Moon size={12} strokeWidth={2} /> : <Sun size={12} strokeWidth={2} />}
            <span className="admin-nav-label">{theme === "dark" ? "Dark" : "Light"}</span>
          </button>
        </div>
      </aside>

      <main className={`admin-content ${pathname.startsWith("/stats") ? "admin-content-stats" : ""}`}>
        <Outlet />
      </main>

      <Modal
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        title="로그아웃 하시겠습니까?"
        description="다시 로그인해야 관리자 화면을 이용할 수 있어요."
        footer={
          <>
            <Button variant="secondary" onClick={() => setLogoutConfirmOpen(false)}>
              취소
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              로그아웃
            </Button>
          </>
        }
      />
    </div>
  );
}

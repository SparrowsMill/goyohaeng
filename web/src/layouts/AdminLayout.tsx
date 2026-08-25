import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <header className="admin-header">
        <span>고요행 어드민</span>
        <button>방문 인증 ON/OFF</button>
      </header>
      <nav className="admin-nav">
        <NavLink to="/stats">통계데이터보드</NavLink>
        <NavLink to="/visit-auth">방문인증관리</NavLink>
        <NavLink to="/places">장소관리</NavLink>
        <NavLink to="/settings">설정</NavLink>
      </nav>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

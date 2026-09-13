import type { ReactNode } from "react";
import { Mountain } from "lucide-react";
import "./AuthLayout.css";

export default function AuthLayout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout-bg" aria-hidden="true" />
      <div className="auth-logo">
        <span className="auth-logo-icon">
          <Mountain size={18} strokeWidth={2.2} />
        </span>
        <span className="auth-logo-text">
          고요행 관리자
          <small>GOYOHAENG ADMIN</small>
        </span>
      </div>
      <div className={`auth-card ${wide ? "auth-card-wide" : ""}`}>{children}</div>
    </div>
  );
}

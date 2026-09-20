import type { ReactNode } from "react";
import "./AuthLayout.css";

export default function AuthLayout({
  children,
  wide = false,
  showLogo = true,
}: {
  children: ReactNode;
  wide?: boolean;
  showLogo?: boolean;
}) {
  return (
    <div className="auth-layout">
      <div className="auth-layout-bg" aria-hidden="true" />
      {showLogo && <img src="/assets/app_logo.png" alt="고요행" className="auth-logo-center" />}
      <div className={`auth-card ${wide ? "auth-card-wide" : ""}`}>{children}</div>
    </div>
  );
}

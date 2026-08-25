import { Sprout } from "lucide-react";
import "./AuthHeader.css";

export default function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="auth-header">
      <span className="auth-header-icon">
        <Sprout size={22} strokeWidth={1.8} />
      </span>
      <h1 className="auth-header-title">{title}</h1>
      {subtitle && <p className="auth-header-subtitle">{subtitle}</p>}
    </div>
  );
}

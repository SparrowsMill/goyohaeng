import type { ReactNode } from "react";
import { Info } from "lucide-react";
import "./StatCard.css";

export default function StatCard({
  icon,
  tone = "neutral",
  label,
  hint,
  value,
  valueTone,
  sub,
}: {
  icon: ReactNode;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger";
  label: string;
  hint?: string;
  value: ReactNode;
  valueTone?: "success" | "warning" | "danger";
  sub?: ReactNode;
}) {
  return (
    <div className="stat-card">
      <span className={`stat-card-icon tone-${tone}`}>{icon}</span>
      <div className="stat-card-body">
        <p className="stat-card-label">
          {label}
          {hint && <Info size={12} className="stat-card-hint-icon" />}
        </p>
        {hint && <p className="stat-card-hint">{hint}</p>}
        <p className={`stat-card-value ${valueTone ? `text-${valueTone}` : ""}`}>{value}</p>
        {sub}
      </div>
    </div>
  );
}

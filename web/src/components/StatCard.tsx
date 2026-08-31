import type { ReactNode } from "react";
import "./StatCard.css";

export default function StatCard({
  icon,
  tone = "neutral",
  label,
  value,
  valueTone,
  sub,
  compact,
}: {
  icon: ReactNode;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger";
  label: string;
  value: ReactNode;
  valueTone?: "success" | "warning" | "danger";
  sub?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`stat-card ${compact ? "compact" : ""}`}>
      <span className={`stat-card-icon tone-${tone}`}>{icon}</span>
      <div className="stat-card-body">
        <p className="stat-card-label">{label}</p>
        <p className={`stat-card-value ${valueTone ? `text-${valueTone}` : ""}`}>{value}</p>
        {sub}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { Info, ArrowUpRight, ArrowDownRight } from "lucide-react";
import "./StatCard.css";

interface Delta {
  text: string;
  direction?: "up" | "down" | "neutral";
}

export default function StatCard({
  icon,
  tone = "neutral",
  label,
  hint,
  value,
  valueTone,
  delta,
  sub,
  compact,
}: {
  icon: ReactNode;
  tone?: "neutral" | "primary" | "success" | "warning" | "danger";
  label: string;
  hint?: string;
  value: ReactNode;
  valueTone?: "success" | "warning" | "danger";
  delta?: Delta;
  sub?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`stat-card stat-card-${tone} ${compact ? "compact" : ""}`}>
      <p className="stat-card-label">
        <span className={`stat-card-icon tone-${tone}`}>{icon}</span>
        {label}
        {hint && (
          <span title={hint}>
            <Info size={12} className="info-icon" />
          </span>
        )}
      </p>
      <p className={`stat-card-value ${valueTone ? `text-${valueTone}` : ""}`}>{value}</p>
      {delta && (
        <p className={`stat-card-delta ${delta.direction ?? "neutral"}`}>
          {delta.direction === "up" && <ArrowUpRight size={13} />}
          {delta.direction === "down" && <ArrowDownRight size={13} />}
          {delta.text}
        </p>
      )}
      {sub}
    </div>
  );
}

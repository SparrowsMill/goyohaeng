import type { ReactNode } from "react";
import "./Badge.css";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

export default function Badge({
  tone = "neutral",
  icon,
  pill = false,
  children,
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  pill?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={`badge badge-${tone} ${pill ? "badge-pill" : ""}`}>
      {icon}
      {children}
    </span>
  );
}

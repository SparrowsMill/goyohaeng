import type { ReactNode } from "react";
import "./InfoBox.css";

interface InfoBoxProps {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  tone?: "neutral" | "primary" | "danger";
}

export default function InfoBox({ icon, title, description, tone = "neutral" }: InfoBoxProps) {
  return (
    <div className={`info-box info-box-${tone}`}>
      <span className="info-box-icon">{icon}</span>
      <div className="info-box-text">
        <p className="info-box-title">{title}</p>
        {description && <p className="info-box-desc">{description}</p>}
      </div>
    </div>
  );
}

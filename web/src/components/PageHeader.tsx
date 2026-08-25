import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Settings, ChevronRight } from "lucide-react";
import Toggle from "./ui/Toggle";
import "./PageHeader.css";

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  showVisitToggle?: boolean;
  hideSettings?: boolean;
  right?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  showVisitToggle = false,
  hideSettings = false,
  right,
}: PageHeaderProps) {
  const [visitOn, setVisitOn] = useState(true);

  return (
    <div className="page-header">
      <div className="page-header-top">
        <div>
          {breadcrumbs && (
            <nav className="page-breadcrumbs">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.label} className="page-breadcrumb-item">
                  {i > 0 && <ChevronRight size={13} />}
                  {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span>{crumb.label}</span>}
                </span>
              ))}
            </nav>
          )}
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>

        <div className="page-header-right">
          {showVisitToggle && (
            <div className="page-visit-toggle">
              방문 인증
              <span className={`page-visit-toggle-state ${visitOn ? "on" : "off"}`}>
                {visitOn ? "ON" : "OFF"}
              </span>
              <Toggle checked={visitOn} onChange={setVisitOn} size="sm" />
            </div>
          )}
          {right}
          {!right && !hideSettings && (
            <Link to="/settings" className="page-settings-btn">
              <Settings size={15} /> 설정
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

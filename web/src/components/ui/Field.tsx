import type { InputHTMLAttributes, ReactNode } from "react";
import "./Field.css";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  hint?: ReactNode;
}

export default function Field({ label, icon, suffix, hint, id, ...rest }: FieldProps) {
  const fieldId = id ?? label;

  return (
    <div className="field">
      <div className="field-label-row">
        <label htmlFor={fieldId} className="field-label">
          {label}
        </label>
        {hint}
      </div>
      <div className="field-input-wrap">
        {icon && <span className="field-icon">{icon}</span>}
        <input id={fieldId} className="field-input" {...rest} />
        {suffix && <span className="field-suffix">{suffix}</span>}
      </div>
    </div>
  );
}

import type { InputHTMLAttributes, ReactNode } from "react";
import "./Field.css";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  hint?: ReactNode;
  error?: string;
}

export default function Field({ label, icon, suffix, hint, error, id, ...rest }: FieldProps) {
  const fieldId = id ?? label;
  const errorId = error ? `${fieldId}-error` : undefined;

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
        <input
          id={fieldId}
          className={`field-input ${error ? "field-input-error" : ""}`}
          aria-invalid={!!error}
          aria-describedby={errorId}
          {...rest}
        />
        {suffix && <span className="field-suffix">{suffix}</span>}
      </div>
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

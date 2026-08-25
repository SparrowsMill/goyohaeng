import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  full?: boolean;
  icon?: ReactNode;
}

export default function Button({
  variant = "primary",
  full = false,
  icon,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = ["btn", `btn-${variant}`, full ? "btn-full" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
}

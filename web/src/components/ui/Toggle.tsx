import "./Toggle.css";

export default function Toggle({
  checked,
  onChange,
  size = "md",
}: {
  checked: boolean;
  onChange?: (next: boolean) => void;
  size?: "sm" | "md";
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`toggle toggle-${size} ${checked ? "on" : ""}`}
      onClick={() => onChange?.(!checked)}
    >
      <span className="toggle-knob" />
    </button>
  );
}

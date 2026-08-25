import "./charts.css";

interface Segment {
  label: string;
  value: number;
  color: string;
}

export default function DonutChart({ segments, centerLabel }: { segments: Segment[]; centerLabel: string }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let cumulative = 0;
  const stops = segments.map((s) => {
    const start = (cumulative / total) * 360;
    cumulative += s.value;
    const end = (cumulative / total) * 360;
    return `${s.color} ${start}deg ${end}deg`;
  });

  return (
    <div className="donut-wrap">
      <div className="donut-ring" style={{ background: `conic-gradient(${stops.join(", ")})` }}>
        <div className="donut-hole">
          <span className="donut-hole-label">전체</span>
          <span className="donut-hole-value">{centerLabel}</span>
        </div>
      </div>
      <ul className="donut-legend">
        {segments.map((s) => (
          <li key={s.label}>
            <span className="donut-legend-dot" style={{ background: s.color }} />
            {s.label}
            <span className="donut-legend-value">
              {s.value.toLocaleString()}건 ({((s.value / total) * 100).toFixed(1)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

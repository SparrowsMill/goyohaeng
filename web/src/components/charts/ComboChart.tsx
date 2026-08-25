import "./charts.css";

interface Point {
  label: string;
  bar?: number;
  line?: number;
}

export default function ComboChart({
  data,
  barColor = "var(--color-primary-soft)",
  lineColor = "var(--color-primary)",
  height = 180,
}: {
  data: Point[];
  barColor?: string;
  lineColor?: string;
  height?: number;
}) {
  const barMax = Math.max(1, ...data.map((d) => d.bar ?? 0)) * 1.25;
  const lineMax = Math.max(1, ...data.map((d) => d.line ?? 0)) * 1.4;
  const hasLine = data.some((d) => d.line !== undefined);

  const step = 100 / data.length;
  const points = data.map((d, i) => ({
    xPct: step * i + step / 2,
    yPct: hasLine ? 100 - ((d.line ?? 0) / lineMax) * 100 : 0,
    value: d.line,
  }));

  return (
    <div className="chart-combo">
      <div className="chart-plot" style={{ height }}>
        <div className="chart-bars">
          {data.map((d) => (
            <div className="chart-bar-col" key={d.label}>
              {d.bar !== undefined && <span className="chart-bar-value">{d.bar.toLocaleString()}</span>}
              <div
                className="chart-bar"
                style={{ height: `${((d.bar ?? 0) / barMax) * 100}%`, background: barColor }}
              />
            </div>
          ))}
        </div>

        {hasLine && (
          <svg className="chart-line-overlay" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={points.map((p) => `${p.xPct},${p.yPct}`).join(" ")}
              fill="none"
              stroke={lineColor}
              strokeWidth={1.4}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}

        {hasLine &&
          points.map((p, i) => (
            <div
              key={i}
              className="chart-line-dot-wrap"
              style={{ left: `${p.xPct}%`, top: `${p.yPct}%` }}
            >
              <span className="chart-line-value">{p.value}</span>
              <span className="chart-line-dot" style={{ background: lineColor }} />
            </div>
          ))}
      </div>

      <div className="chart-labels">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

import "./charts.css";

interface Point {
  label: string;
  bar?: number;
  line?: number;
}

function axisStep(max: number) {
  if (max <= 10) return 2;
  if (max <= 30) return 5;
  if (max <= 100) return 10;
  if (max <= 300) return 50;
  return 100;
}

function buildTicks(max: number, step: number) {
  const ticks: number[] = [];
  for (let v = max; v >= 0; v -= step) ticks.push(v);
  return ticks;
}

// Picks a bar axis max with ~30% headroom above the tallest bar, rounded to a
// clean step so the gridlines/labels read as real axis values.
function computeBarAxis(maxBar: number) {
  const step = axisStep(maxBar);
  const max = Math.max(step, Math.ceil((maxBar * 1.3) / step) * step);
  return { max, step };
}

// Picks a line axis max that (a) fits the data with a little headroom and
// (b) keeps every line point far enough above its column's bar-top label to
// avoid the two value labels overlapping, given the bar axis chosen above.
function computeLineAxis(maxLine: number, barAxisMax: number, points: { bar: number; line: number }[]) {
  const step = axisStep(maxLine);
  let max = Math.max(step, Math.ceil((maxLine * 1.02) / step) * step);

  const LABEL_CLEARANCE = 12; // percentage points of the plot height
  const safeMax = Math.min(
    ...points.filter((p) => p.bar > 0).map((p) => (p.line * 100) / ((p.bar * 100) / barAxisMax + LABEL_CLEARANCE))
  );
  if (Number.isFinite(safeMax)) {
    while (max + step <= safeMax) max += step;
  }
  return { max, step };
}

export default function ComboChart({
  data,
  barColor = "var(--color-primary-soft)",
  lineColor = "var(--color-primary)",
  height = 180,
  barLegend,
  lineLegend,
  detailed = false,
}: {
  data: Point[];
  barColor?: string;
  lineColor?: string;
  height?: number;
  barLegend?: string;
  lineLegend?: string;
  detailed?: boolean;
}) {
  const hasBar = data.some((d) => d.bar !== undefined);
  const hasLine = data.some((d) => d.line !== undefined);
  // When both a bar and a line are present, the line is confined to a band near
  // the top of the plot (and bars get extra headroom below it) so the bar's
  // value label and the line's value label never land on top of each other.
  const isCombo = hasBar && hasLine;

  const maxBar = Math.max(0, ...data.map((d) => d.bar ?? 0));
  const maxLine = Math.max(0, ...data.map((d) => d.line ?? 0));

  const barAxis = detailed ? computeBarAxis(maxBar) : null;
  const lineAxis =
    detailed && hasLine
      ? computeLineAxis(
          maxLine,
          barAxis!.max,
          data.map((d) => ({ bar: d.bar ?? 0, line: d.line ?? 0 })),
        )
      : null;

  const barMax = barAxis ? barAxis.max : Math.max(1, maxBar) * (isCombo ? 2.3 : 1.25);
  const lineMax = lineAxis ? lineAxis.max : Math.max(1, maxLine) * 1.4;

  const lineValues = data.map((d) => d.line ?? 0);
  const lineMin = Math.min(...lineValues);
  const lineSpread = Math.max(1, Math.max(...lineValues) - lineMin);

  const LINE_BAND_TOP = 14;
  const LINE_BAND_BOTTOM = 30;

  const step = 100 / data.length;
  const points = data.map((d, i) => ({
    xPct: step * i + step / 2,
    yPct: !hasLine
      ? 0
      : lineAxis
        ? 100 - ((d.line ?? 0) / lineAxis.max) * 100
        : isCombo
          ? LINE_BAND_BOTTOM - ((d.line ?? 0) - lineMin) / lineSpread * (LINE_BAND_BOTTOM - LINE_BAND_TOP)
          : 100 - ((d.line ?? 0) / lineMax) * 100,
    value: d.line,
  }));

  const barTicks = barAxis ? buildTicks(barAxis.max, barAxis.step) : [];
  const lineTicks = lineAxis ? buildTicks(lineAxis.max, lineAxis.step) : [];

  const plot = (
    <div className="chart-plot" style={{ height }}>
      {barAxis && (
        <div className="chart-gridlines">
          {barTicks.map((t) => (
            <div key={t} className="chart-gridline" style={{ top: `${100 - (t / barAxis.max) * 100}%` }} />
          ))}
        </div>
      )}

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
          <div key={i} className="chart-line-dot-wrap" style={{ left: `${p.xPct}%`, top: `${p.yPct}%` }}>
            <span className="chart-line-value">{p.value}</span>
            <span className="chart-line-dot" style={{ background: lineColor }} />
          </div>
        ))}
    </div>
  );

  return (
    <div className={`chart-combo ${detailed ? "chart-combo-detailed" : ""}`}>
      {(barLegend || lineLegend) && (
        <div className="chart-legend">
          {barLegend && (
            <span className="chart-legend-item">
              <span className="chart-legend-swatch" style={{ background: barColor }} />
              {barLegend}
            </span>
          )}
          {lineLegend && (
            <span className="chart-legend-item">
              <span className="chart-legend-swatch chart-legend-swatch-line" style={{ background: lineColor }} />
              {lineLegend}
            </span>
          )}
        </div>
      )}

      <div className="chart-row">
        {barAxis && (
          <div className="chart-axis chart-axis-left" style={{ height }}>
            {barTicks.map((t) => (
              <span key={t}>{t.toLocaleString()}</span>
            ))}
          </div>
        )}

        <div className="chart-plot-col">
          {plot}
          <div className="chart-labels">
            {data.map((d) => (
              <span key={d.label}>{d.label}</span>
            ))}
          </div>
        </div>

        {lineAxis && (
          <div className="chart-axis chart-axis-right" style={{ height }}>
            {lineTicks.map((t) => (
              <span key={t}>{t.toLocaleString()}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import "./charts.css";

interface Point {
  label: string;
  bar?: number;
  line?: number;
}

// Picks a "nice" step (1/2/2.5/5/10 × a power of ten) that lands close to
// `targetTicks` gridlines across the given span, the way most chart axes do.
function axisStep(span: number, targetTicks = 5) {
  if (span <= 0) return 1;
  const rawStep = span / targetTicks;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const residual = rawStep / magnitude;
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 2.5 ? 2.5 : residual <= 5 ? 5 : 10;
  return niceResidual * magnitude;
}

function buildTicks(max: number, step: number) {
  const ticks: number[] = [];
  for (let v = max; v >= 0; v -= step) ticks.push(v);
  return ticks;
}

// Picks an axis max with ~30% headroom above the tallest value, rounded to a
// clean step so the gridlines/labels read as real axis values.
function computeAxis(maxValue: number) {
  const target = maxValue * 1.3;
  const step = axisStep(target);
  const max = Math.max(step, Math.ceil(target / step) * step);
  return { max, step };
}

// Picks a line axis max that (a) fits the data with a little headroom and
// (b) keeps every line point far enough above its column's bar-top label to
// avoid the two value labels overlapping, given the bar axis chosen above.
// LABEL_PX is the vertical room a value label + its gap needs, in pixels;
// expressing the clearance as a percentage of the actual plot height keeps
// it correct at any `height` prop, not just the one it was tuned against.
// Returns null when no axis max can fit the data AND keep every column
// clear — the caller falls back to a collision-safe relative band instead.
function computeComboLineAxis(
  maxLine: number,
  barAxisMax: number,
  points: { bar: number; line: number }[],
  height: number,
) {
  const step = axisStep(maxLine);
  let max = Math.max(step, Math.ceil((maxLine * 1.02) / step) * step);

  const LABEL_PX = 26;
  const clearance = (LABEL_PX / height) * 100;
  const ratios = points.filter((p) => p.bar > 0).map((p) => (p.line * 100) / ((p.bar * 100) / barAxisMax + clearance));
  const safeMax = ratios.length ? Math.min(...ratios) : Infinity;

  if (max <= safeMax) {
    while (max + step <= safeMax) max += step;
    return { max, step };
  }
  while (max - step >= maxLine && max - step >= safeMax) max -= step;
  return max > safeMax ? null : { max, step };
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

  // Left axis carries the bar's scale when there's a bar; for a line-only
  // chart it carries the line's own scale instead, so a single metric still
  // gets a real axis. Right axis only exists for a true bar+line combo.
  const leftAxis = !detailed ? null : hasBar ? computeAxis(maxBar) : hasLine ? computeAxis(maxLine) : null;
  const rightAxis =
    detailed && isCombo
      ? computeComboLineAxis(
          maxLine,
          leftAxis!.max,
          data.map((d) => ({ bar: d.bar ?? 0, line: d.line ?? 0 })),
          height,
        )
      : null;
  const lineAxis = isCombo ? rightAxis : hasLine && !hasBar ? leftAxis : null;

  const barMax = hasBar ? (leftAxis ? leftAxis.max : Math.max(1, maxBar) * (isCombo ? 2.3 : 1.25)) : 1;
  const lineMax = lineAxis ? lineAxis.max : Math.max(1, maxLine) * 1.4;

  const lineValues = data.map((d) => d.line ?? 0);
  const lineMin = Math.min(...lineValues);
  const lineSpread = Math.max(1, Math.max(...lineValues) - lineMin);

  // Fallback band for when a true-scale line axis isn't safe (or isn't
  // computed at all): keep the band's bottom edge comfortably above the
  // tallest bar's own top, whatever headroom that bar happens to have.
  const barTopPct = hasBar ? 100 - (maxBar / barMax) * 100 : 100;
  const LINE_BAND_BOTTOM = Math.max(6, Math.min(30, barTopPct - 8));
  const LINE_BAND_TOP = Math.max(2, LINE_BAND_BOTTOM - 16);

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

  const leftTicks = leftAxis ? buildTicks(leftAxis.max, leftAxis.step) : [];
  const rightTicks = rightAxis ? buildTicks(rightAxis.max, rightAxis.step) : [];

  const plot = (
    <div className="chart-plot" style={{ height }}>
      {leftAxis && (
        <div className="chart-gridlines">
          {leftTicks.map((t) => (
            <div key={t} className="chart-gridline" style={{ top: `${100 - (t / leftAxis.max) * 100}%` }} />
          ))}
        </div>
      )}

      {hasBar && (
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
      )}

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
        {leftAxis && (
          <div className="chart-axis chart-axis-left" style={{ height }}>
            {leftTicks.map((t) => (
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

        {rightAxis && (
          <div className="chart-axis chart-axis-right" style={{ height }}>
            {rightTicks.map((t) => (
              <span key={t}>{t.toLocaleString()}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

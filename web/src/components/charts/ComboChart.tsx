import { useEffect, useId, useRef, useState } from "react";
import "./charts.css";

interface Point {
  label: string;
  bar?: number;
  line?: number;
}

const CROSSFADE_MS = 180;

function signature(points: Point[]) {
  return points.map((p) => `${p.label}:${p.bar ?? ""}:${p.line ?? ""}`).join("|");
}

// Bars/dots can morph smoothly in place (via CSS transitions on
// height/left/top) as long as the point count doesn't change — e.g. paging
// a 7-day window a week at a time. Switching between periods with a
// different number of points (7일/1개월/3개월) can't be morphed the same
// way, so those swap via a brief cross-fade instead.
function useSmoothChartData(data: Point[]) {
  const [displayData, setDisplayData] = useState(data);
  const [fading, setFading] = useState(false);
  const pendingRef = useRef<Point[] | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (signature(data) === signature(displayData)) return;

    if (data.length === displayData.length) {
      setDisplayData(data);
      return;
    }

    pendingRef.current = data;
    setFading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDisplayData(pendingRef.current!);
      setFading(false);
    }, CROSSFADE_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { displayData, fading };
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

// Picks an axis max with the given headroom above the tallest value, rounded
// to a clean step so the gridlines/labels read as real axis values.
function computeAxis(maxValue: number, headroom = 1.3) {
  const target = maxValue * headroom;
  const step = axisStep(target);
  const max = Math.max(step, Math.ceil(target / step) * step);
  return { max, step };
}

export default function ComboChart({
  data: dataProp,
  barColor = "var(--color-primary-bar)",
  lineColor = "var(--color-primary)",
  height = 180,
  barLegend,
  lineLegend,
  detailed = false,
  area = false,
  labelStep = 1,
}: {
  data: Point[];
  barColor?: string;
  lineColor?: string;
  height?: number;
  barLegend?: string;
  lineLegend?: string;
  detailed?: boolean;
  area?: boolean;
  labelStep?: number;
}) {
  const gradientId = useId();
  const { displayData: data, fading } = useSmoothChartData(dataProp);
  const hasBar = data.some((d) => d.bar !== undefined);
  const hasLine = data.some((d) => d.line !== undefined);
  const isCombo = hasBar && hasLine;

  const maxBar = Math.max(0, ...data.map((d) => d.bar ?? 0));
  const maxLine = Math.max(0, ...data.map((d) => d.line ?? 0));

  // Bar and line each get their own true, independent axis — same as any
  // normal dual-axis combo chart; the bar axis keeps its normal headroom
  // (bar height is never adjusted for label clearance). The line axis gets
  // more headroom in combo mode: with more room on its own scale, the
  // flip-to-whichever-side-fits-better label placement below can always
  // find a clear spot, which a snugger axis doesn't leave room for.
  const leftAxis = detailed && hasBar ? computeAxis(maxBar) : detailed && hasLine ? computeAxis(maxLine) : null;
  const rightAxis = detailed && isCombo ? computeAxis(maxLine, 2) : null;
  const lineAxis = isCombo ? rightAxis : hasLine && !hasBar ? leftAxis : null;

  const barMax = hasBar ? (leftAxis ? leftAxis.max : Math.max(1, maxBar) * (isCombo ? 2.3 : 1.25)) : 1;
  const lineMax = lineAxis ? lineAxis.max : Math.max(1, maxLine) * 1.4;

  // Label geometry, in px: the value text is ~16px tall; the dot-wrap block
  // (text, 6px gap, 6px dot) is 28px tall and centered on its anchor point.
  // The bar's own value label sits 6-22px above its rect top. Converting to
  // % of the actual plot height lets this stay correct at any `height` prop.
  const pxToPct = (px: number) => (px / height) * 100;
  // The 28px dot-wrap block ([text, gap, dot] or reversed) is centered on
  // its anchor, spanning [anchor-14, anchor+14] either way; only where the
  // 16px text sits within that block changes.
  const labelSpan = (anchorPct: number, flipped: boolean): [number, number] =>
    flipped
      ? [anchorPct - pxToPct(2), anchorPct + pxToPct(14)]
      : [anchorPct - pxToPct(14), anchorPct + pxToPct(2)];
  // Signed clearance between two spans: positive = how big the gap between
  // them is, negative = how much they overlap.
  const clearance = (a: [number, number], b: [number, number]) => Math.max(a[0] - b[1], b[0] - a[1]);

  const step = 100 / data.length;
  const points = data.map((d, i) => {
    const yPct = !hasLine ? 0 : 100 - ((d.line ?? 0) / lineMax) * 100;
    // When this column also has a bar, place the line's value label on
    // whichever side of its dot (above or below) leaves the most clearance
    // from that bar's own value label — the dot itself always stays on its
    // true, independent scale; only the label can move to stay legible.
    let flip = false;
    if (hasBar && d.bar !== undefined) {
      const barTopPct = 100 - (d.bar / barMax) * 100;
      const barLabelSpan: [number, number] = [barTopPct - pxToPct(22), barTopPct - pxToPct(6)];
      const aboveClearance = clearance(labelSpan(yPct, false), barLabelSpan);
      const belowClearance = clearance(labelSpan(yPct, true), barLabelSpan);
      flip = belowClearance > aboveClearance;
    }
    return { xPct: step * i + step / 2, yPct, value: d.line, flip };
  });

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
          {data.map((d, i) => (
            <div className="chart-bar-col" key={i}>
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
          {area && (
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity="0.32" />
                <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
              </linearGradient>
            </defs>
          )}
          {area && (
            <polygon
              points={`${points[0].xPct},100 ${points.map((p) => `${p.xPct},${p.yPct}`).join(" ")} ${points[points.length - 1].xPct},100`}
              fill={`url(#${gradientId})`}
            />
          )}
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
            className={`chart-line-dot-wrap ${p.flip ? "chart-line-dot-wrap-flip" : ""}`}
            style={{ left: `${p.xPct}%`, top: `${p.yPct}%` }}
          >
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

      <div className={`chart-row ${fading ? "chart-row-fading" : ""}`}>
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
            {data.map((d, i) => (
              <span key={i}>{i % labelStep === 0 || i === data.length - 1 ? d.label : ""}</span>
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

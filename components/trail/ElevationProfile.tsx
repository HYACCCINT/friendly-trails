import { formatDistance } from "@/lib/trails/format";
import { ELEVATION_CHART, elevationGeometry } from "./elevationGeometry";

// A pure SVG chart: no hooks, no event handlers. The same component can render on the
// server (static, zero JS) or inside a client component that adds hover interaction.

export { ELEVATION_CHART };

interface ElevationProfileProps {
  elevation: number[];
  distanceKm: number;
  /** Index into `elevation` to highlight, if any. */
  highlightIndex?: number | null;
}

export function ElevationProfile({ elevation, distanceKm, highlightIndex = null }: ElevationProfileProps) {
  const { width, height, padTop, padRight, padLeft } = ELEVATION_CHART;
  const { min, max, ticks, last, innerWidth, baseline, x, y } = elevationGeometry(elevation);

  const line = elevation.map((meters, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(meters).toFixed(1)}`).join(" ");
  const area = `${line} L${x(last).toFixed(1)} ${baseline} L${padLeft} ${baseline} Z`;
  const distanceTicks = [0, 0.25, 0.5, 0.75, 1];
  const highlight =
    highlightIndex === null ? null : { x: x(highlightIndex), y: y(elevation[highlightIndex]) };

  return (
    <svg
      className="elevation-chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Elevation profile: from ${min} m to ${max} m over ${formatDistance(distanceKm)}`}
    >
      <g className="elevation-chart__grid">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={padLeft} x2={width - padRight} y1={y(tick)} y2={y(tick)} />
            <text x={padLeft - 10} y={y(tick)} dy="0.32em" textAnchor="end">
              {tick} m
            </text>
          </g>
        ))}
      </g>
      <path className="elevation-chart__area" d={area} />
      <path className="elevation-chart__line" d={line} />
      <g className="elevation-chart__axis">
        {distanceTicks.map((fraction, i) => (
          <text
            key={fraction}
            x={padLeft + fraction * innerWidth}
            y={height - 8}
            textAnchor={i === 0 ? "start" : i === distanceTicks.length - 1 ? "end" : "middle"}
          >
            {formatDistance(distanceKm * fraction)}
          </text>
        ))}
      </g>
      {highlight && (
        <g className="elevation-chart__cursor">
          <line x1={highlight.x} x2={highlight.x} y1={padTop} y2={baseline} />
          <circle cx={highlight.x} cy={highlight.y} r={5.5} />
        </g>
      )}
    </svg>
  );
}

/** A tiny, decorative version of the profile for trail cards. */
export function ElevationSparkline({ elevation }: { elevation: number[] }) {
  const width = 120;
  const height = 32;
  const min = Math.min(...elevation);
  const max = Math.max(...elevation);
  const span = Math.max(max - min, 1);
  const last = elevation.length - 1;
  const line = elevation
    .map((meters, i) => `${i ? "L" : "M"}${((i / last) * width).toFixed(1)} ${(height - 2 - ((meters - min) / span) * (height - 4)).toFixed(1)}`)
    .join(" ");

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path className="sparkline__area" d={`${line} L${width} ${height} L0 ${height} Z`} />
      <path className="sparkline__line" d={line} />
    </svg>
  );
}

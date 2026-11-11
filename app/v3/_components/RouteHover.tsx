"use client";

import { createContext, useContext, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { TrailMapLazy } from "@/components/interactive/TrailMapLazy";
import { ELEVATION_CHART, elevationGeometry } from "@/components/trail/elevationGeometry";
import { formatDistance, formatElevation } from "@/lib/trails/format";
import type { LatLng } from "@/lib/trails/types";

// v3: the elevation chart itself is server-rendered SVG (zero JS). This file is the thin client
// layer on top: hovering the chart moves a cursor on it and a marker on the map.

const HoverContext = createContext<{ index: number | null; setIndex: (index: number | null) => void } | null>(null);

export function RouteHoverProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  return <HoverContext value={{ index, setIndex }}>{children}</HoverContext>;
}

function useRouteHover() {
  const hover = useContext(HoverContext);
  if (!hover) throw new Error("useRouteHover() must be used inside <RouteHoverProvider>.");
  return hover;
}

/** The map, with a marker that follows the elevation chart. */
export function TrailMapHover({ route, samples, label }: { route: LatLng[]; samples: number; label: string }) {
  const { index } = useRouteHover();
  const highlight = index === null ? null : route[Math.round((index / (samples - 1)) * (route.length - 1))];
  return <TrailMapLazy route={route} highlight={highlight} label={label} />;
}

/** Wraps the server-rendered chart (passed as children) and draws the hover cursor over it. */
export function ElevationHoverLayer({
  elevation,
  distanceKm,
  children,
}: {
  elevation: number[];
  distanceKm: number;
  children: ReactNode;
}) {
  const { index, setIndex } = useRouteHover();
  const { width, height, padTop } = ELEVATION_CHART;
  const { last, innerWidth, baseline, x, y } = elevationGeometry(elevation);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const viewX = ((event.clientX - rect.left) / rect.width) * width;
    const fraction = (viewX - ELEVATION_CHART.padLeft) / innerWidth;
    setIndex(Math.round(Math.min(1, Math.max(0, fraction)) * last));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 8 : 1;
    const current = index ?? 0;
    const targets: Record<string, number> = {
      ArrowRight: current + step,
      ArrowUp: current + step,
      ArrowLeft: current - step,
      ArrowDown: current - step,
      Home: 0,
      End: last,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    setIndex(Math.min(last, Math.max(0, targets[event.key])));
  }

  const kmAtIndex = index === null ? 0 : (index / last) * distanceKm;
  const valueText =
    index === null ? "Start of the trail" : `${formatDistance(kmAtIndex)} in, ${formatElevation(elevation[index])}`;

  return (
    <div className="elevation">
      <div
        className="elevation__plot elevation__plot--layered"
        role="slider"
        tabIndex={0}
        aria-label="Position along the trail"
        aria-valuemin={0}
        aria-valuemax={distanceKm}
        aria-valuenow={Number(kmAtIndex.toFixed(1))}
        aria-valuetext={valueText}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setIndex(null)}
        onKeyDown={handleKeyDown}
        onBlur={() => setIndex(null)}
      >
        {children}
        {index !== null && (
          <svg className="elevation-chart elevation-chart--overlay" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
            <g className="elevation-chart__cursor">
              <line x1={x(index)} x2={x(index)} y1={padTop} y2={baseline} />
              <circle cx={x(index)} cy={y(elevation[index])} r={5.5} />
            </g>
          </svg>
        )}
      </div>
      <p className="elevation__readout">
        {index === null ? "Hover over the profile, or focus it and use the arrow keys." : valueText}
      </p>
    </div>
  );
}

"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { ELEVATION_CHART, ElevationProfile } from "@/components/trail/ElevationProfile";
import { formatDistance, formatElevation } from "@/lib/trails/format";

interface ElevationProfileInteractiveProps {
  elevation: number[];
  distanceKm: number;
  /** Called with the highlighted sample index (or null) so the map can follow along. */
  onHover?: (index: number | null) => void;
}

/** Adds pointer and keyboard interaction on top of the pure <ElevationProfile> chart. */
export function ElevationProfileInteractive({ elevation, distanceKm, onHover }: ElevationProfileInteractiveProps) {
  const [index, setIndex] = useState<number | null>(null);
  const last = elevation.length - 1;

  const select = (next: number | null) => {
    setIndex(next);
    onHover?.(next);
  };

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const svg = event.currentTarget.querySelector("svg");
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const { width, padLeft, padRight } = ELEVATION_CHART;
    const viewX = ((event.clientX - rect.left) / rect.width) * width;
    const fraction = (viewX - padLeft) / (width - padLeft - padRight);
    select(Math.round(Math.min(1, Math.max(0, fraction)) * last));
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
    select(Math.min(last, Math.max(0, targets[event.key])));
  }

  const kmAtIndex = index === null ? 0 : (index / last) * distanceKm;
  const valueText =
    index === null ? "Start of the trail" : `${formatDistance(kmAtIndex)} in, ${formatElevation(elevation[index])}`;

  return (
    <div className="elevation">
      <div
        className="elevation__plot"
        role="slider"
        tabIndex={0}
        aria-label="Position along the trail"
        aria-valuemin={0}
        aria-valuemax={distanceKm}
        aria-valuenow={Number(kmAtIndex.toFixed(1))}
        aria-valuetext={valueText}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => select(null)}
        onKeyDown={handleKeyDown}
        onBlur={() => select(null)}
      >
        <ElevationProfile elevation={elevation} distanceKm={distanceKm} highlightIndex={index} />
      </div>
      <p className="elevation__readout">
        {index === null ? "Hover over the profile, or focus it and use the arrow keys." : valueText}
      </p>
    </div>
  );
}

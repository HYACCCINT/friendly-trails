"use client";

import dynamic from "next/dynamic";
import type { TrailMapProps } from "./TrailMap";

// Leaflet touches `window` as soon as it is imported. Client components still render on the
// server first, so the map has to opt out of server rendering entirely.
export const TrailMapLazy = dynamic<TrailMapProps>(
  // Offline, the map's code (and Leaflet's CSS) can't be downloaded unless it loaded earlier.
  // Fall back instead of letting one failed chunk take down the whole page.
  () => import("./TrailMap").catch(() => MapUnavailable),
  {
    ssr: false,
    loading: () => <div className="trail-map trail-map--loading" aria-hidden="true" />,
  },
);

function MapUnavailable({ label }: TrailMapProps) {
  return (
    <div className="trail-map trail-map--unavailable" role="region" aria-label={label}>
      <p>The map needs a connection. Reload once you’re back online.</p>
    </div>
  );
}

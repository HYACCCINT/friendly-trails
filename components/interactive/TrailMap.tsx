"use client";

import "leaflet/dist/leaflet.css";
import type { LatLngTuple } from "leaflet";
import { CircleMarker, MapContainer, Polyline, TileLayer } from "react-leaflet";
import type { LatLng } from "@/lib/trails/types";

export interface TrailMapProps {
  route: LatLng[];
  highlight?: LatLng | null;
  label: string;
}

const TRAIL_COLOR = "#1f6f4a";
const HIGHLIGHT_COLOR = "#e4572e";

export default function TrailMap({ route, highlight = null, label }: TrailMapProps) {
  const positions: LatLngTuple[] = route.map((point) => [point.lat, point.lng]);

  return (
    <div className="trail-map" role="region" aria-label={label}>
      <MapContainer
        bounds={positions}
        boundsOptions={{ padding: [28, 28] }}
        scrollWheelZoom={false}
        className="trail-map__canvas"
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <Polyline positions={positions} pathOptions={{ color: "#ffffff", weight: 8, opacity: 0.9 }} />
        <Polyline positions={positions} pathOptions={{ color: TRAIL_COLOR, weight: 4.5 }} />
        <CircleMarker
          center={positions[0]}
          radius={7}
          pathOptions={{ color: "#ffffff", weight: 3, fillColor: TRAIL_COLOR, fillOpacity: 1 }}
        />
        {highlight && (
          <CircleMarker
            center={[highlight.lat, highlight.lng]}
            radius={8}
            pathOptions={{ color: "#ffffff", weight: 3, fillColor: HIGHLIGHT_COLOR, fillOpacity: 1 }}
          />
        )}
      </MapContainer>
    </div>
  );
}

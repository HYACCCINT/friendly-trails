import type { LatLng } from "@/lib/trails/types";

/** A decorative outline of the route, projected into a 100×100 box. No map tiles needed. */
export function RouteSilhouette({ route, className }: { route: LatLng[]; className?: string }) {
  if (route.length < 2) return null;

  const size = 100;
  const padding = 8;
  const meanLat = route.reduce((sum, point) => sum + point.lat, 0) / route.length;
  const lngScale = Math.cos((meanLat * Math.PI) / 180);
  const xs = route.map((point) => point.lng * lngScale);
  const ys = route.map((point) => -point.lat);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = (size - padding * 2) / Math.max(maxX - minX, maxY - minY, 1e-9);
  const offsetX = (size - (maxX - minX) * scale) / 2;
  const offsetY = (size - (maxY - minY) * scale) / 2;
  const points = xs.map((x, i) => [offsetX + (x - minX) * scale, offsetY + (ys[i] - minY) * scale]);
  const path = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

  return (
    <svg className={className} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" focusable="false">
      <path className="route-silhouette__path" d={path} />
      <circle className="route-silhouette__start" cx={points[0][0]} cy={points[0][1]} r={3.4} />
    </svg>
  );
}

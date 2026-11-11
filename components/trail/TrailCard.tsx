import Link from "next/link";
import { DIFFICULTY_LABEL, formatDistance, formatDuration } from "@/lib/trails/format";
import type { Trail } from "@/lib/trails/types";
import { ElevationSparkline } from "./ElevationProfile";
import { RouteSilhouette } from "./RouteSilhouette";
import { StatusBadge } from "./StatusBadge";

export function TrailCard({ trail, href, prefetch }: { trail: Trail; href: string; prefetch?: boolean }) {
  return (
    <article className="trail-card">
      <div className="trail-card__art">
        <RouteSilhouette route={trail.route} className="route-silhouette" />
        <StatusBadge status={trail.status} />
      </div>
      <div className="trail-card__body">
        <h3 className="trail-card__title">
          {/* The link stretches over the whole card (see .trail-card__link::after). */}
          <Link href={href} prefetch={prefetch} className="trail-card__link">
            {trail.name}
          </Link>
        </h3>
        <p className="trail-card__region">{trail.region}</p>
        <ElevationSparkline elevation={trail.elevation} />
        <ul className="trail-card__facts" aria-label="Trail facts">
          <li>{formatDistance(trail.distanceKm)}</li>
          <li>{formatDuration(trail.durationMin)}</li>
          <li>{DIFFICULTY_LABEL[trail.difficulty]}</li>
          {trail.dogFriendly && <li>Dog-friendly</li>}
        </ul>
      </div>
    </article>
  );
}

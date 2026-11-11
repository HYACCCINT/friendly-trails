import { DIFFICULTY_LABEL, formatDistance, formatDuration, formatElevation } from "@/lib/trails/format";
import type { Trail } from "@/lib/trails/types";

export function TrailStats({ trail }: { trail: Trail }) {
  return (
    <dl className="stats">
      <div>
        <dt>Distance</dt>
        <dd>{formatDistance(trail.distanceKm)}</dd>
      </div>
      <div>
        <dt>Elevation gain</dt>
        <dd>{formatElevation(trail.elevationGainM)}</dd>
      </div>
      <div>
        <dt>Time</dt>
        <dd>{formatDuration(trail.durationMin)}</dd>
      </div>
      <div>
        <dt>Difficulty</dt>
        <dd>{DIFFICULTY_LABEL[trail.difficulty]}</dd>
      </div>
      <div>
        <dt>Route</dt>
        <dd>{trail.loop ? "Loop" : "One way"}</dd>
      </div>
      <div>
        <dt>Dog-friendly</dt>
        <dd>{trail.dogFriendly ? "Yes" : "No"}</dd>
      </div>
    </dl>
  );
}

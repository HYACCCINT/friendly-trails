import { STATUS_LABEL } from "@/lib/trails/format";
import type { TrailStatus } from "@/lib/trails/types";

const ICON: Record<TrailStatus, string> = { open: "✓", caution: "!", closed: "✕" };

interface StatusBadgeProps {
  status: TrailStatus;
  /** True while a local change is waiting to reach the server. */
  syncing?: boolean;
  size?: "md" | "lg";
}

export function StatusBadge({ status, syncing = false, size = "md" }: StatusBadgeProps) {
  return (
    <span className={`status status--${status}${size === "lg" ? " status--lg" : ""}`}>
      <span className="status__icon" aria-hidden="true">
        {ICON[status]}
      </span>
      {STATUS_LABEL[status]}
      {syncing && <span className="status__syncing">Syncing</span>}
    </span>
  );
}

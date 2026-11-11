"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onSnapshotResume, type DocumentSnapshot } from "firebase/firestore";
import { StatusBadge } from "@/components/trail/StatusBadge";
import { getClientDb } from "@/lib/firebase/client";
import { toTrail } from "@/lib/trails/convert";
import { formatRelative } from "@/lib/trails/format";
import type { TrailStatus } from "@/lib/trails/types";

export interface Conditions {
  status: TrailStatus;
  statusNote: string;
  /** Milliseconds since the epoch, or null. */
  lastReportAt: number | null;
}

const ConditionsContext = createContext<Conditions | null>(null);

/**
 * The handoff. The server rendered the first frame from its own read of the trail and passed
 * that snapshot along (`snapshot.toJSON()`). The browser starts a live listener from that
 * snapshot (`onSnapshotResume`): the first client render uses the server's data, and later
 * changes stream in through the listener.
 */
export function LiveConditionsProvider({
  snapshot,
  initial,
  children,
}: {
  snapshot: object;
  initial: Conditions;
  children: ReactNode;
}) {
  const [conditions, setConditions] = useState(initial);

  useEffect(
    () =>
      onSnapshotResume(
        getClientDb(),
        snapshot,
        (live: DocumentSnapshot) => {
          if (!live.exists()) return;
          const trail = toTrail(live);
          setConditions({
            status: trail.status,
            statusNote: trail.statusNote,
            lastReportAt: trail.lastReportAt?.getTime() ?? null,
          });
        },
        (error) => console.warn("Live trail conditions stopped:", error),
      ),
    [snapshot],
  );

  return <ConditionsContext value={conditions}>{children}</ConditionsContext>;
}

function useConditions(): Conditions {
  const conditions = useContext(ConditionsContext);
  if (!conditions) throw new Error("useConditions() must be used inside <LiveConditionsProvider>.");
  return conditions;
}

export function LiveStatusBadge() {
  return <StatusBadge status={useConditions().status} />;
}

export function LiveConditionsPanel() {
  const { status, statusNote, lastReportAt } = useConditions();
  return (
    <div className="conditions">
      <StatusBadge status={status} size="lg" />
      {statusNote && <p className="conditions__note">{statusNote}</p>}
      {/* Relative times can differ by a minute between the server render and hydration. */}
      <p className="conditions__meta" suppressHydrationWarning>
        {lastReportAt ? `Reported ${formatRelative(new Date(lastReportAt))}` : "No recent reports"}
      </p>
    </div>
  );
}

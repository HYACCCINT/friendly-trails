"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { ElevationProfileInteractive } from "@/components/interactive/ElevationProfileInteractive";
import { TrailMapLazy } from "@/components/interactive/TrailMapLazy";
import { StatusBadge } from "@/components/trail/StatusBadge";
import { TrailStats } from "@/components/trail/TrailStats";
import { Spinner } from "@/components/ui/Spinner";
import { getClientDb } from "@/lib/firebase/client";
import { toTrail } from "@/lib/trails/convert";
import { formatRelative } from "@/lib/trails/format";
import type { Trail } from "@/lib/trails/types";
import { ReportConditionForm } from "../../_components/ReportConditionForm";
import { SaveTrailButton } from "../../_components/SaveTrailButton";

type PageState =
  | { kind: "loading" }
  | { kind: "missing" }
  | { kind: "error"; message: string }
  | { kind: "ready"; trail: Trail; syncing: boolean };

export default function TrailPage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<PageState>({ kind: "loading" });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // v1: subscribe to the trail from the browser. Conditions update live for everyone,
  // and our own reports show up instantly thanks to latency compensation.
  useEffect(
    () =>
      onSnapshot(
        doc(getClientDb(), "trails", id),
        { includeMetadataChanges: true },
        (snapshot) =>
          setState(
            snapshot.exists()
              ? { kind: "ready", trail: toTrail(snapshot), syncing: snapshot.metadata.hasPendingWrites }
              : { kind: "missing" },
          ),
        (err) => setState({ kind: "error", message: err.message }),
      ),
    [id],
  );

  const trailName = state.kind === "ready" ? state.trail.name : null;
  // The server-rendered HTML only ever says "Friendly Trails". The real title appears after
  // the data loads, so only people (and crawlers) that run JavaScript ever see it.
  useEffect(() => {
    if (trailName) document.title = `${trailName} · Friendly Trails`;
  }, [trailName]);

  if (state.kind === "loading") return <Spinner label="Loading trail" />;
  if (state.kind === "missing" || state.kind === "error") {
    return (
      <div className="empty">
        <h1>{state.kind === "missing" ? "Trail not found" : "Couldn’t load this trail"}</h1>
        {state.kind === "error" && <p>{state.message}</p>}
        <p>
          <Link href="/v1">Back to all trails</Link>
        </p>
      </div>
    );
  }

  const { trail, syncing } = state;
  const lastSample = trail.elevation.length - 1;
  const highlight =
    hoverIndex === null
      ? null
      : trail.route[Math.round((hoverIndex / lastSample) * (trail.route.length - 1))];

  return (
    <article className="trail">
      <header className="trail__header">
        <p className="eyebrow">
          <Link href="/v1">All trails</Link>
          <span aria-hidden="true">/</span>
          <span>{trail.region}</span>
        </p>
        <h1>{trail.name}</h1>
        <p className="trail__summary">{trail.summary}</p>
        <div className="trail__actions">
          <StatusBadge status={trail.status} syncing={syncing} />
          <SaveTrailButton trail={trail} />
        </div>
      </header>

      <div className="trail__layout">
        <div className="trail__main">
          <TrailMapLazy route={trail.route} highlight={highlight} label={`Map of ${trail.name}`} />

          <section className="panel" aria-labelledby="elevation-heading">
            <h2 id="elevation-heading">Elevation</h2>
            <ElevationProfileInteractive
              elevation={trail.elevation}
              distanceKm={trail.distanceKm}
              onHover={setHoverIndex}
            />
          </section>

          <section className="panel" aria-labelledby="about-heading">
            <h2 id="about-heading">About this trail</h2>
            {trail.description.split("\n\n").map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <ul className="tag-list" aria-label="Highlights">
              {trail.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="trail__side">
          <section className="panel" aria-labelledby="stats-heading">
            <h2 id="stats-heading">At a glance</h2>
            <TrailStats trail={trail} />
          </section>

          <section className="panel" aria-labelledby="conditions-heading">
            <h2 id="conditions-heading">Conditions</h2>
            <div className="conditions">
              <StatusBadge status={trail.status} syncing={syncing} size="lg" />
              {trail.statusNote && <p className="conditions__note">{trail.statusNote}</p>}
              <p className="conditions__meta">
                {trail.lastReportAt ? `Reported ${formatRelative(trail.lastReportAt)}` : "No recent reports"}
              </p>
            </div>
            <ReportConditionForm trailId={trail.id} currentStatus={trail.status} />
          </section>
        </aside>
      </div>
    </article>
  );
}

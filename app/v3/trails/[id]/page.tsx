import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { ElevationProfile } from "@/components/trail/ElevationProfile";
import { TrailStats } from "@/components/trail/TrailStats";
import { getServerFirebase } from "@/lib/firebase/server-app";
import { toTrail } from "@/lib/trails/convert";
import { LiveConditionsPanel, LiveConditionsProvider, LiveStatusBadge } from "../../_components/LiveConditions";
import { ReportForm } from "../../_components/ReportForm";
import { ElevationHoverLayer, RouteHoverProvider, TrailMapHover } from "../../_components/RouteHover";
import { SaveButton } from "../../_components/SaveButton";

type Params = Promise<{ id: string }>;

/** One read per request, shared by the page and its metadata. */
const getTrailSnapshot = cache(async (id: string) => {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  const { db } = await getServerFirebase();
  const snapshot = await getDoc(doc(db, "trails", id));
  return snapshot.exists() ? snapshot : null;
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const snapshot = await getTrailSnapshot((await params).id);
  if (!snapshot) return { title: "Trail not found · Friendly Trails" };
  const trail = toTrail(snapshot);
  return { title: `${trail.name} · Friendly Trails`, description: trail.summary };
}

// v3: the server renders the first frame. Only what people touch, or what changes while they
// look, runs in the browser: the conditions, the map, the chart hover, save, and report.
export default async function TrailPage({ params }: { params: Params }) {
  const { id } = await params;
  const snapshot = await getTrailSnapshot(id);
  if (!snapshot) notFound();
  const trail = toTrail(snapshot);

  // Read as the visitor: security rules only let people see their own saved list.
  const { db, user } = await getServerFirebase();
  const saved = user ? (await getDoc(doc(db, "users", user.uid, "saved", trail.id))).exists() : false;

  return (
    <LiveConditionsProvider
      snapshot={snapshot.toJSON()}
      initial={{
        status: trail.status,
        statusNote: trail.statusNote,
        lastReportAt: trail.lastReportAt?.getTime() ?? null,
      }}
    >
      <article className="trail">
        <header className="trail__header">
          <p className="eyebrow">
            <Link href="/v3" prefetch>
              All trails
            </Link>
            <span aria-hidden="true">/</span>
            <span>{trail.region}</span>
          </p>
          <h1>{trail.name}</h1>
          <p className="trail__summary">{trail.summary}</p>
          <div className="trail__actions">
            <LiveStatusBadge />
            <SaveButton
              trail={{
                id: trail.id,
                name: trail.name,
                region: trail.region,
                distanceKm: trail.distanceKm,
                difficulty: trail.difficulty,
              }}
              initialSaved={saved}
            />
          </div>
        </header>

        <RouteHoverProvider>
          <div className="trail__layout">
            <div className="trail__main">
              <TrailMapHover route={trail.route} samples={trail.elevation.length} label={`Map of ${trail.name}`} />

              <section className="panel" aria-labelledby="elevation-heading">
                <h2 id="elevation-heading">Elevation</h2>
                <ElevationHoverLayer elevation={trail.elevation} distanceKm={trail.distanceKm}>
                  {/* The chart itself is server-rendered SVG. Only the hover layer is client code. */}
                  <ElevationProfile elevation={trail.elevation} distanceKm={trail.distanceKm} />
                </ElevationHoverLayer>
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
                <LiveConditionsPanel />
                <ReportForm trailId={trail.id} currentStatus={trail.status} />
              </section>
            </aside>
          </div>
        </RouteHoverProvider>
      </article>
    </LiveConditionsProvider>
  );
}

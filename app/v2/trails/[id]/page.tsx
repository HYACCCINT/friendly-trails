import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TrailMapLazy } from "@/components/interactive/TrailMapLazy";
import { ElevationProfile } from "@/components/trail/ElevationProfile";
import { StatusBadge } from "@/components/trail/StatusBadge";
import { TrailStats } from "@/components/trail/TrailStats";
import { getSessionUser } from "@/lib/auth/session";
import { STATUS_LABEL, formatRelative } from "@/lib/trails/format";
import { getTrail, isTrailSaved } from "@/lib/trails/server";
import { STATUSES } from "@/lib/trails/types";
import { reportCondition, toggleSavedTrail } from "../../actions";
import { SignInButton } from "../../_components/AuthClient";

type Params = Promise<{ id: string }>;

// v2: the title and description are in the HTML, so crawlers and link previews see the trail.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const trail = await getTrail((await params).id);
  return trail
    ? { title: `${trail.name} · Friendly Trails`, description: trail.summary }
    : { title: "Trail not found · Friendly Trails" };
}

export default async function TrailPage({ params }: { params: Params }) {
  const { id } = await params;
  const [trail, user] = await Promise.all([getTrail(id), getSessionUser()]);
  if (!trail) notFound();
  const saved = user ? await isTrailSaved(user.uid, trail.id) : false;

  return (
    <article className="trail">
      <header className="trail__header">
        <p className="eyebrow">
          <Link href="/v2">All trails</Link>
          <span aria-hidden="true">/</span>
          <span>{trail.region}</span>
        </p>
        <h1>{trail.name}</h1>
        <p className="trail__summary">{trail.summary}</p>
        <div className="trail__actions">
          <StatusBadge status={trail.status} />
          {user ? (
            // A Server Function: the button only changes after the server answers.
            <form action={toggleSavedTrail.bind(null, trail.id)}>
              <button type="submit" className="button button--save" aria-pressed={saved}>
                <span aria-hidden="true">{saved ? "★" : "☆"}</span>
                {saved ? "Saved" : "Save trail"}
              </button>
            </form>
          ) : (
            <SignInButton className="button button--save">
              <span aria-hidden="true">☆</span>
              Save trail
            </SignInButton>
          )}
        </div>
      </header>

      <div className="trail__layout">
        <div className="trail__main">
          {/* Leaflet needs `window`, so the map is client-only, even in the all-server version. */}
          <TrailMapLazy route={trail.route} label={`Map of ${trail.name}`} />

          <section className="panel" aria-labelledby="elevation-heading">
            <h2 id="elevation-heading">Elevation</h2>
            {/* Server-rendered SVG. Hovering to find a point on the map would need client code. */}
            <ElevationProfile elevation={trail.elevation} distanceKm={trail.distanceKm} />
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
            {/* A snapshot from when this page was rendered. It won't change until you reload. */}
            <div className="conditions">
              <StatusBadge status={trail.status} size="lg" />
              {trail.statusNote && <p className="conditions__note">{trail.statusNote}</p>}
              <p className="conditions__meta">
                {trail.lastReportAt ? `Reported ${formatRelative(trail.lastReportAt)}` : "No recent reports"}
              </p>
            </div>

            {user ? (
              <form className="report-form" action={reportCondition.bind(null, trail.id)}>
                <fieldset className="field">
                  <legend>How is the trail right now?</legend>
                  <div className="chip-group">
                    {STATUSES.map((option) => (
                      <label key={option} className={`chip chip--${option}`}>
                        <input type="radio" name="status" value={option} defaultChecked={trail.status === option} />
                        <span>{STATUS_LABEL[option]}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="field">
                  <label htmlFor="report-note">Details (optional)</label>
                  <textarea
                    id="report-note"
                    name="note"
                    rows={2}
                    maxLength={140}
                    placeholder="e.g. Muddy after the rain"
                  />
                </div>
                <button type="submit" className="button">
                  Send report
                </button>
              </form>
            ) : (
              <p className="muted">
                Out on this trail? <SignInButton className="link-button">Sign in</SignInButton> to report conditions.
              </p>
            )}
          </section>
        </aside>
      </div>
    </article>
  );
}

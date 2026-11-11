import type { Metadata } from "next";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { DIFFICULTY_LABEL, formatDistance } from "@/lib/trails/format";
import { getSavedTrails } from "@/lib/trails/server";
import { SignInButton } from "../_components/AuthClient";

export const metadata: Metadata = { title: "Saved trails · Friendly Trails" };

// v2: the server knows who you are from the session cookie and reads your list with the
// Admin SDK. The rules that keep lists private don't apply here: this code is the check.
export default async function SavedPage() {
  const user = await getSessionUser();
  const saved = user ? await getSavedTrails(user.uid) : [];

  return (
    <div className="saved">
      <header className="page-intro">
        <h1>Saved trails</h1>
        <p>Your shortlist for the next weekend.</p>
      </header>

      {!user ? (
        <div className="empty">
          <p>Sign in to save trails and see them here.</p>
          <SignInButton />
        </div>
      ) : saved.length === 0 ? (
        <div className="empty">
          <p>No saved trails yet.</p>
          <Link href="/v2" className="button button--ghost">
            Explore trails
          </Link>
        </div>
      ) : (
        <ul className="saved-list">
          {saved.map((item) => (
            <li key={item.trailId} className="saved-item">
              <div>
                <Link href={`/v2/trails/${item.trailId}`}>{item.name}</Link>
                <p className="saved-item__meta">
                  {item.region} · {formatDistance(item.distanceKm)} · {DIFFICULTY_LABEL[item.difficulty]}
                </p>
              </div>
              <span aria-hidden="true" className="saved-item__arrow">
                →
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

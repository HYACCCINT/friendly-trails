"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { Spinner } from "@/components/ui/Spinner";
import { getClientDb } from "@/lib/firebase/client";
import { toSavedTrail } from "@/lib/trails/convert";
import { DIFFICULTY_LABEL, formatDistance } from "@/lib/trails/format";
import type { SavedTrail } from "@/lib/trails/types";
import { useAuth } from "../_components/AuthProvider";

export default function SavedPage() {
  const { user, ready, signIn } = useAuth();
  const [saved, setSaved] = useState<SavedTrail[] | null>(null);

  // v1: thanks to Firestore's persistent cache, this list also works offline.
  useEffect(() => {
    if (!user) return;
    return onSnapshot(collection(getClientDb(), "users", user.uid, "saved"), (snapshot) => {
      const items = snapshot.docs.map(toSavedTrail);
      items.sort((a, b) => (b.savedAt?.getTime() ?? 0) - (a.savedAt?.getTime() ?? 0));
      setSaved(items);
    });
  }, [user]);

  return (
    <div className="saved">
      <header className="page-intro">
        <h1>Saved trails</h1>
        <p>Your shortlist for the next weekend. Available offline, too.</p>
      </header>

      {!ready ? (
        <Spinner label="Checking sign-in" />
      ) : !user ? (
        <div className="empty">
          <p>Sign in to save trails and see them here.</p>
          <button type="button" className="button" onClick={signIn}>
            Sign in
          </button>
        </div>
      ) : saved === null ? (
        <Spinner label="Loading saved trails" />
      ) : saved.length === 0 ? (
        <div className="empty">
          <p>No saved trails yet.</p>
          <Link href="/v1" className="button button--ghost">
            Explore trails
          </Link>
        </div>
      ) : (
        <ul className="saved-list">
          {saved.map((item) => (
            <li key={item.trailId} className="saved-item">
              <div>
                <Link href={`/v1/trails/${item.trailId}`} prefetch>
                  {item.name}
                </Link>
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

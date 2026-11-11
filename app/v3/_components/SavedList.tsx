"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot } from "firebase/firestore";
import { Spinner } from "@/components/ui/Spinner";
import { getClientDb } from "@/lib/firebase/client";
import { toSavedTrail } from "@/lib/trails/convert";
import { DIFFICULTY_LABEL, formatDistance } from "@/lib/trails/format";
import type { SavedTrail } from "@/lib/trails/types";
import { useSession } from "./SessionProvider";

export type SavedItem = Omit<SavedTrail, "savedAt">;

/**
 * v3 saved list: the server renders the first frame (read as the user), then a live listener
 * takes over. The listener reads Firestore's offline cache, so the list works without a network.
 */
export function SavedList({ initial }: { initial: SavedItem[] | null }) {
  const { user, clientUid, signIn } = useSession();
  const [items, setItems] = useState(initial);

  useEffect(() => {
    if (!clientUid) return;
    return onSnapshot(collection(getClientDb(), "users", clientUid, "saved"), (snapshot) => {
      const saved = snapshot.docs.map(toSavedTrail);
      saved.sort((a, b) => (b.savedAt?.getTime() ?? 0) - (a.savedAt?.getTime() ?? 0));
      setItems(saved.map(({ savedAt: _savedAt, ...item }) => item));
    });
  }, [clientUid]);

  if (!user) {
    return (
      <div className="empty">
        <p>Sign in to save trails and see them here.</p>
        <button type="button" className="button" onClick={signIn}>
          Sign in
        </button>
      </div>
    );
  }
  if (items === null) return <Spinner label="Loading saved trails" />;
  if (items.length === 0) {
    return (
      <div className="empty">
        <p>No saved trails yet.</p>
        <Link href="/v3" prefetch className="button button--ghost">
          Explore trails
        </Link>
      </div>
    );
  }
  return (
    <ul className="saved-list">
      {items.map((item) => (
        <li key={item.trailId} className="saved-item">
          <div>
            <Link href={`/v3/trails/${item.trailId}`} prefetch>
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
  );
}

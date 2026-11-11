"use client";

import { useEffect, useState } from "react";
import { deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import type { Trail } from "@/lib/trails/types";

export type SaveableTrail = Pick<Trail, "id" | "name" | "region" | "distanceKm" | "difficulty">;

interface SaveTrailButtonProps {
  trail: SaveableTrail;
  /** The browser's signed-in Firebase user, or null (signed out, or not restored yet). */
  uid: string | null;
  /** Firebase Auth has finished restoring the session in this browser. */
  ready: boolean;
  onSignIn: () => void;
  /** v3: the server already knows whether this trail is saved, so the first frame is right. */
  initialSaved?: boolean;
}

// Shared by the SPA and v3: writes go straight from the browser to Firestore. Security rules
// decide what's allowed, and latency compensation makes the button flip instantly, even offline.
export function SaveTrailButton({ trail, uid, ready, onSignIn, initialSaved = false }: SaveTrailButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [unconfirmedWrites, setUnconfirmedWrites] = useState(0);

  useEffect(() => {
    if (!uid) {
      if (ready) setSaved(false);
      return;
    }
    // The listener fires with the local write right away, before the server has answered.
    return onSnapshot(doc(getClientDb(), "users", uid, "saved", trail.id), (snapshot) =>
      setSaved(snapshot.exists()),
    );
  }, [uid, ready, trail.id]);

  async function toggle() {
    if (!uid) {
      if (ready) onSignIn();
      return;
    }
    const ref = doc(getClientDb(), "users", uid, "saved", trail.id);
    // The write promise only settles once the server confirms, which can take a while offline.
    setUnconfirmedWrites((count) => count + 1);
    try {
      if (saved) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, {
          trailId: trail.id,
          name: trail.name,
          region: trail.region,
          distanceKm: trail.distanceKm,
          difficulty: trail.difficulty,
          savedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      // If the rules reject the write, the snapshot listener rolls the button back.
      console.error("Could not update saved trail", error);
    } finally {
      setUnconfirmedWrites((count) => count - 1);
    }
  }

  return (
    <button type="button" className="button button--save" aria-pressed={saved} onClick={toggle}>
      <span aria-hidden="true">{saved ? "★" : "☆"}</span>
      {saved ? "Saved" : "Save trail"}
      {unconfirmedWrites > 0 && <span className="button__hint">syncing</span>}
    </button>
  );
}

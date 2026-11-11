import { cache } from "react";
import { adminDb } from "@/lib/firebase/admin";
import { toSavedTrail, toTrail } from "./convert";
import type { SavedTrail, Trail } from "./types";

// Server-side reads (v2). These run on every request: there is no cache, so the data is
// fresh when the page renders, and starts going stale the moment it reaches the browser.

export async function getTrails(): Promise<Trail[]> {
  const snapshot = await adminDb().collection("trails").orderBy("name").get();
  // GeoPoint and Timestamp instances can't be passed to client components, so convert first.
  return snapshot.docs.map(toTrail);
}

/** Wrapped in `cache` so the page and its metadata share one read per request. */
export const getTrail = cache(async (id: string): Promise<Trail | null> => {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  const snapshot = await adminDb().collection("trails").doc(id).get();
  return snapshot.exists ? toTrail(snapshot) : null;
});

export async function getSavedTrails(uid: string): Promise<SavedTrail[]> {
  const snapshot = await adminDb().collection("users").doc(uid).collection("saved").orderBy("savedAt", "desc").get();
  return snapshot.docs.map(toSavedTrail);
}

export async function isTrailSaved(uid: string, trailId: string): Promise<boolean> {
  const snapshot = await adminDb().collection("users").doc(uid).collection("saved").doc(trailId).get();
  return snapshot.exists;
}

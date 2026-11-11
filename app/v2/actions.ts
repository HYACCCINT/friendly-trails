"use server";

import { refresh } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { getSessionUser } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin";
import { STATUSES, type TrailStatus } from "@/lib/trails/types";

// v2: every write is a Server Function. It runs with the Admin SDK, so Firestore Security
// Rules don't apply: each function has to check who is calling and what they send, just
// like firestore.rules does for v1. Anyone can call a Server Function directly, so never
// trust that the form was the only way in.

const TRAIL_ID = /^[a-z0-9-]+$/;
const MAX_NOTE_LENGTH = 140;

async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("Sign in first.");
  return user;
}

export async function toggleSavedTrail(trailId: string): Promise<void> {
  const user = await requireUser();
  if (!TRAIL_ID.test(trailId)) throw new Error("Unknown trail.");

  const db = adminDb();
  const savedRef = db.collection("users").doc(user.uid).collection("saved").doc(trailId);
  const [saved, trail] = await Promise.all([savedRef.get(), db.collection("trails").doc(trailId).get()]);

  if (saved.exists) {
    await savedRef.delete();
  } else {
    if (!trail.exists) throw new Error("Unknown trail.");
    const { name, region, distanceKm, difficulty } = trail.data()!;
    await savedRef.set({ trailId, name, region, distanceKm, difficulty, savedAt: FieldValue.serverTimestamp() });
  }

  // Re-render the current page on the server, with the new data.
  refresh();
}

export async function reportCondition(trailId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  if (!TRAIL_ID.test(trailId)) throw new Error("Unknown trail.");

  const status = String(formData.get("status"));
  if (!STATUSES.includes(status as TrailStatus)) throw new Error("Pick a trail status.");
  const note = String(formData.get("note") ?? "").trim();
  if (note.length > MAX_NOTE_LENGTH) throw new Error(`Keep it under ${MAX_NOTE_LENGTH} characters.`);

  const db = adminDb();
  const trailRef = db.collection("trails").doc(trailId);
  const reportRef = db.collection("reports").doc();

  await db.runTransaction(async (transaction) => {
    if (!(await transaction.get(trailRef)).exists) throw new Error("Unknown trail.");
    transaction.create(reportRef, {
      trailId,
      status,
      note,
      uid: user.uid,
      createdAt: FieldValue.serverTimestamp(),
    });
    transaction.update(trailRef, {
      status,
      statusNote: note,
      lastReportAt: FieldValue.serverTimestamp(),
      lastReportId: reportRef.id,
    });
  });

  // Only this browser sees the new status now. Everyone else sees it on their next request.
  refresh();
}

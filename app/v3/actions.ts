"use server";

import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { getSessionUser } from "@/lib/auth/session";
import { adminDb } from "@/lib/firebase/admin";
import { MAX_NOTE_LENGTH, REPORT_COOLDOWN_MS, type ReportState } from "@/lib/trails/report";
import { STATUSES, type TrailStatus } from "@/lib/trails/types";

class ReportRejected extends Error {}

const TRAIL_ID = /^[a-z0-9-]+$/;

/**
 * v3: the one write that goes through the server. It's privileged logic that doesn't belong
 * in security rules: limit each person to one report a minute, then update a shared document.
 *
 * Server Functions are public endpoints, so check everything: who's calling, and what they sent.
 * (In a real app, also remove the browser's report path from firestore.rules so this is the
 * only way in. It stays here because v1 still writes reports from the browser.)
 */
export async function reportCondition(
  trailId: string,
  _previous: ReportState | null,
  formData: FormData,
): Promise<ReportState> {
  const user = await getSessionUser();
  if (!user) return { ok: false, message: "Sign in to report conditions." };
  if (!TRAIL_ID.test(trailId)) return { ok: false, message: "Unknown trail." };

  const status = String(formData.get("status"));
  if (!STATUSES.includes(status as TrailStatus)) return { ok: false, message: "Pick a trail status." };
  const note = String(formData.get("note") ?? "").trim();
  if (note.length > MAX_NOTE_LENGTH) return { ok: false, message: `Keep it under ${MAX_NOTE_LENGTH} characters.` };

  const db = adminDb();
  const trailRef = db.collection("trails").doc(trailId);
  const limitRef = db.collection("rateLimits").doc(user.uid);
  const reportRef = db.collection("reports").doc();

  try {
    await db.runTransaction(async (transaction) => {
      const [trail, limit] = await Promise.all([transaction.get(trailRef), transaction.get(limitRef)]);
      if (!trail.exists) throw new ReportRejected("Unknown trail.");

      const last = limit.get("lastReportAt") as Timestamp | undefined;
      const wait = last ? REPORT_COOLDOWN_MS - (Date.now() - last.toMillis()) : 0;
      if (wait > 0) throw new ReportRejected(`You just sent a report. Try again in ${Math.ceil(wait / 1000)} s.`);

      transaction.create(reportRef, { trailId, status, note, uid: user.uid, createdAt: FieldValue.serverTimestamp() });
      transaction.update(trailRef, {
        status,
        statusNote: note,
        lastReportAt: FieldValue.serverTimestamp(),
        lastReportId: reportRef.id,
      });
      transaction.set(limitRef, { lastReportAt: FieldValue.serverTimestamp() });
    });
  } catch (error) {
    if (error instanceof ReportRejected) return { ok: false, message: error.message };
    throw error;
  }

  // No refresh() needed: every open trail page has a live listener and updates by itself.
  return { ok: true, message: "Thanks! Your report is live." };
}

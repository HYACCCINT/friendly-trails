// Seeds the real "friendly-trails" Firestore database with the demo trails.
// It only creates trails that don't exist yet, so it never overwrites live conditions.
//
// Uses Application Default Credentials (`gcloud auth application-default login`).
// Usage: npm run seed:production

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { GeoPoint, Timestamp, getFirestore } from "firebase-admin/firestore";
import { buildTrails } from "./trail-data.mjs";

const PROJECT_ID = "friendly-trails";

if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.error("FIRESTORE_EMULATOR_HOST is set. Use `npm run seed` for the emulator instead.");
  process.exit(1);
}

initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
const db = getFirestore();

let created = 0;
let skipped = 0;
for (const { id, start, route, lastReportHoursAgo, ...fields } of buildTrails()) {
  try {
    await db.collection("trails").doc(id).create({
      ...fields,
      start: new GeoPoint(start.lat, start.lng),
      route: route.map((point) => new GeoPoint(point.lat, point.lng)),
      lastReportAt:
        lastReportHoursAgo === null ? null : Timestamp.fromMillis(Date.now() - lastReportHoursAgo * 3_600_000),
      lastReportId: null,
    });
    created++;
  } catch (error) {
    // gRPC code 6: ALREADY_EXISTS. Leave the live document alone.
    if (error.code === 6) {
      skipped++;
      continue;
    }
    throw error;
  }
}

console.log(`${PROJECT_ID}: created ${created} trails, left ${skipped} existing trails untouched.`);

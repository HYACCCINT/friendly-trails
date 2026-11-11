// Seeds the local Firestore emulator with the demo trails.
// Run it through `npm run dev:all`, which starts the emulators first.

import { initializeApp } from "firebase-admin/app";
import { GeoPoint, Timestamp, getFirestore } from "firebase-admin/firestore";
import { buildTrails } from "./trail-data.mjs";

const PROJECT_ID = "demo-friendly-trails";

// Safety net: only ever write to the emulator, never to a real project.
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error(
    "Refusing to seed: FIRESTORE_EMULATOR_HOST is not set.\n" +
      "Run `npm run dev:all` so the seed only touches the local emulator.",
  );
  process.exit(1);
}

initializeApp({ projectId: PROJECT_ID });
const db = getFirestore();

const trails = buildTrails();
const batch = db.batch();

for (const { id, start, route, lastReportHoursAgo, ...fields } of trails) {
  batch.set(db.collection("trails").doc(id), {
    ...fields,
    start: new GeoPoint(start.lat, start.lng),
    route: route.map((point) => new GeoPoint(point.lat, point.lng)),
    lastReportAt:
      lastReportHoursAgo === null ? null : Timestamp.fromMillis(Date.now() - lastReportHoursAgo * 3_600_000),
    lastReportId: null,
  });
}

await batch.commit();
console.log(`Seeded ${trails.length} trails into the Firestore emulator at ${process.env.FIRESTORE_EMULATOR_HOST}.`);

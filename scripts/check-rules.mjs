// Exercises firestore.rules against the local emulators with the real web SDK.
// Run with `npm run check:rules` (it starts the emulators and seeds them first).

import { initializeApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInAnonymously,
  signOut,
} from "firebase/auth";
import {
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.error("Run this through `npm run check:rules` so it only talks to the emulators.");
  process.exit(1);
}

const app = initializeApp({ apiKey: "demo-api-key", projectId: "demo-friendly-trails", appId: "demo" });
const auth = getAuth(app);
const db = getFirestore(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
connectFirestoreEmulator(db, "127.0.0.1", 8080);

const TRAIL_ID = "storm-king-loop";
const OTHER_TRAIL_ID = "greenbelt-forest-loop";
let failures = 0;

async function expectAllowed(name, operation) {
  try {
    await operation();
    console.log(`  ✓ allowed   ${name}`);
  } catch (error) {
    failures++;
    console.log(`  ✗ expected allowed, got ${error.code ?? error.message}: ${name}`);
  }
}

async function expectDenied(name, operation) {
  try {
    await operation();
    failures++;
    console.log(`  ✗ expected denied, but it was allowed: ${name}`);
  } catch (error) {
    if (error.code === "permission-denied") {
      console.log(`  ✓ denied    ${name}`);
    } else {
      failures++;
      console.log(`  ✗ expected permission-denied, got ${error.code ?? error.message}: ${name}`);
    }
  }
}

function reportBatch({ uid, trailId = TRAIL_ID, status = "caution", note = "Muddy", trailStatus, trailNote, extra = {} }) {
  const reportRef = doc(collection(db, "reports"));
  const batch = writeBatch(db);
  batch.set(reportRef, { trailId, status, note, uid, createdAt: serverTimestamp(), ...extra });
  batch.update(doc(db, "trails", trailId), {
    status: trailStatus ?? status,
    statusNote: trailNote ?? note,
    lastReportAt: serverTimestamp(),
    lastReportId: reportRef.id,
  });
  return batch.commit();
}

const trail = (await getDoc(doc(db, "trails", TRAIL_ID))).data();
const otherTrail = (await getDoc(doc(db, "trails", OTHER_TRAIL_ID))).data();
const savedFields = (source, trailId) => ({
  trailId,
  name: source.name,
  region: source.region,
  distanceKm: source.distanceKm,
  difficulty: source.difficulty,
  savedAt: serverTimestamp(),
});

console.log("\nSigned out");
await expectAllowed("read a trail", () => getDoc(doc(db, "trails", TRAIL_ID)));
await expectAllowed("list trails", () => getDocs(collection(db, "trails")));
await expectDenied("change a trail's status", () =>
  updateDoc(doc(db, "trails", TRAIL_ID), { status: "closed" }),
);
await expectDenied("create a report", () => reportBatch({ uid: "nobody" }));

console.log("\nSigned in anonymously");
await signInAnonymously(auth);
const anonUid = auth.currentUser.uid;
await expectDenied("report as an anonymous user", () => reportBatch({ uid: anonUid }));
await signOut(auth);

console.log("\nSigned in as Alice");
const alice = (await createUserWithEmailAndPassword(auth, `alice-${Date.now()}@example.com`, "password123")).user;
await expectAllowed("report a condition (report + trail update in one batch)", () =>
  reportBatch({ uid: alice.uid, status: "caution", note: "Muddy after rain" }),
);
await expectDenied("change status without a report", () =>
  updateDoc(doc(db, "trails", TRAIL_ID), {
    status: "closed",
    statusNote: "",
    lastReportAt: serverTimestamp(),
    lastReportId: "no-such-report",
  }),
);
await expectDenied("edit another trail field (name)", () =>
  updateDoc(doc(db, "trails", TRAIL_ID), { name: "Hacked" }),
);
await expectDenied("report as someone else", () => reportBatch({ uid: "someone-else" }));
await expectDenied("report with a 1,000-character note", () => reportBatch({ uid: alice.uid, note: "x".repeat(1000) }));
await expectDenied("report with an extra field", () => reportBatch({ uid: alice.uid, extra: { admin: true } }));
await expectDenied("report an unknown status", () => reportBatch({ uid: alice.uid, status: "on-fire" }));
await expectDenied("report says caution, trail update says closed", () =>
  reportBatch({ uid: alice.uid, status: "caution", trailStatus: "closed" }),
);
await expectDenied("read reports", () => getDocs(collection(db, "reports")));

const aliceSaved = doc(db, "users", alice.uid, "saved", TRAIL_ID);
await expectAllowed("save a trail", () => setDoc(aliceSaved, savedFields(trail, TRAIL_ID)));
await expectAllowed("read own saved trails", () => getDocs(collection(db, "users", alice.uid, "saved")));
await expectDenied("save a trail with a made-up name", () =>
  setDoc(doc(db, "users", alice.uid, "saved", OTHER_TRAIL_ID), { ...savedFields(otherTrail, OTHER_TRAIL_ID), name: "Fake" }),
);
await expectDenied("update a saved trail in place", () => setDoc(aliceSaved, savedFields(trail, TRAIL_ID)));
await signOut(auth);

console.log("\nSigned in as Bob");
const bob = (await createUserWithEmailAndPassword(auth, `bob-${Date.now()}@example.com`, "password123")).user;
await expectDenied("read Alice's saved trails", () => getDocs(collection(db, "users", alice.uid, "saved")));
await expectDenied("save into Alice's list", () =>
  setDoc(doc(db, "users", alice.uid, "saved", OTHER_TRAIL_ID), savedFields(otherTrail, OTHER_TRAIL_ID)),
);
await expectDenied("delete from Alice's list", () => deleteDoc(aliceSaved));
await expectAllowed("save into own list", () =>
  setDoc(doc(db, "users", bob.uid, "saved", OTHER_TRAIL_ID), savedFields(otherTrail, OTHER_TRAIL_ID)),
);
await signOut(auth);

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll rules checks passed.");
process.exit(failures ? 1 : 0);

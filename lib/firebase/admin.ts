import { getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Server-only Firebase setup (v2). Never import this from a client component.
//
// The Admin SDK has full access to the project: Firestore Security Rules do NOT apply to it.
// That is convenient on the server, but it means every server read and write has to check
// permissions itself (see app/v2/actions.ts).

const usingEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

if (usingEmulators) {
  // `npm run dev:all` sets these already. The defaults make sure a dev server that runs
  // without them still can't reach a real project.
  process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
  process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
}

function adminApp(): App {
  return (
    getApps()[0] ??
    initializeApp({
      // On App Hosting, credentials come from the backend's service account.
      projectId: usingEmulators ? "demo-friendly-trails" : process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    })
  );
}

export const adminDb = () => getFirestore(adminApp());
export const adminAuth = () => getAuth(adminApp());

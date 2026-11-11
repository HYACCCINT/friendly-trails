import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { firebaseConfig, usingEmulators } from "./config";

// Browser-side Firebase app and Auth only. Kept separate from client.ts so code that just needs
// sign-in (like the server-components version's header) doesn't pull the Firestore SDK into
// the browser bundle.

export { usingEmulators };

// Keep one instance per page, even across hot reloads in development.
const cache = ((globalThis as { __friendlyTrailsAuth?: { auth?: Auth } }).__friendlyTrailsAuth ??= {});

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length) return getApp();
  const config = firebaseConfig();
  return config ? initializeApp(config) : initializeApp();
}

export function getClientAuth(): Auth {
  if (!cache.auth) {
    const auth = getAuth(getFirebaseApp());
    if (usingEmulators) connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    cache.auth = auth;
  }
  return cache.auth;
}

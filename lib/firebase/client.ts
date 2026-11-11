import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { firebaseConfig, usingEmulators } from "./config";

// The browser-side Firebase setup.
// Call these getters from effects and event handlers only, so they run in the browser.

export { usingEmulators };

// Keep one instance per page, even across hot reloads in development.
const cache = ((globalThis as { __friendlyTrails?: { auth?: Auth; db?: Firestore } }).__friendlyTrails ??= {});

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

export function getClientDb(): Firestore {
  if (!cache.db) {
    const app = getFirebaseApp();
    let db: Firestore;
    try {
      // Offline support: keep a copy of everything we read in IndexedDB.
      db =
        typeof window === "undefined"
          ? getFirestore(app)
          : initializeFirestore(app, {
              localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
            });
    } catch {
      db = getFirestore(app); // Already initialized, e.g. after a hot reload.
    }
    if (usingEmulators) connectFirestoreEmulator(db, "127.0.0.1", 8080);
    cache.db = db;
  }
  return cache.db;
}

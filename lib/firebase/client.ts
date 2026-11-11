import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { getClientAuth, getFirebaseApp, usingEmulators } from "./client-auth";

// The browser-side Firebase setup.
// Call these getters from effects and event handlers only, so they run in the browser.
// Auth lives in client-auth.ts, so sign-in-only code can skip the Firestore SDK.

export { getClientAuth, getFirebaseApp, usingEmulators };

// Keep one instance per page, even across hot reloads in development.
const cache = ((globalThis as { __friendlyTrails?: { db?: Firestore } }).__friendlyTrails ??= {});

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

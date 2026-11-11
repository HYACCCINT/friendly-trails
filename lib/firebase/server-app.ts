import { cache } from "react";
import { cookies } from "next/headers";
import { initializeServerApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { SESSION_COOKIE } from "@/lib/auth/cookie";
import { firebaseConfig, usingEmulators } from "./config";

// v3: the server uses the same Firebase web SDK as the browser, signed in as the visitor.
// Unlike the Admin SDK in v2, every read here goes through Firestore Security Rules.

// initializeServerApp() returns the same instance for the same token, so only connect once.
const emulatorsConnected = new WeakSet<object>();

/** One object per request. Once it's garbage collected, the SDK releases the server app. */
const requestScope = cache(() => ({}));

/** Skip tokens that are about to expire: the SDK would log an error and sign no one in. */
function freshToken(token: string | undefined): string | undefined {
  if (!token) return undefined;
  try {
    const { exp } = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    return typeof exp === "number" && exp * 1000 > Date.now() + 10_000 ? token : undefined;
  } catch {
    return undefined;
  }
}

/** Firebase for this request, signed in as the visitor (or signed out). Deduped per request. */
export const getServerFirebase = cache(async () => {
  const config = firebaseConfig();
  if (!config) throw new Error("Missing Firebase config: set the NEXT_PUBLIC_FIREBASE_* variables.");

  const authIdToken = freshToken((await cookies()).get(SESSION_COOKIE)?.value);
  const app = initializeServerApp(config, { authIdToken, releaseOnDeref: requestScope() });
  const auth = getAuth(app);
  const db = getFirestore(app);

  if (usingEmulators && !emulatorsConnected.has(app)) {
    emulatorsConnected.add(app);
    // Auth waits a tick before using the token, so connecting right after getAuth() is safe.
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }

  // Continues the browser's session on the server: Auth checks the ID token with Firebase Auth.
  await auth.authStateReady();
  return { db, user: auth.currentUser };
});

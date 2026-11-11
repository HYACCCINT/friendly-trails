import type { FirebaseOptions } from "firebase/app";

// The web config, shared by the browser (lib/firebase/client.ts) and by FirebaseServerApp
// on the server (lib/firebase/server-app.ts). These values are public by design.

export const usingEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

export function firebaseConfig(): FirebaseOptions | undefined {
  if (usingEmulators) {
    // A "demo-" project only ever talks to the local emulators, never to production.
    return {
      apiKey: "demo-api-key",
      authDomain: "demo-friendly-trails.firebaseapp.com",
      projectId: "demo-friendly-trails",
      appId: "demo-friendly-trails",
    };
  }
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    // The real "friendly-trails" project (see .env.production).
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
  }
  // On Firebase App Hosting, initializeApp() can also pick up the config automatically.
  return undefined;
}

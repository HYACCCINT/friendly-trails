"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, onIdTokenChanged, signInWithPopup, signOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { readSessionCookie, writeSessionCookie } from "@/lib/auth/cookie";
import { getClientAuth } from "@/lib/firebase/client-auth";

// v2's unavoidable client code: Firebase sign-in only works in the browser. The server can't
// open a Google popup, so the browser signs in, then copies the ID token into a cookie that
// every request carries to the server.

/** Keeps the cookie in step with Firebase Auth (sign-in, sign-out, hourly token refresh). */
export function SessionSync({ serverSignedIn }: { serverSignedIn: boolean }) {
  const router = useRouter();

  useEffect(
    () =>
      onIdTokenChanged(getClientAuth(), async (user) => {
        const token = user && !user.isAnonymous ? await user.getIdToken() : null;
        if (token === readSessionCookie()) return;
        writeSessionCookie(token);
        // The server rendered this page for someone else (signed in vs. signed out).
        // Ask it to render again with the new cookie.
        if (Boolean(token) !== serverSignedIn) router.refresh();
      }),
    [router, serverSignedIn],
  );

  return null;
}

export function SignInButton({ className = "button", children }: { className?: string; children?: ReactNode }) {
  async function signIn() {
    try {
      await signInWithPopup(getClientAuth(), new GoogleAuthProvider());
    } catch (error) {
      if (error instanceof FirebaseError && error.code === "auth/popup-closed-by-user") return;
      throw error;
    }
  }
  return (
    <button type="button" className={className} onClick={signIn}>
      {children ?? "Sign in"}
    </button>
  );
}

export function SignOutButton() {
  return (
    <button type="button" className="button button--ghost" onClick={() => signOut(getClientAuth())}>
      Sign out
    </button>
  );
}

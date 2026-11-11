"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, onIdTokenChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { readSessionCookie, writeSessionCookie } from "@/lib/auth/cookie";
import { getClientAuth } from "@/lib/firebase/client";

export interface SessionUser {
  uid: string;
  name: string;
}

interface Session {
  /** Who is signed in: the server's answer for the first frame, then the browser's. */
  user: SessionUser | null;
  /** Set once Firebase Auth has restored the session in the browser, so client reads and writes can run as the user. */
  clientUid: string | null;
  ready: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<Session | null>(null);

async function signIn() {
  try {
    await signInWithPopup(getClientAuth(), new GoogleAuthProvider());
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "auth/popup-closed-by-user") return;
    throw error;
  }
}

// v3: the server reads the session cookie and renders the first frame as the right user, so
// there's no signed-out flash. Then Firebase Auth in the browser takes over and keeps the
// cookie fresh for the next request.
export function SessionProvider({ serverUser, children }: { serverUser: SessionUser | null; children: ReactNode }) {
  const router = useRouter();
  const [client, setClient] = useState<{ ready: boolean; user: SessionUser | null }>({ ready: false, user: null });
  const serverSignedIn = Boolean(serverUser);

  useEffect(
    () =>
      onIdTokenChanged(getClientAuth(), async (firebaseUser) => {
        const signedIn = firebaseUser && !firebaseUser.isAnonymous ? firebaseUser : null;
        setClient({
          ready: true,
          user: signedIn ? { uid: signedIn.uid, name: signedIn.displayName ?? signedIn.email ?? "Hiker" } : null,
        });
        const token = signedIn ? await signedIn.getIdToken() : null;
        if (token === readSessionCookie()) return;
        writeSessionCookie(token);
        // Personalized server parts (like "saved") were rendered for someone else. Re-render them.
        if (Boolean(token) !== serverSignedIn) router.refresh();
      }),
    [router, serverSignedIn],
  );

  const session: Session = {
    user: client.ready ? client.user : serverUser,
    clientUid: client.user?.uid ?? null,
    ready: client.ready,
    signIn,
    signOut: () => firebaseSignOut(getClientAuth()),
  };
  return <SessionContext value={session}>{children}</SessionContext>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession() must be used inside <SessionProvider>.");
  return session;
}

export function AuthControls() {
  const { user, signIn, signOut } = useSession();
  if (!user) {
    return (
      <button type="button" className="button" onClick={signIn}>
        Sign in
      </button>
    );
  }
  return (
    <>
      <span className="avatar" aria-hidden="true">
        {user.name.charAt(0).toUpperCase()}
      </span>
      <span className="visually-hidden">Signed in as {user.name}.</span>
      <button type="button" className="button button--ghost" onClick={signOut}>
        Sign out
      </button>
    </>
  );
}

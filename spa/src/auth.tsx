import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { FirebaseError } from "firebase/app";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";

interface AuthState {
  user: User | null;
  /** False until Firebase has restored (or ruled out) a session in this browser. */
  ready: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

// Sign-in state lives only in the browser. There's no server that needs to know who you are.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(getClientAuth(), (nextUser) => {
        setUser(nextUser);
        setReady(true);
      }),
    [],
  );

  async function signIn() {
    try {
      await signInWithPopup(getClientAuth(), new GoogleAuthProvider());
    } catch (error) {
      // Closing the popup is not an error worth surfacing.
      if (error instanceof FirebaseError && error.code === "auth/popup-closed-by-user") return;
      throw error;
    }
  }

  return (
    <AuthContext value={{ user, ready, signIn, signOut: () => signOut(getClientAuth()) }}>{children}</AuthContext>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth() must be used inside <AuthProvider>.");
  return context;
}

import { cache } from "react";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/cookie";
import { adminAuth } from "@/lib/firebase/admin";

export interface SessionUser {
  uid: string;
  name: string;
}

/**
 * Who is making this request? Verifies the ID token from the session cookie.
 * Reading cookies makes every page that calls this render on demand, for every request.
 * `cache` dedupes the check within a single request.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    // Same rule as firestore.rules: anonymous users count as signed out.
    if (decoded.firebase.sign_in_provider === "anonymous") return null;
    return { uid: decoded.uid, name: String(decoded.name ?? decoded.email ?? "Hiker") };
  } catch {
    // Expired or invalid. The browser refreshes the token and the cookie on its own.
    return null;
  }
});

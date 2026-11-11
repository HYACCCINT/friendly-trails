/** The browser keeps the signed-in user's Firebase ID token in this cookie, for the server to read. */
export const SESSION_COOKIE = "__session";

// Browser-only helpers (they use document.cookie). Shared by v2 and v3.

export function readSessionCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${SESSION_COOKIE}=([^;]*)`));
  return match ? match[1] : null;
}

export function writeSessionCookie(token: string | null) {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = token
    ? `${SESSION_COOKIE}=${token}; path=/; max-age=3600; samesite=lax${secure}`
    : `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax${secure}`;
}

import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/interactive/SiteNav";
import { getSessionUser } from "@/lib/auth/session";
import { SessionSync, SignInButton, SignOutButton } from "./_components/AuthClient";

const NAV = [
  { href: "/v2", label: "Explore" },
  { href: "/v2/saved", label: "Saved" },
];

// v2 · All server: every page under /v2 is a server component. The server reads Firestore
// with the Admin SDK and sends finished HTML. The browser only runs what can't run anywhere
// else: Firebase sign-in, the map, and the nav highlight.
export default async function V2Layout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  return (
    <>
      <SessionSync serverSignedIn={Boolean(user)} />
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/v2" className="brand">
            <BrandMark />
            <span>Friendly Trails</span>
          </Link>
          <SiteNav items={NAV} />
          <div className="auth">
            {user ? (
              <>
                <span className="avatar" aria-hidden="true">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="visually-hidden">Signed in as {user.name}.</span>
                <SignOutButton />
              </>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </header>
      <main className="page">{children}</main>
      <SiteFooter />
    </>
  );
}

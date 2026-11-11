"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { useAuth } from "./AuthProvider";

const NAV = [
  { href: "/v1", label: "Explore" },
  { href: "/v1/saved", label: "Saved" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { user, ready, signIn, signOut } = useAuth();
  const name = user?.displayName ?? user?.email ?? "Hiker";

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/v1" className="brand">
          <BrandMark />
          <span>Friendly Trails</span>
        </Link>
        <nav aria-label="Main" className="site-nav">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-nav__link"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="auth">
          {!ready ? (
            <span className="auth__placeholder" aria-hidden="true" />
          ) : user ? (
            <>
              <span className="avatar" aria-hidden="true">
                {name.charAt(0).toUpperCase()}
              </span>
              <span className="visually-hidden">Signed in as {name}.</span>
              <button type="button" className="button button--ghost" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <button type="button" className="button" onClick={signIn}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

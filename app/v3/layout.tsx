import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { SiteFooter } from "@/components/SiteFooter";
import { OfflineBanner } from "@/components/interactive/OfflineBanner";
import { SiteNav } from "@/components/interactive/SiteNav";
import { getServerFirebase } from "@/lib/firebase/server-app";
import { AuthControls, SessionProvider } from "./_components/SessionProvider";

const NAV = [
  { href: "/v3", label: "Explore" },
  { href: "/v3/saved", label: "Saved" },
];

// v3 · Mixed: a server component layout. The server continues the visitor's session with
// FirebaseServerApp, so the first frame is already personalized. The client providers wrap
// server-rendered children: providers can be client components without turning the page into one.
export default async function V3Layout({ children }: { children: ReactNode }) {
  const { user } = await getServerFirebase();
  const serverUser = user ? { uid: user.uid, name: user.displayName ?? user.email ?? "Hiker" } : null;

  return (
    <SessionProvider serverUser={serverUser}>
      <header className="site-header">
        <div className="site-header__inner">
          <Link href="/v3" prefetch className="brand">
            <BrandMark />
            <span>Friendly Trails</span>
          </Link>
          <SiteNav items={NAV} prefetch />
          <div className="auth">
            <AuthControls />
          </div>
        </div>
      </header>
      <OfflineBanner />
      <main className="page">{children}</main>
      <SiteFooter />
    </SessionProvider>
  );
}

"use client";

import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { OfflineBanner } from "@/components/interactive/OfflineBanner";
import { AppHeader } from "./_components/AppHeader";
import { AuthProvider } from "./_components/AuthProvider";

// v1 · All client: everything under /v1 is a client component, and every piece of data
// is loaded by the browser after the page has rendered.
export default function V1Layout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppHeader />
      <OfflineBanner />
      <main className="page">{children}</main>
      <SiteFooter />
    </AuthProvider>
  );
}

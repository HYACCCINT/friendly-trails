import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Friendly Trails",
  description:
    "Hiking trails around New York with live conditions. A demo app for the talk “When (not) to use server components in interactive web apps”.",
};

export const viewport: Viewport = {
  themeColor: "#1f6f4a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

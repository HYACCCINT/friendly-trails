import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets a second production build run next to a running one without touching it,
  // e.g. `NEXT_DIST_DIR=.next-check npm run build`. Defaults to the usual .next folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;

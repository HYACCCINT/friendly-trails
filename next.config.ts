import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets a second production build run next to a running one without touching it,
  // e.g. `NEXT_DIST_DIR=.next-check npm run build`. Defaults to the usual .next folder.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async rewrites() {
    return [
      // The SPA (built by Vite into public/spa) is one index.html for every route, the way a
      // static host serves a strict SPA. Its JS and CSS files are matched first, because
      // rewrites returned as an array only apply after public files are checked.
      { source: "/spa", destination: "/spa/index.html" },
      { source: "/spa/:path*", destination: "/spa/index.html" },
    ];
  },
};

export default nextConfig;

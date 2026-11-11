import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// The SPA build: a strict single-page app made with Vite and React Router.
// One index.html, and every route, page transition and data fetch runs in the browser.
//
// It reuses the shared components and Firebase code from the Next.js app, and it is built
// into public/spa, where it's served as plain static files (see the rewrite in next.config.ts).

const repoRoot = fileURLToPath(new URL(".", import.meta.url));

// The shared Firebase config (lib/firebase/config.ts) reads these from process.env, the
// Next.js way. Vite reads the same .env files, so substitute them at build time.
const ENV_KEYS = [
  "NEXT_PUBLIC_USE_FIREBASE_EMULATORS",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

export default defineConfig(({ mode }) => {
  // Loads .env, .env.[mode] and NEXT_PUBLIC_* variables already set in the environment
  // (those take priority, e.g. NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true in `npm run prod:local`).
  const env = loadEnv(mode, repoRoot, "NEXT_PUBLIC_");

  return {
    root: fileURLToPath(new URL("./spa", import.meta.url)),
    base: "/spa/",
    envDir: repoRoot,
    plugins: [react()],
    define: Object.fromEntries(ENV_KEYS.map((key) => [`process.env.${key}`, JSON.stringify(env[key] ?? "")])),
    resolve: {
      alias: [
        // The shared TrailCard uses next/link. In the SPA, the same props go to React Router.
        { find: "next/link", replacement: fileURLToPath(new URL("./spa/src/RouterLink.tsx", import.meta.url)) },
        { find: /^@\//, replacement: repoRoot },
      ],
    },
    build: {
      outDir: fileURLToPath(new URL("./public/spa", import.meta.url)),
      emptyOutDir: true,
    },
    server: { port: 5173 },
  };
});

# Friendly Trails

Demo app for the talk **“When (not) to use server components in interactive web apps”**.

A hiking guide for trails around New York: browse and filter trails, explore each route on a map with an
interactive elevation profile, save trails, and report live trail conditions. The same app is built three
times, so the only thing that changes between versions is **where things render**:

| Version | Route | Status | Idea |
| --- | --- | --- | --- |
| **SPA** | `/spa` | ✅ Built | A strict single-page app: Vite + React Router, one `index.html`. The browser signs in, reads, listens and writes to Firestore directly. |
| **v2 · All server** | `/v2` | ✅ Built | Every page is a server component reading Firestore with the Admin SDK. Filters are a GET form; writes are Server Functions. |
| **v3 · Mixed** | `/v3` | ✅ Built | The server renders the first frame as the visitor (`FirebaseServerApp`); the client keeps it live and handles interaction. |

**Stack:** Next.js 16 (App Router) for v2 and v3, Vite 8 + React Router 7 for the SPA · Firebase App Hosting ·
Firebase Authentication · Cloud Firestore. The SPA is built into `public/spa` and served as static files by the
same deployment (see the rewrite in [`next.config.ts`](next.config.ts)).

## Run it locally

Requirements: Node.js 20.9+ and Java (for the Firestore emulator).

```bash
npm install
npm run dev:all
```

`dev:all` starts the Firebase Auth and Firestore emulators (with the demo project `demo-friendly-trails`),
seeds ten trails, builds the SPA, and starts Next.js:

- App: <http://localhost:3000>
- Emulator UI (data, users): <http://localhost:4000>

Local development never touches the real `friendly-trails` project. Sign-in uses the Auth emulator’s
fake Google accounts.

| Script | What it does |
| --- | --- |
| `npm run dev:all` | Emulators + seed data + SPA build + Next.js dev server |
| `npm run dev:spa` | Vite dev server for the SPA with hot reload (<http://localhost:5173/spa/>; start the emulators first) |
| `npm run prod:local` | Emulators + seed data + a production build against them (prefetching, offline navigation) |
| `npm run check:rules` | Runs `scripts/check-rules.mjs` against `firestore.rules` in the emulators |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Production build: `vite build` (SPA) then `next build` (uses the real project config in `.env.production`) |
| `npm run seed:production` | Adds the demo trails to the real project (never overwrites existing trails) |

## Project structure

```
app/
  page.tsx                 Version picker
  globals.css              Shared styles for every version
  v2/                      v2 · All server (server components + Admin SDK)
    actions.ts             Server Functions for save and report (they re-check auth themselves)
    _components/           The client code v2 can't avoid: sign-in, a GET filter form
  v3/                      v3 · Mixed
    layout.tsx             Server layout; the session comes from FirebaseServerApp
    page.tsx               Server query + server-rendered cards, filtered in the browser
    trails/[id]/page.tsx   Server first frame, live conditions, chart hover layer, save, report
    saved/page.tsx         Server first frame, then a live (and offline) listener
    actions.ts             The report Server Function: auth check + rate limit
    _components/           v3 client components (session, live conditions, hover, forms)
spa/                       SPA · strict single-page app (Vite + React Router)
  index.html               The one HTML file every route gets
  src/App.tsx              Client-side routes
  src/pages/               Explore, Trail, Saved: Firestore listeners in the browser
  src/RouterLink.tsx       Stands in for next/link so shared components work with React Router
vite.config.mts            Builds the SPA into public/spa
components/
  trail/                   Pure components (no hooks): render on server or client
  interactive/             Client components shared across versions (filters, map, save, nav)
lib/
  firebase/client.ts       Browser Firestore setup (emulators in dev, offline cache)
  firebase/client-auth.ts  Browser app + Auth only (so sign-in-only code skips the Firestore SDK)
  firebase/server-app.ts   v3: FirebaseServerApp, signed in as the visitor (rules apply)
  firebase/admin.ts        v2 and v3 Server Functions: Admin SDK (rules don't apply)
  auth/                    Session cookie with the Firebase ID token
  trails/                  Types, converters, filtering, formatting, server reads
scripts/                   Demo data, seeding, rules checks
firestore.rules            Prototype security rules
```

## SPA demo notes for the talk

- **One empty HTML file**: every SPA route gets the same `index.html`, with an empty `<div id="root">`:

  ```bash
  curl -s http://localhost:3000/spa/trails/storm-king-loop | grep -o "Storm King Loop" | wc -l   # → 0
  curl -s http://localhost:3000/spa/trails/storm-king-loop | grep -o '<div id="root">.*</div>'
  ```

  The `<title>` and description are site-wide. Only the trail page sets the title, from JavaScript, after
  the data loads.
- **The waterfall**: throttle the network in DevTools (“Slow 4G”) and reload a trail page. Nothing useful
  appears until the JavaScript bundle (313 KB gzipped) has loaded, rendered a spinner and run the
  Firestore query. Measured locally at 400 ms latency and 1.6 Mbps: the trail name appears after ~3.5 s,
  versus ~0.5 s for v2 and v3.
- **Live conditions**: open a trail in two windows and report a closure in one. The other updates live.
  In the reporting window the badge changes instantly and shows “Syncing” until the server confirms
  (Firestore latency compensation). The save button does the same.
- **Offline**: open Explore, then switch DevTools to “Offline”:
  - Every page still opens: navigation never asks the server for anything (0 requests), and the map is
    part of the bundle.
  - Data comes from Firestore’s persistent cache. Saves and reports apply instantly, show “syncing”, and
    are sent when you reconnect.
  - Reloading fails: the HTML comes from the server. Full offline support needs a service worker.
- **Security lives in the rules**: `firestore.rules` is the only thing standing between the browser and
  the data. They check the shape of every write. Verifying or rate-limiting reports is awkward to express
  there.

## v2 demo notes for the talk

- **Full HTML**: `curl` on a v2 trail page shows the trail name and a real `<title>` and description.
- **Every interaction is a round trip**: filters are a GET form (“Show trails”), and save and report
  wait for a Server Function. Throttle to “Slow 4G” on localhost to make the wait visible.
- **Live data became a snapshot**: open a trail in v2 and the SPA side by side, then report a closure in
  the SPA. The SPA updates, v2 doesn’t until you reload.
- **Offline is gone**: switch DevTools to “Offline” and click any link: the browser’s offline page.
- **The server didn’t know who I was**: delete the `__session` cookie in DevTools and reload. The server
  renders the signed-out page, then it flips once the browser sends a fresh token.
- **Security moved**: the Admin SDK skips security rules, so [`app/v2/actions.ts`](app/v2/actions.ts)
  re-checks everything the rules did.
- **`'use client'` creep**: even v2 needs client components for sign-in, the map and the nav.

## v3 demo notes for the talk

- **The first frame comes from the server, as the visitor**: `FirebaseServerApp` reads Firestore with the
  visitor’s ID token, so security rules apply. Signed-in visitors get HTML that already shows their
  saved state and the report form: no flash.
- **The handoff**: the server passes its snapshot (`snapshot.toJSON()`) to the conditions badge, which
  resumes a live listener from it (`onSnapshotResume`). Report a closure in the SPA: the open v3 page updates.
- **Filters without a round trip**: the server renders the cards and passes them into a client component
  that only decides which to show. Filtering took about 1 ms (median of 10 runs) with no server request.
- **Same chart, two layers**: the elevation chart is server-rendered SVG. A thin client layer draws the
  hover cursor and moves the marker on the map.
- **Two kinds of writes**: saving is a client write (instant, works offline, guarded by rules).
  Reporting is a Server Function (auth check, one report a minute, needs a connection).
- **Offline costs something**: Explore, Saved and trail pages open offline (production build) because every
  link does a full prefetch, but only once the link has been on screen. One Explore visit (1400×1100 window,
  9 of 10 cards visible) made 10 full-page prefetches, each one a server render, plus 5 small route-tree
  requests.

## Data and attribution

- Trails start at real places around New York, but routes, elevation profiles, stats and trail conditions
  are generated by [`scripts/trail-data.mjs`](scripts/trail-data.mjs). **They are illustrative; do not use
  them for navigation.**
- Map tiles © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors. Keep usage light and
  follow the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/), or switch to a tile
  provider for anything beyond demos.

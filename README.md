# Friendly Trails

Demo app for the talk **“When (not) to use server components in interactive web apps”**.

A hiking guide for trails around New York: browse and filter trails, explore each route on a map with an
interactive elevation profile, save trails, and report live trail conditions. The same app is built three
times, so the only thing that changes between versions is **where things render**:

| Version | Route | Status | Idea |
| --- | --- | --- | --- |
| **v1 · All client** | `/v1` | ✅ Built | Every page is a client component. The browser signs in, reads, listens and writes to Firestore directly. |
| **v2 · All server** | `/v2` | ✅ Built | Every page is a server component reading Firestore with the Admin SDK. Filters are a GET form; writes are Server Functions. |
| **v3 · Mixed** | `/v3` | ✅ Built | The server renders the first frame as the visitor (`FirebaseServerApp`); the client keeps it live and handles interaction. |

**Stack:** Next.js 16 (App Router) · Firebase App Hosting · Firebase Authentication · Cloud Firestore.

## Run it locally

Requirements: Node.js 20.9+ and Java (for the Firestore emulator).

```bash
npm install
npm run dev:all
```

`dev:all` starts the Firebase Auth and Firestore emulators (with the demo project `demo-friendly-trails`),
seeds ten trails, and starts Next.js:

- App: <http://localhost:3000>
- Emulator UI (data, users): <http://localhost:4000>

Local development never touches the real `friendly-trails` project. Sign-in uses the Auth emulator’s
fake Google accounts.

| Script | What it does |
| --- | --- |
| `npm run dev:all` | Emulators + seed data + Next.js dev server |
| `npm run prod:local` | Emulators + seed data + a production build against them (prefetching, offline navigation) |
| `npm run check:rules` | Runs `scripts/check-rules.mjs` against `firestore.rules` in the emulators |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Production build (uses the real project config in `.env.production`) |
| `npm run seed:production` | Adds the demo trails to the real project (never overwrites existing trails) |

## Project structure

```
app/
  page.tsx                 Version picker
  globals.css              Shared styles for every version
  v1/                      v1 · All client ("use client" everywhere)
    layout.tsx             AuthProvider + header
    page.tsx               Explore: Firestore subscription + in-browser filters
    trails/[id]/page.tsx   Trail: live subscription, map, elevation, save, report
    saved/page.tsx         Saved trails (works offline)
    _components/           v1-only client components (auth, save, report…)
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
components/
  trail/                   Pure components (no hooks): render on server or client
  interactive/             Client components shared across versions (filters, map, save, nav)
lib/
  firebase/client.ts       Browser Firebase setup (emulators in dev, offline cache)
  firebase/server-app.ts   v3: FirebaseServerApp, signed in as the visitor (rules apply)
  firebase/admin.ts        v2 and v3 Server Functions: Admin SDK (rules don't apply)
  auth/                    Session cookie with the Firebase ID token
  trails/                  Types, converters, filtering, formatting, server reads
scripts/                   Demo data, seeding, rules checks
firestore.rules            Prototype security rules
```

## v1 demo notes for the talk

- **The spinner**: throttle the network in DevTools (“Slow 4G”) and reload a trail page. Nothing useful
  appears until the JavaScript, the sign-in check and the Firestore query have all finished.
- **SSR was on the whole time**: v1 *is* server-rendered. Client components still render on the server,
  but the data loads in the browser, so the server renders a spinner:

  ```bash
  curl -s http://localhost:3000/v1/trails/storm-king-loop | grep -ci "storm king"   # → 0
  ```

  `next build` even lists `/v1` and `/v1/saved` as **○ Static**: prerendered HTML that contains a spinner.
  The `<title>` stays generic too. Only the trail page sets it, from JavaScript, after the data loads.
- **Live conditions**: open a trail in two windows and report a closure in one. The other updates live.
  In the reporting window the badge changes instantly and shows “Syncing” until the server confirms
  (Firestore latency compensation). The save button does the same.
- **Offline** (production build only: Next.js doesn’t prefetch in dev, so use `npm run prod:local`).
  Open Explore, then switch DevTools to “Offline”:
  - The open page keeps working from Firestore’s persistent cache. Saves and reports apply instantly,
    show “syncing”, and are sent when you reconnect.
  - Explore, Saved and trail pages still open. Even an all-client App Router app asks the server for
    each page’s RSC payload when you navigate. Static pages are prefetched by default, but trail pages
    are a dynamic route, so trail links use `prefetch` (a full prefetch) to open offline.
  - The map’s code loads lazily. If it hasn’t loaded before, the map shows a fallback.
  - Reloading fails: the HTML comes from the server. Full offline support needs a service worker.
- **Even v1 needs `ssr: false`**: Leaflet touches `window` on import, so
  [`TrailMapLazy.tsx`](components/interactive/TrailMapLazy.tsx) opts the map out of server rendering.
- **Security lives in the rules**: in v1, `firestore.rules` is the only thing standing between the
  browser and the data. They check the shape of every write. Verifying or rate-limiting reports is
  awkward to express there.

## v2 demo notes for the talk

- **Full HTML**: `curl` on a v2 trail page shows the trail name and a real `<title>` and description.
- **Every interaction is a round trip**: filters are a GET form (“Show trails”), and save and report
  wait for a Server Function. Throttle to “Slow 4G” on localhost to make the wait visible.
- **Live data became a snapshot**: open a trail in v2 and v1 side by side, then report a closure in v1.
  v1 updates, v2 doesn’t until you reload.
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
  resumes a live listener from it (`onSnapshotResume`). Report a closure in v1: the open v3 page updates.
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

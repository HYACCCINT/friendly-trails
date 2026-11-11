import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

const VERSIONS = [
  {
    id: "spa",
    href: "/spa",
    title: "SPA",
    body: "A strict single-page app (Vite + React Router). One HTML file; the browser signs in, reads, listens and writes to Firestore directly.",
    ready: true,
  },
  {
    id: "v2",
    href: "/v2",
    title: "Server components",
    body: "Every page is a server component. Finished HTML on the first request; every interaction goes back to the server.",
    ready: true,
  },
  {
    id: "v3",
    href: "/v3",
    title: "Hybrid",
    body: "The server renders the first frame as the visitor; the client keeps it live and handles interaction.",
    ready: true,
  },
] as const;

export default function Home() {
  return (
    <main className="home">
      <div className="home__inner">
        <p className="brand brand--large">
          <BrandMark />
          Friendly Trails
        </p>
        <h1>One app, three ways to render it</h1>
        <p className="home__lede">
          A demo for the talk “When (not) to use server components in interactive web apps”. Same data, same design,
          same Firebase backend. Only where things run changes.
        </p>
        <ul className="version-list">
          {VERSIONS.map((version) => (
            <li key={version.id} className={`version-card version-card--${version.id}`}>
              <h2>
                {/* The SPA is a separate app (static files), not a Next.js route, so it gets a plain link. */}
                {version.id === "spa" ? (
                  <a href={version.href}>{version.title}</a>
                ) : version.ready ? (
                  <Link href={version.href}>{version.title}</Link>
                ) : (
                  version.title
                )}
              </h2>
              <p>{version.body}</p>
              {!version.ready && <p className="version-card__soon">Coming soon</p>}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

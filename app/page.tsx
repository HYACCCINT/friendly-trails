import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";

const VERSIONS = [
  {
    id: "v1",
    href: "/v1",
    title: "SPA",
    body: "Client components everywhere. The browser signs in, reads, listens and writes to Firestore directly.",
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
              <h2>{version.ready ? <Link href={version.href}>{version.title}</Link> : version.title}</h2>
              <p>{version.body}</p>
              {!version.ready && <p className="version-card__soon">Coming soon</p>}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

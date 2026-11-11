import type { Metadata } from "next";
import { TrailCard } from "@/components/trail/TrailCard";
import { DEFAULT_FILTERS, MAX_DISTANCE_KM, filterTrails, type TrailFilters } from "@/lib/trails/filter";
import { getTrails } from "@/lib/trails/server";
import { DIFFICULTIES, type Difficulty } from "@/lib/trails/types";
import { TrailFilterForm } from "./_components/TrailFilterForm";

export const metadata: Metadata = {
  title: "Explore trails · Friendly Trails",
  description: "Ridge climbs, lake loops and city escapes around New York, with live trail conditions from fellow hikers.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function parseFilters(params: SearchParams): TrailFilters {
  const one = (key: string) => (Array.isArray(params[key]) ? params[key][0] : params[key]);
  const difficulty = one("difficulty");
  const maxKm = Number(one("maxKm"));
  return {
    query: one("q") ?? DEFAULT_FILTERS.query,
    difficulty: DIFFICULTIES.includes(difficulty as Difficulty) ? (difficulty as Difficulty) : "any",
    maxDistanceKm: Number.isFinite(maxKm) && maxKm >= 2 && maxKm <= MAX_DISTANCE_KM ? maxKm : MAX_DISTANCE_KM,
    dogFriendly: one("dogs") === "1",
  };
}

// v2: the server reads every trail, filters them, and sends finished HTML.
export default async function ExplorePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const filters = parseFilters(await searchParams);
  const visible = filterTrails(await getTrails(), filters);

  return (
    <div className="explore">
      <header className="page-intro">
        <h1>Trails around New York</h1>
        <p>Ridge climbs, lake loops and city escapes, with live trail conditions from fellow hikers.</p>
      </header>

      <div className="explore__layout">
        <aside className="explore__filters">
          <TrailFilterForm value={filters} resultCount={visible.length} />
        </aside>

        <section className="explore__results" aria-label="Trails">
          {visible.length === 0 ? (
            <p className="empty">No trails match these filters.</p>
          ) : (
            <ul className="trail-grid">
              {visible.map((trail) => (
                <li key={trail.id}>
                  <TrailCard trail={trail} href={`/v2/trails/${trail.id}`} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

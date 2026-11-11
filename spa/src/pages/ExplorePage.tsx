import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { TrailFilters } from "@/components/interactive/TrailFilters";
import { TrailCard } from "@/components/trail/TrailCard";
import { Spinner } from "@/components/ui/Spinner";
import { getClientDb } from "@/lib/firebase/client";
import { toTrail } from "@/lib/trails/convert";
import { DEFAULT_FILTERS, filterTrails } from "@/lib/trails/filter";
import type { Trail } from "@/lib/trails/types";

export function ExplorePage() {
  const [trails, setTrails] = useState<Trail[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // The data loads in the browser, after the JavaScript has loaded and rendered a spinner.
  // The listener keeps the list live: a closure reported anywhere shows up here.
  useEffect(() => {
    const trailsQuery = query(collection(getClientDb(), "trails"), orderBy("name"));
    return onSnapshot(
      trailsQuery,
      (snapshot) => setTrails(snapshot.docs.map(toTrail)),
      (err) => setError(err.message),
    );
  }, []);

  // Filtering is a plain function over data the browser already has: no request at all.
  const visible = trails ? filterTrails(trails, filters) : [];

  return (
    <div className="explore">
      <header className="page-intro">
        <h1>Trails around New York</h1>
        <p>Ridge climbs, lake loops and city escapes, with live trail conditions from fellow hikers.</p>
      </header>

      <div className="explore__layout">
        <aside className="explore__filters">
          <TrailFilters value={filters} onChange={setFilters} resultCount={trails ? visible.length : null} />
        </aside>

        <section className="explore__results" aria-label="Trails">
          {error ? (
            <p className="empty">Couldn’t load trails: {error}</p>
          ) : trails === null ? (
            <Spinner label="Loading trails" />
          ) : visible.length === 0 ? (
            <p className="empty">No trails match these filters.</p>
          ) : (
            <ul className="trail-grid">
              {visible.map((trail) => (
                <li key={trail.id}>
                  <TrailCard trail={trail} href={`/trails/${trail.id}`} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

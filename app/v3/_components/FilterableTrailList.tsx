"use client";

import { useState, type ReactNode } from "react";
import { TrailFilters } from "@/components/interactive/TrailFilters";
import { DEFAULT_FILTERS, filterTrails, type TrailFacets } from "@/lib/trails/filter";

/**
 * v3's composition trick. The server renders every trail card and passes them in as props.
 * This client component only decides which cards to show, so filtering is instant, while the
 * card code (route art, sparklines) stays on the server.
 */
export function FilterableTrailList({
  trails,
  cards,
}: {
  trails: (TrailFacets & { id: string })[];
  cards: Record<string, ReactNode>;
}) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const visible = filterTrails(trails, filters);

  return (
    <div className="explore__layout">
      <aside className="explore__filters">
        <TrailFilters value={filters} onChange={setFilters} resultCount={visible.length} />
      </aside>

      <section className="explore__results" aria-label="Trails">
        {visible.length === 0 ? (
          <p className="empty">No trails match these filters.</p>
        ) : (
          <ul className="trail-grid">
            {visible.map((trail) => (
              <li key={trail.id}>{cards[trail.id]}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

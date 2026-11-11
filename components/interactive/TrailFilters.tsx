"use client";

import { DIFFICULTY_LABEL } from "@/lib/trails/format";
import { MAX_DISTANCE_KM, type TrailFilters as Filters } from "@/lib/trails/filter";
import { DIFFICULTIES } from "@/lib/trails/types";

interface TrailFiltersProps {
  value: Filters;
  onChange: (next: Filters) => void;
  /** Number of matching trails, or null while the trails are still loading. */
  resultCount: number | null;
}

/** Filter controls that update instantly, with no round trip: filtering happens in the browser. */
export function TrailFilters({ value, onChange, resultCount }: TrailFiltersProps) {
  const update = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  return (
    <form className="filters" role="search" aria-label="Filter trails" onSubmit={(event) => event.preventDefault()}>
      <div className="field">
        <label htmlFor="trail-search">Search</label>
        <input
          id="trail-search"
          name="q"
          type="search"
          placeholder="Trail or area"
          autoComplete="off"
          enterKeyHint="search"
          value={value.query}
          onChange={(event) => update({ query: event.target.value })}
        />
      </div>

      <fieldset className="field">
        <legend>Difficulty</legend>
        <div className="chip-group">
          {(["any", ...DIFFICULTIES] as const).map((difficulty) => (
            <label key={difficulty} className="chip">
              <input
                type="radio"
                name="difficulty"
                value={difficulty}
                checked={value.difficulty === difficulty}
                onChange={() => update({ difficulty })}
              />
              <span>{difficulty === "any" ? "Any" : DIFFICULTY_LABEL[difficulty]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="trail-distance" className="field__label--split">
          Max distance
          <output htmlFor="trail-distance">{value.maxDistanceKm} km</output>
        </label>
        <input
          id="trail-distance"
          name="maxKm"
          type="range"
          min={2}
          max={MAX_DISTANCE_KM}
          step={1}
          value={value.maxDistanceKm}
          onChange={(event) => update({ maxDistanceKm: Number(event.target.value) })}
        />
      </div>

      <label className="toggle">
        <input
          type="checkbox"
          name="dogs"
          checked={value.dogFriendly}
          onChange={(event) => update({ dogFriendly: event.target.checked })}
        />
        <span className="toggle__track" aria-hidden="true" />
        Dog-friendly only
      </label>

      <p className="filters__count" role="status">
        {resultCount === null ? "" : resultCount === 1 ? "1 trail" : `${resultCount} trails`}
      </p>
    </form>
  );
}

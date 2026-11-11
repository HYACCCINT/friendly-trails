import Form from "next/form";
import { DIFFICULTY_LABEL } from "@/lib/trails/format";
import { MAX_DISTANCE_KM, type TrailFilters } from "@/lib/trails/filter";
import { DIFFICULTIES } from "@/lib/trails/types";

/**
 * v2 filters: a plain GET form. Every change is a request to the server, which filters the
 * trails and sends back a new page. Nothing happens until you press "Show trails".
 */
export function TrailFilterForm({ value, resultCount }: { value: TrailFilters; resultCount: number }) {
  return (
    <Form action="/v2" className="filters" role="search" aria-label="Filter trails">
      <div className="field">
        <label htmlFor="trail-search">Search</label>
        <input
          id="trail-search"
          name="q"
          type="search"
          placeholder="Trail or area"
          autoComplete="off"
          enterKeyHint="search"
          defaultValue={value.query}
        />
      </div>

      <fieldset className="field">
        <legend>Difficulty</legend>
        <div className="chip-group">
          {(["any", ...DIFFICULTIES] as const).map((difficulty) => (
            <label key={difficulty} className="chip">
              <input type="radio" name="difficulty" value={difficulty} defaultChecked={value.difficulty === difficulty} />
              <span>{difficulty === "any" ? "Any" : DIFFICULTY_LABEL[difficulty]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        {/* Without client JavaScript, this number only updates after the round trip. */}
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
          defaultValue={value.maxDistanceKm}
        />
      </div>

      <label className="toggle">
        <input type="checkbox" name="dogs" value="1" defaultChecked={value.dogFriendly} />
        <span className="toggle__track" aria-hidden="true" />
        Dog-friendly only
      </label>

      <button type="submit" className="button">
        Show trails
      </button>

      <p className="filters__count" role="status">
        {resultCount === 1 ? "1 trail" : `${resultCount} trails`}
      </p>
    </Form>
  );
}

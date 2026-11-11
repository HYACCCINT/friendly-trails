import type { Difficulty, Trail } from "./types";

export interface TrailFilters {
  query: string;
  difficulty: Difficulty | "any";
  maxDistanceKm: number;
  dogFriendly: boolean;
}

/** The fields filtering needs. v3 sends only these to the browser, not whole trails. */
export type TrailFacets = Pick<Trail, "name" | "region" | "difficulty" | "distanceKm" | "dogFriendly">;

export const MAX_DISTANCE_KM = 15;

export const DEFAULT_FILTERS: TrailFilters = {
  query: "",
  difficulty: "any",
  maxDistanceKm: MAX_DISTANCE_KM,
  dogFriendly: false,
};

export function filterTrails<T extends TrailFacets>(trails: T[], filters: TrailFilters): T[] {
  const query = filters.query.trim().toLowerCase();
  return trails.filter(
    (trail) =>
      (filters.difficulty === "any" || trail.difficulty === filters.difficulty) &&
      trail.distanceKm <= filters.maxDistanceKm &&
      (!filters.dogFriendly || trail.dogFriendly) &&
      (!query || trail.name.toLowerCase().includes(query) || trail.region.toLowerCase().includes(query)),
  );
}

export type Difficulty = "easy" | "moderate" | "hard";
export type TrailStatus = "open" | "caution" | "closed";

export interface LatLng {
  lat: number;
  lng: number;
}

/** A trail as the UI uses it: plain values only (no Firestore classes). */
export interface Trail {
  id: string;
  name: string;
  region: string;
  summary: string;
  description: string;
  difficulty: Difficulty;
  distanceKm: number;
  elevationGainM: number;
  durationMin: number;
  dogFriendly: boolean;
  loop: boolean;
  highlights: string[];
  start: LatLng;
  route: LatLng[];
  elevation: number[];
  status: TrailStatus;
  statusNote: string;
  lastReportAt: Date | null;
}

/** A copy of the key trail fields, stored per user so the saved list works offline. */
export interface SavedTrail {
  trailId: string;
  name: string;
  region: string;
  distanceKm: number;
  difficulty: Difficulty;
  savedAt: Date | null;
}

export const DIFFICULTIES: readonly Difficulty[] = ["easy", "moderate", "hard"];
export const STATUSES: readonly TrailStatus[] = ["open", "caution", "closed"];

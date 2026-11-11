import type { Difficulty, TrailStatus } from "./types";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
};

export const STATUS_LABEL: Record<TrailStatus, string> = {
  open: "Open",
  caution: "Caution",
  closed: "Closed",
};

export const formatDistance = (km: number) => `${km.toFixed(1)} km`;

export const formatElevation = (meters: number) => `${Math.round(meters)} m`;

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} min`;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

const relativeTime = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

/** "just now", "5 minutes ago", "yesterday"… */
export function formatRelative(date: Date, now: number = Date.now()) {
  const seconds = Math.round((date.getTime() - now) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relativeTime.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

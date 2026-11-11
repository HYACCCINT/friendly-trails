import type { Difficulty, LatLng, SavedTrail, Trail, TrailStatus } from "./types";

// Firestore returns GeoPoint and Timestamp class instances. The UI only uses plain values,
// so every snapshot goes through these converters first. They accept snapshots from the
// web SDK and the Admin SDK alike.

interface GeoPointLike {
  latitude: number;
  longitude: number;
}

interface TimestampLike {
  toDate(): Date;
}

interface SnapshotLike {
  id: string;
  data(options?: { serverTimestamps?: "estimate" | "previous" | "none" }): Record<string, unknown> | undefined;
}

const toLatLng = (point: GeoPointLike): LatLng => ({ lat: point.latitude, lng: point.longitude });

const toDate = (value: unknown): Date | null =>
  value && typeof (value as TimestampLike).toDate === "function" ? (value as TimestampLike).toDate() : null;

export function toTrail(snapshot: SnapshotLike): Trail {
  // "estimate" shows pending server timestamps as "just now" instead of null.
  const data = snapshot.data({ serverTimestamps: "estimate" }) ?? {};
  return {
    id: snapshot.id,
    name: String(data.name ?? ""),
    region: String(data.region ?? ""),
    summary: String(data.summary ?? ""),
    description: String(data.description ?? ""),
    difficulty: (data.difficulty as Difficulty) ?? "moderate",
    distanceKm: Number(data.distanceKm ?? 0),
    elevationGainM: Number(data.elevationGainM ?? 0),
    durationMin: Number(data.durationMin ?? 0),
    dogFriendly: Boolean(data.dogFriendly),
    loop: Boolean(data.loop),
    highlights: (data.highlights as string[]) ?? [],
    start: toLatLng(data.start as GeoPointLike),
    route: ((data.route as GeoPointLike[]) ?? []).map(toLatLng),
    elevation: (data.elevation as number[]) ?? [],
    status: (data.status as TrailStatus) ?? "open",
    statusNote: String(data.statusNote ?? ""),
    lastReportAt: toDate(data.lastReportAt),
  };
}

export function toSavedTrail(snapshot: SnapshotLike): SavedTrail {
  const data = snapshot.data({ serverTimestamps: "estimate" }) ?? {};
  return {
    trailId: String(data.trailId ?? snapshot.id),
    name: String(data.name ?? ""),
    region: String(data.region ?? ""),
    distanceKm: Number(data.distanceKm ?? 0),
    difficulty: (data.difficulty as Difficulty) ?? "moderate",
    savedAt: toDate(data.savedAt),
  };
}

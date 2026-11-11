// Demo data for Friendly Trails.
//
// The trails start at real places around New York, but the routes, elevation
// profiles, stats and trail conditions are generated (deterministically) for
// the talk. They are illustrative only. Do not use them for navigation.

const ROUTE_POINTS = 120;
const ELEVATION_SAMPLES = 64;

/** @type {Array<TrailDefinition>} */
const DEFINITIONS = [
  {
    id: "storm-king-loop",
    name: "Storm King Loop",
    region: "Cornwall",
    start: [41.4230, -74.001],
    shape: "loop",
    targetKm: 5.0,
    heading: 30,
    elevation: { base: 270, range: 150 },
    difficulty: "moderate",
    dogFriendly: true,
    highlights: ["River views", "Rock ledges", "Forest"],
    status: "open",
    statusNote: "",
    lastReportHoursAgo: null,
    summary: "A rocky loop over Butter Hill and Storm King, with open ledges high above the Hudson.",
    description: [
      "The loop climbs steadily through oak forest to a string of open rock ledges, with views up and down the river and across to the mountains on the far shore.",
      "Expect short scrambles near the top and loose ground on the way down. The ledges are exposed, so keep dogs on a leash.",
    ],
  },
  {
    id: "bull-hill-climb",
    name: "Bull Hill Climb",
    region: "Cold Spring",
    start: [41.4266, -73.9652],
    shape: "linear",
    targetKm: 2.6,
    heading: 32,
    elevation: { base: 40, range: 390 },
    difficulty: "hard",
    dogFriendly: true,
    highlights: ["Steep", "Old quarry", "River views"],
    status: "open",
    statusNote: "",
    lastReportHoursAgo: null,
    summary: "A steep, sustained climb past an old quarry to a summit with wide views over the river.",
    description: [
      "The trail starts beside an old quarry and climbs with barely a break, passing several lookouts over Cold Spring and the river on the way up.",
      "It's steep and rocky most of the way, and the descent is hard on the knees. Allow more time than the distance suggests.",
    ],
  },
  {
    id: "anthonys-nose",
    name: "Anthony's Nose",
    region: "Hudson Highlands",
    start: [41.3015, -73.9513],
    shape: "linear",
    targetKm: 2.8,
    heading: 313,
    elevation: { base: 60, range: 210 },
    difficulty: "moderate",
    dogFriendly: true,
    highlights: ["Bridge views", "Ridge", "River views"],
    status: "caution",
    statusNote: "Wet leaves cover loose rock on the steep sections. Watch your footing.",
    lastReportHoursAgo: 2,
    summary: "A rocky ridge walk to a wide ledge high above the Bear Mountain Bridge.",
    description: [
      "The trail climbs onto a rocky ridge above the river and follows it north, with a few lookouts along the way, to a wide, flat ledge. The view takes in the bridge, the river and Bear Mountain on the far side.",
      "There are several steep pitches on bare rock and little shade. Parking at the trailhead is limited, so arrive early on weekends.",
    ],
  },
  {
    id: "bear-mountain-loop",
    name: "Bear Mountain Loop",
    region: "Hudson Highlands",
    start: [41.3131, -73.9898],
    shape: "loop",
    targetKm: 6.4,
    heading: 235,
    elevation: { base: 50, range: 340 },
    difficulty: "hard",
    dogFriendly: false,
    highlights: ["Summit", "Stone steps", "Panorama"],
    status: "closed",
    statusNote: "Fallen trees block the upper section after the storm.",
    lastReportHoursAgo: 5,
    summary: "A steep climb from the lake to the summit, on stone steps much of the way, with views over the river.",
    description: [
      "The loop climbs the mountain's steep east side on hundreds of stone steps, then crosses the summit before descending through quieter forest back to the lake.",
      "Most of the effort comes in the first half, and the steps are busy on weekends. Start early for a quieter climb.",
    ],
  },
  {
    id: "pine-meadow-lake-loop",
    name: "Pine Meadow Lake Loop",
    region: "Harriman",
    start: [41.174, -74.1683],
    shape: "loop",
    targetKm: 11.0,
    heading: 90,
    elevation: { base: 100, range: 200 },
    difficulty: "moderate",
    dogFriendly: true,
    highlights: ["Lake", "Brook", "Boulders"],
    status: "open",
    statusNote: "",
    lastReportHoursAgo: null,
    summary: "A long forest loop to a quiet lake, following a rocky brook for much of the way.",
    description: [
      "The loop follows a rocky brook upstream past small cascades, then climbs to a quiet lake ringed by forest. The way back crosses a ridge with a few open viewpoints.",
      "It's long, and the footing is rocky throughout. Bring plenty of water, as there's nowhere to refill along the way.",
    ],
  },
  {
    id: "mount-beacon-fire-tower",
    name: "Mount Beacon Fire Tower",
    region: "Beacon",
    start: [41.4935, -73.96],
    shape: "linear",
    targetKm: 3.0,
    heading: 135,
    elevation: { base: 60, range: 420 },
    difficulty: "moderate",
    dogFriendly: true,
    highlights: ["Fire tower", "Ruins", "River views"],
    status: "open",
    statusNote: "",
    lastReportHoursAgo: null,
    summary: "A climb past the ruins of an old incline railway to a fire tower with views up and down the river.",
    description: [
      "The trail starts with a long staircase, then climbs steadily to the ruins at the top of an old incline railway. From there, it follows the ridge to a restored fire tower.",
      "The first section is the steepest. The views from the ruins are worth it, even if you turn back there.",
    ],
  },
  {
    id: "minnewaska-lake-loop",
    name: "Minnewaska Lake Loop",
    region: "Shawangunks",
    start: [41.729, -74.2368],
    shape: "loop",
    targetKm: 2.8,
    heading: 170,
    elevation: { base: 500, range: 40 },
    difficulty: "easy",
    dogFriendly: true,
    highlights: ["Lake", "Cliffs", "Carriage roads"],
    status: "open",
    statusNote: "",
    lastReportHoursAgo: null,
    summary: "A gentle carriage road around a cliff-ringed lake on the Shawangunk Ridge.",
    description: [
      "A wide gravel carriage road circles the lake, with pale cliffs dropping into the water and open ledges looking out over the valley.",
      "It's an easy walk on a smooth surface. Arrive early on weekends, when the parking lots fill up.",
    ],
  },
  {
    id: "old-croton-aqueduct-trail",
    name: "Old Croton Aqueduct Trail",
    region: "Westchester",
    start: [40.9814, -73.8841],
    shape: "linear",
    targetKm: 5.0,
    heading: 14,
    elevation: { base: 40, range: 25 },
    difficulty: "easy",
    dogFriendly: true,
    highlights: ["Flat", "Shade", "Cafés"],
    status: "open",
    statusNote: "",
    lastReportHoursAgo: null,
    summary: "A flat, shaded path along a 19th-century aqueduct, with river towns and coffee along the way.",
    description: [
      "The path follows the buried aqueduct through woods, backyards and the centers of small river towns, with glimpses of the Hudson between the trees.",
      "It's flat and easy to follow. The train runs along the river nearby, so you can walk one way and ride back.",
    ],
  },
  {
    id: "greenbelt-forest-loop",
    name: "Greenbelt Forest Loop",
    region: "Staten Island",
    start: [40.5884, -74.1391],
    shape: "loop",
    targetKm: 6.6,
    heading: 30,
    elevation: { base: 30, range: 90 },
    difficulty: "easy",
    dogFriendly: true,
    highlights: ["City forest", "Ponds", "Shade"],
    status: "open",
    statusNote: "",
    lastReportHoursAgo: null,
    summary: "Forest without leaving the city: wooded hills, quiet ponds and miles of shaded trail.",
    description: [
      "The loop winds through a large forest in the middle of the island, over low hills and past ponds and wetlands. On a weekday morning, it's easy to forget you're in the city.",
      "Trails are well marked but cross a few roads. Expect mud after rain.",
    ],
  },
  {
    id: "jamaica-bay-loop",
    name: "Jamaica Bay Loop",
    region: "Queens",
    start: [40.6167, -73.825],
    shape: "loop",
    targetKm: 2.4,
    heading: 297,
    elevation: { base: 2, range: 8 },
    difficulty: "easy",
    dogFriendly: false,
    highlights: ["Birdwatching", "Salt marsh", "Skyline views"],
    status: "open",
    statusNote: "",
    lastReportHoursAgo: null,
    summary: "A flat loop around a pond in a wildlife refuge, with the Manhattan skyline across the bay.",
    description: [
      "The trail circles a pond between the salt marsh and the open bay. It's a popular spot for watching migrating birds in spring and fall.",
      "There's no shade, and it can be windy. Bring binoculars.",
    ],
  },
];

/**
 * @typedef {{
 *   id: string, name: string, region: string, start: [number, number],
 *   shape: "loop" | "linear", targetKm: number, heading: number,
 *   elevation: { base: number, range: number },
 *   difficulty: "easy" | "moderate" | "hard", dogFriendly: boolean,
 *   highlights: string[], status: "open" | "caution" | "closed",
 *   statusNote: string, lastReportHoursAgo: number | null,
 *   summary: string, description: string[],
 * }} TrailDefinition
 */

// --- Deterministic randomness -------------------------------------------

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Geometry --------------------------------------------------------------

const KM_PER_DEG_LAT = 110.574;
const kmPerDegLng = (lat) => 111.32 * Math.cos((lat * Math.PI) / 180);
const round = (value, digits) => Number(value.toFixed(digits));

function haversineKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function pathLengthKm(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += haversineKm(points[i - 1], points[i]);
  return total;
}

/** Convert local x/y offsets in km (x east, y north) to lat/lng around a start point. */
function toLatLng([lat0, lng0], xKm, yKm) {
  return {
    lat: round(lat0 + yKm / KM_PER_DEG_LAT, 6),
    lng: round(lng0 + xKm / kmPerDegLng(lat0), 6),
  };
}

function loopRoute(def, rand) {
  const phases = [rand(), rand(), rand(), rand()].map((p) => p * Math.PI * 2);
  const wobble = (theta) =>
    1 +
    0.18 * Math.sin(2 * theta + phases[0]) +
    0.1 * Math.sin(3 * theta + phases[1]) +
    0.05 * Math.sin(5 * theta + phases[2]) +
    0.025 * Math.sin(11 * theta + phases[3]);

  // Compass heading (0 = north, clockwise) to a math angle (0 = east, counter-clockwise).
  const towardsCentre = ((90 - def.heading) * Math.PI) / 180;
  const startAngle = towardsCentre + Math.PI;

  const build = (radiusKm) => {
    const cx = radiusKm * wobble(0) * Math.cos(towardsCentre);
    const cy = radiusKm * wobble(0) * Math.sin(towardsCentre);
    return Array.from({ length: ROUTE_POINTS }, (_, i) => {
      const theta = (2 * Math.PI * i) / (ROUTE_POINTS - 1);
      const r = radiusKm * wobble(theta);
      return toLatLng(def.start, cx + r * Math.cos(theta + startAngle), cy + r * Math.sin(theta + startAngle));
    });
  };

  const unitLength = pathLengthKm(build(1));
  return build(def.targetKm / unitLength);
}

function linearRoute(def, rand) {
  const [p1, p2] = [rand() * Math.PI * 2, rand() * Math.PI * 2];
  const step = def.targetKm / (ROUTE_POINTS - 1);
  let x = 0;
  let y = 0;
  const points = [toLatLng(def.start, 0, 0)];
  for (let i = 1; i < ROUTE_POINTS; i++) {
    const t = i / (ROUTE_POINTS - 1);
    const heading =
      def.heading + 25 * Math.sin(2 * Math.PI * 1.5 * t + p1) + 10 * Math.sin(2 * Math.PI * 4 * t + p2);
    const rad = (heading * Math.PI) / 180;
    x += step * Math.sin(rad);
    y += step * Math.cos(rad);
    points.push(toLatLng(def.start, x, y));
  }
  return points;
}

function elevationProfile(def, rand) {
  const [p1, p2, p3] = [rand(), rand(), rand()].map((p) => p * Math.PI * 2);
  const raw = Array.from({ length: ELEVATION_SAMPLES }, (_, j) => {
    const t = j / (ELEVATION_SAMPLES - 1);
    if (def.shape === "loop") {
      // Starts and ends at the same height.
      const hill = Math.sin(Math.PI * t) ** 1.4;
      return Math.max(0, hill * (1 + 0.22 * Math.sin(4 * Math.PI * t + p1)) + 0.06 * Math.sin(9 * Math.PI * t + p2) * Math.sin(Math.PI * t));
    }
    return (
      0.5 +
      0.32 * Math.sin(2 * Math.PI * 0.8 * t + p1) +
      0.14 * Math.sin(2 * Math.PI * 2.3 * t + p2) +
      0.05 * Math.sin(2 * Math.PI * 6 * t + p3)
    );
  });
  const min = Math.min(...raw);
  const max = Math.max(...raw);
  return raw.map((value) => Math.round(def.elevation.base + (def.elevation.range * (value - min)) / (max - min)));
}

function elevationGain(samples) {
  let gain = 0;
  for (let i = 1; i < samples.length; i++) gain += Math.max(0, samples[i] - samples[i - 1]);
  return gain;
}

// --- Public API -------------------------------------------------------------

/** Build every demo trail as plain data (no Firestore types). */
export function buildTrails() {
  return DEFINITIONS.map((def) => {
    const rand = mulberry32(hashString(def.id));
    const route = def.shape === "loop" ? loopRoute(def, rand) : linearRoute(def, rand);
    const elevation = elevationProfile(def, rand);
    const distanceKm = round(pathLengthKm(route), 1);
    const elevationGainM = elevationGain(elevation);
    // Naismith-style estimate: 4.5 km/h plus an hour per 600 m of climbing.
    const durationMin = Math.round(((distanceKm / 4.5) * 60 + (elevationGainM / 600) * 60) / 5) * 5;

    return {
      id: def.id,
      name: def.name,
      region: def.region,
      summary: def.summary,
      description: def.description.join("\n\n"),
      difficulty: def.difficulty,
      distanceKm,
      elevationGainM,
      durationMin,
      dogFriendly: def.dogFriendly,
      loop: def.shape === "loop",
      highlights: def.highlights,
      start: route[0],
      route,
      elevation,
      status: def.status,
      statusNote: def.statusNote,
      lastReportHoursAgo: def.lastReportHoursAgo,
    };
  });
}

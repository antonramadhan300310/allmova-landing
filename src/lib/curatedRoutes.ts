export const SPORT_TYPES = ["cycling", "run", "walking", "hike"] as const;
export type SportType = (typeof SPORT_TYPES)[number];

export const DIFFICULTIES = ["easy", "moderate", "hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type RouteCoordinate = [number, number];

export type CuratedRoute = {
  id: string;
  name: string;
  city: string;
  sportType: SportType;
  distanceKm: number;
  elevationGainM: number;
  difficulty: Difficulty;
  description: string;
  isPro: boolean;
  isActive: boolean;
  coordinates: RouteCoordinate[];
  createdAt: string | null;
  updatedAt: string | null;
};

export type CuratedRouteInput = {
  id: string | null;
  name: string;
  city: string;
  sportType: SportType;
  distanceKm: number;
  elevationGainM: number;
  difficulty: Difficulty;
  description: string;
  isPro: boolean;
  isActive: boolean;
  coordinates: RouteCoordinate[];
};

export type SportFilter = "all" | SportType;

export type ParsedGpx = {
  name: string | null;
  coordinates: RouteCoordinate[];
  totalPoints: number;
  distanceKm: number;
  elevationGainM: number;
};

/** Batas titik yang disimpan ke JSONB agar payload tetap ringan. */
export const MAX_STORED_POINTS = 400;

export const sportLabels: Record<SportType, string> = {
  cycling: "cycling",
  run: "run",
  walking: "walking",
  hike: "hike",
};

export const sportFilterLabels: Record<SportFilter, string> = {
  all: "Semua",
  cycling: "Cycling",
  run: "Run",
  walking: "Walking",
  hike: "Hike",
};

export const difficultyLabels: Record<Difficulty, string> = {
  easy: "Mudah",
  moderate: "Menengah",
  hard: "Berat",
};

const SPORT_ALIASES: Record<string, SportType> = {
  cycling: "cycling",
  cycle: "cycling",
  bike: "cycling",
  ride: "cycling",
  road: "cycling",
  mtb: "cycling",
  run: "run",
  running: "run",
  lari: "run",
  walking: "walking",
  walk: "walking",
  jalan: "walking",
  hike: "hike",
  hiking: "hike",
  trail: "hike",
  mendaki: "hike",
};

const DIFFICULTY_ALIASES: Record<string, Difficulty> = {
  easy: "easy",
  mudah: "easy",
  moderate: "moderate",
  medium: "moderate",
  menengah: "moderate",
  hard: "hard",
  berat: "hard",
  difficult: "hard",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function firstValue(
  row: Record<string, unknown>,
  keys: string[],
): unknown {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return undefined;
}

function firstString(row: Record<string, unknown>, keys: string[]): string {
  const value = firstValue(row, keys);
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}

function firstNumber(row: Record<string, unknown>, keys: string[]): number {
  const value = firstValue(row, keys);
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function firstBoolean(
  row: Record<string, unknown>,
  keys: string[],
  fallback: boolean,
): boolean {
  const value = firstValue(row, keys);
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "t", "1", "yes", "ya", "aktif", "active"].includes(normalized)) {
      return true;
    }
    if (["false", "f", "0", "no", "tidak", "draft", "inactive"].includes(normalized)) {
      return false;
    }
  }
  return fallback;
}

function normalizeSport(value: string): SportType {
  return SPORT_ALIASES[value.trim().toLowerCase()] ?? "cycling";
}

function normalizeDifficulty(value: string): Difficulty {
  return DIFFICULTY_ALIASES[value.trim().toLowerCase()] ?? "easy";
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function normalizeCoordinates(value: unknown): RouteCoordinate[] {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) return [];

  const points: RouteCoordinate[] = [];
  for (const item of parsed) {
    if (Array.isArray(item) && item.length >= 2) {
      const lat = Number(item[0]);
      const lng = Number(item[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) points.push([lat, lng]);
      continue;
    }
    const record = asRecord(item);
    const lat = Number(record.lat ?? record.latitude);
    const lng = Number(record.lng ?? record.lon ?? record.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) points.push([lat, lng]);
  }
  return points;
}

export function normalizeCuratedRoute(raw: unknown): CuratedRoute {
  const row = asRecord(raw);

  return {
    id: firstString(row, ["id", "route_id", "curated_route_id"]),
    name: firstString(row, ["name", "route_name", "title"]),
    city: firstString(row, ["city", "area", "kota", "region"]),
    sportType: normalizeSport(firstString(row, ["sport_type", "sport", "activity_type"])),
    distanceKm: firstNumber(row, ["distance_km", "distance", "distance_km_total"]),
    elevationGainM: firstNumber(row, [
      "elevation_gain_m",
      "elevation_m",
      "elevation_gain",
    ]),
    difficulty: normalizeDifficulty(firstString(row, ["difficulty", "level"])),
    description: firstString(row, ["description", "notes", "summary"]),
    isPro: firstBoolean(row, ["is_pro", "pro", "premium"], false),
    isActive: firstBoolean(row, ["is_active", "active", "published"], true),
    coordinates: normalizeCoordinates(
      firstValue(row, ["coordinates", "path", "points", "track"]),
    ),
    createdAt: normalizeDate(firstValue(row, ["created_at", "created"])),
    updatedAt: normalizeDate(firstValue(row, ["updated_at", "updated"])),
  };
}

export function normalizeCuratedRoutes(payload: unknown): CuratedRoute[] {
  const rows = Array.isArray(payload)
    ? payload
    : (() => {
        const record = asRecord(payload);
        const nested = record.routes ?? record.data ?? record.rows ?? record.items;
        return Array.isArray(nested) ? nested : [];
      })();

  return rows
    .map(normalizeCuratedRoute)
    .filter((route) => route.id !== "" || route.name !== "");
}

export function filterCuratedRoutes(
  routes: CuratedRoute[],
  query: string,
  sport: SportFilter,
): CuratedRoute[] {
  const needle = query.trim().toLowerCase();

  return routes.filter((route) => {
    if (sport !== "all" && route.sportType !== sport) return false;
    if (needle === "") return true;
    return (
      route.name.toLowerCase().includes(needle) ||
      route.city.toLowerCase().includes(needle)
    );
  });
}

export function toUpsertArgs(input: CuratedRouteInput) {
  return {
    p_id: input.id,
    p_name: input.name.trim(),
    p_city: input.city.trim() || null,
    p_sport_type: input.sportType,
    p_distance_km: Number(input.distanceKm.toFixed(2)),
    p_elevation_gain_m: Math.round(input.elevationGainM),
    p_difficulty: input.difficulty,
    p_description: input.description.trim() || null,
    p_is_pro: input.isPro,
    p_is_active: input.isActive,
    p_coordinates: input.coordinates,
  };
}

/** Polyline SVG (viewBox `width`x`height`) dengan aspek rasio jalur dipertahankan. */
export function buildRoutePolyline(
  coordinates: RouteCoordinate[],
  width = 100,
  height = 100,
  padding = 6,
): string {
  if (coordinates.length < 2) return "";

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lat, lng] of coordinates) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  const spanLng = Math.max(maxLng - minLng, 1e-6);
  const spanLat = Math.max(maxLat - minLat, 1e-6);
  const scale = Math.min(
    (width - padding * 2) / spanLng,
    (height - padding * 2) / spanLat,
  );
  const offsetX = (width - spanLng * scale) / 2;
  const offsetY = (height - spanLat * scale) / 2;

  return coordinates
    .map(([lat, lng]) => {
      const x = offsetX + (lng - minLng) * scale;
      const y = height - offsetY - (lat - minLat) * scale;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

function haversineKm(a: RouteCoordinate, b: RouteCoordinate): number {
  const dLat = toRadians(b[0] - a[0]);
  const dLng = toRadians(b[1] - a[1]);
  const lat1 = toRadians(a[0]);
  const lat2 = toRadians(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

function downsample(
  points: RouteCoordinate[],
  max: number = MAX_STORED_POINTS,
): RouteCoordinate[] {
  if (points.length <= max) return points;

  const step = (points.length - 1) / (max - 1);
  const sampled: RouteCoordinate[] = [];
  for (let index = 0; index < max; index += 1) {
    sampled.push(points[Math.round(index * step)]);
  }
  return sampled;
}

function gpxName(doc: Document): string | null {
  const selectors = ["trk > name", "rte > name", "metadata > name", "name"];
  for (const selector of selectors) {
    const text = doc.querySelector(selector)?.textContent?.trim();
    if (text) return text;
  }
  return null;
}

/** Parse GPX di browser: jarak Haversine, elevasi positif, koordinat [lat, lng][]. */
export function parseGpx(xml: string, fallbackName = ""): ParsedGpx {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error("File GPX tidak dapat dibaca. Pastikan format XML valid.");
  }

  const nodes = Array.from(doc.querySelectorAll("trkpt, rtept"));
  if (nodes.length === 0) {
    throw new Error("Tidak ada titik jalur (<trkpt> / <rtept>) di dalam file GPX.");
  }

  const points: RouteCoordinate[] = [];
  const elevations: number[] = [];

  for (const node of nodes) {
    const lat = Number(node.getAttribute("lat"));
    const lng = Number(node.getAttribute("lon"));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    points.push([lat, lng]);
    const eleText = node.querySelector("ele")?.textContent?.trim();
    const ele = eleText ? Number(eleText) : NaN;
    elevations.push(Number.isFinite(ele) ? ele : NaN);
  }

  if (points.length === 0) {
    throw new Error("Koordinat pada file GPX tidak valid.");
  }

  let distanceKm = 0;
  for (let index = 1; index < points.length; index += 1) {
    distanceKm += haversineKm(points[index - 1], points[index]);
  }

  let elevationGainM = 0;
  let previousEle = NaN;
  for (const ele of elevations) {
    if (!Number.isFinite(ele)) continue;
    if (Number.isFinite(previousEle) && ele > previousEle) {
      elevationGainM += ele - previousEle;
    }
    previousEle = ele;
  }

  return {
    name: gpxName(doc) ?? (fallbackName.trim() || null),
    coordinates: downsample(points),
    totalPoints: points.length,
    distanceKm: Number(distanceKm.toFixed(2)),
    elevationGainM: Math.round(elevationGainM),
  };
}

export function formatDistanceKm(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return `${value.toFixed(value >= 100 ? 0 : 1)} km`;
}

export function formatElevation(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return `+${Math.round(value).toLocaleString("id-ID")} m`;
}

export function isUnauthorizedRpcError(error: {
  message?: string;
  details?: string | null;
  code?: string;
}): boolean {
  const text = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return (
    error.code === "42501" ||
    text.includes("unauthorized") ||
    text.includes("permission denied") ||
    text.includes("akses ditolak") ||
    text.includes("not owner") ||
    text.includes("forbidden")
  );
}

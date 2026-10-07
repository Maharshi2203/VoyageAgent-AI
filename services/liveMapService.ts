/**
 * liveMapService.ts
 * =================
 * Real-world data behind the trip map (all keyless).
 *
 *  - Stop positions: each itinerary stop is looked up by name in OpenStreetMap
 *    (Photon), so pins sit on the real place instead of the AI's estimate
 *  - Routes: road geometry, distance and drive time between stops from OSRM
 */

import { Activity, Itinerary } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LatLng = [number, number];

export interface RouteLeg {
  distanceKm: number;
  durationMin: number;
}

export interface LiveRoute {
  /** Road geometry to draw. */
  path: LatLng[];
  /** One entry per hop between consecutive stops. */
  legs: RouteLeg[];
}

export interface MapStop {
  activity: Activity;
  day: number;
  /** 1-based position within its day. */
  order: number;
  position: LatLng;
  /** True when the position was confirmed against OpenStreetMap. */
  verified: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PHOTON_API      = 'https://photon.komoot.io/api/';
const OSRM_API        = 'https://router.project-osrm.org/route/v1/driving/';
const LOCATION_CACHE  = 'voyage_stop_locations_v1';
const SEARCH_BOX      = 0.6; // degrees around the destination centre (~60 km)

/** Words too generic to prove that a search hit is the stop we asked for. */
const GENERIC_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'tour', 'visit', 'walk', 'local', 'street', 'food', 'dinner', 'lunch',
  'breakfast', 'market', 'evening', 'morning', 'sunset', 'sunrise', 'experience', 'tasting', 'shopping',
  'restaurant', 'cafe', 'hotel', 'road', 'city', 'old', 'new', 'view', 'point', 'park', 'temple', 'museum',
  'lake', 'fort', 'palace', 'beach', 'garden',
]);

// ─── Stop positions ───────────────────────────────────────────────────────────

const routeCache = new Map<string, Promise<LiveRoute>>();
const lookupCache = new Map<string, Promise<LatLng | null>>();

function readLocations(): Record<string, LatLng | null> {
  try {
    return JSON.parse(localStorage.getItem(LOCATION_CACHE) || '{}');
  } catch {
    return {};
  }
}

function writeLocation(key: string, value: LatLng | null): void {
  try {
    localStorage.setItem(LOCATION_CACHE, JSON.stringify({ ...readLocations(), [key]: value }));
  } catch { /* storage full or unavailable – lookups still work in memory */ }
}

function words(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
}

/** Position of a named place near the destination, or null when OpenStreetMap has no clear match. */
function lookupPlace(name: string, center: { lat: number; lng: number }): Promise<LatLng | null> {
  const key = `${name.toLowerCase()}|${center.lat.toFixed(1)},${center.lng.toFixed(1)}`;
  const stored = readLocations();
  if (key in stored) return Promise.resolve(stored[key]);

  let pending = lookupCache.get(key);
  if (!pending) {
    const bbox = [
      center.lng - SEARCH_BOX, center.lat - SEARCH_BOX,
      center.lng + SEARCH_BOX, center.lat + SEARCH_BOX,
    ].join(',');
    const search = async (query: string): Promise<LatLng | null> => {
      const url = `${PHOTON_API}?q=${encodeURIComponent(query)}&lat=${center.lat}&lon=${center.lng}&bbox=${bbox}&limit=1&lang=en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const hit = (await res.json())?.features?.[0];
      const wanted = words(query).filter((w) => !GENERIC_WORDS.has(w));
      const found = new Set(words(hit?.properties?.name ?? ''));
      // Trust the hit only when it shares a distinctive word with the stop name
      return hit && wanted.some((w) => found.has(w))
        ? [hit.geometry.coordinates[1], hit.geometry.coordinates[0]]
        : null;
    };

    // "Sensō-ji Temple & Nakamise Dori" names two places – fall back to the first one
    const firstPlace = name.split(/\s+(?:&|and|with|at)\s+|[,(]/i)[0].trim();

    pending = search(name)
      .then((position) => position ?? (firstPlace && firstPlace !== name ? search(firstPlace) : null))
      .then((position) => {
        writeLocation(key, position);
        return position;
      })
      .catch(() => {
        lookupCache.delete(key); // network trouble – try again next time
        return null;
      });
    lookupCache.set(key, pending);
  }
  return pending;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const liveMapService = {
  /** Stops of an itinerary using the AI's own coordinates – available immediately. */
  draftStops(itinerary: Itinerary, selectedDay?: number): MapStop[] {
    return itinerary.days
      .filter((d) => selectedDay === undefined || d.day === selectedDay)
      .flatMap((d) => d.activities
        .filter((a) => a.coordinates && Number.isFinite(a.coordinates.lat) && Number.isFinite(a.coordinates.lng))
        .map((a, i): MapStop => ({
          activity: a,
          day: d.day,
          order: i + 1,
          position: [a.coordinates!.lat, a.coordinates!.lng],
          verified: false,
        })));
  },

  /** The same stops, moved onto their real OpenStreetMap position wherever one is found. */
  async verifyStops(stops: MapStop[], center: { lat: number; lng: number }): Promise<MapStop[]> {
    const positions = await Promise.all(stops.map((s) => lookupPlace(s.activity.name, center)));
    return stops.map((s, i) => (positions[i] ? { ...s, position: positions[i]!, verified: true } : s));
  },

  /** Road route through the given points, in order. Rejects when routing is unavailable. */
  route(points: LatLng[]): Promise<LiveRoute> {
    if (points.length < 2) return Promise.resolve({ path: points, legs: [] });

    const key = points.map(([lat, lng]) => `${lng.toFixed(5)},${lat.toFixed(5)}`).join(';');
    let pending = routeCache.get(key);
    if (!pending) {
      pending = fetch(`${OSRM_API}${key}?overview=full&geometries=geojson`)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`Routing failed (${res.status})`))))
        .then((json): LiveRoute => {
          const route = json?.routes?.[0];
          if (json?.code !== 'Ok' || !route) throw new Error('No road route found');
          return {
            path: (route.geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng]),
            legs: (route.legs as Array<{ distance: number; duration: number }>).map((leg) => ({
              distanceKm: leg.distance / 1000,
              durationMin: leg.duration / 60,
            })),
          };
        });
      pending.catch(() => routeCache.delete(key));
      routeCache.set(key, pending);
    }
    return pending;
  },

  /** Turn-by-turn navigation to a point, opened in Google Maps. */
  directionsUrl([lat, lng]: LatLng): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  },
};

export function formatLeg(leg: RouteLeg): string {
  const mins = Math.max(1, Math.round(leg.durationMin));
  const time = mins >= 60 ? `${Math.floor(mins / 60)} h ${mins % 60} min` : `${mins} min`;
  const distance = leg.distanceKm >= 10 ? `${Math.round(leg.distanceKm)} km` : `${leg.distanceKm.toFixed(1)} km`;
  return `${time} · ${distance} by road`;
}

import { useEffect, useMemo, useState } from 'react';
import { Itinerary } from '../types';
import { liveMapService, LiveRoute, MapStop } from './liveMapService';

export interface DayRoute extends LiveRoute {
  day: number;
  /** False when road routing failed and the path is a straight-line fallback. */
  live: boolean;
}

export interface LiveTripMap {
  stops: MapStop[];
  routes: DayRoute[];
  status: 'loading' | 'live' | 'offline';
}

const VERIFY_TIMEOUT_MS = 6000;

/** Colour of a day's pins and route line. */
export const DAY_COLORS = ['#97A87A', '#38BDF8', '#F59E0B', '#F472B6', '#A78BFA', '#34D399', '#FB7185', '#FACC15'];
export const dayColor = (day: number): string => DAY_COLORS[(day - 1) % DAY_COLORS.length];

/**
 * Live map data for an itinerary: stops snapped to their real position and a
 * road route per day. Shows the AI's draft positions first, then upgrades.
 */
export function useLiveTripMap(itinerary: Itinerary, selectedDay?: number): LiveTripMap {
  const draft = useMemo(() => liveMapService.draftStops(itinerary, selectedDay), [itinerary, selectedDay]);
  const [live, setLive] = useState<LiveTripMap>({ stops: draft, routes: [], status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setLive({ stops: draft, routes: [], status: 'loading' });

    (async () => {
      const center = itinerary.destinationCoords
        ?? (draft[0] ? { lat: draft[0].position[0], lng: draft[0].position[1] } : null);
      // Don't hold the route up for a slow lookup: results are cached, so the
      // next visit to the map gets the verified positions instantly.
      const stops = center
        ? await Promise.race([
            liveMapService.verifyStops(draft, center),
            new Promise<typeof draft>((resolve) => setTimeout(() => resolve(draft), VERIFY_TIMEOUT_MS)),
          ])
        : draft;
      if (cancelled) return;
      setLive({ stops, routes: [], status: 'loading' });

      // One road route per day, fetched in turn to stay polite to the public router
      const routes: DayRoute[] = [];
      for (const day of [...new Set(stops.map((s) => s.day))]) {
        const points = stops.filter((s) => s.day === day).map((s) => s.position);
        try {
          routes.push({ day, live: true, ...(await liveMapService.route(points)) });
        } catch {
          routes.push({ day, live: false, path: points, legs: [] });
        }
        if (cancelled) return;
      }
      setLive({ stops, routes, status: routes.some((r) => r.live) || routes.length === 0 ? 'live' : 'offline' });
    })();

    return () => { cancelled = true; };
  }, [draft]);

  return live;
}

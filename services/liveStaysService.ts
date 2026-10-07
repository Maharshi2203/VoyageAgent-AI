/**
 * liveStaysService.ts
 * ===================
 * Real-time booking data for the trip workspace.
 *
 *  - Stays:  real hotels, resorts, hostels and guest houses around the trip
 *    destination, from OpenStreetMap via the Photon geocoder (keyless)
 *  - Prices: there is no keyless price feed, so every option links to the
 *    live search of a booking site, pre-filled with the trip dates and party size
 */

import { Trip } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LiveStay {
  id: string;
  name: string;
  kind: 'Hotel' | 'Resort' | 'Hostel' | 'Guest house';
  address: string;
  coordinates: { lat: number; lng: number };
  /** Straight-line distance from the destination centre. */
  distanceKm: number;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_id?: number;
    osm_value?: string;
    name?: string;
    street?: string;
    district?: string;
    city?: string;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PHOTON_API   = 'https://photon.komoot.io/api/';
const SEARCH_BOX   = 0.2;  // degrees around the destination centre (~20 km)
const MAX_STAYS    = 24;
const STAY_TAGS    = ['hotel', 'resort', 'hostel', 'guest_house'];
const STAY_QUERIES = ['hotel', 'resort'];

const KIND_BY_TAG: Record<string, LiveStay['kind']> = {
  hotel: 'Hotel', resort: 'Resort', hostel: 'Hostel', guest_house: 'Guest house',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

async function photon(query: string, center: { lat: number; lng: number }, signal?: AbortSignal): Promise<PhotonFeature[]> {
  const bbox = [
    center.lng - SEARCH_BOX, center.lat - SEARCH_BOX,
    center.lng + SEARCH_BOX, center.lat + SEARCH_BOX,
  ].join(',');
  const url = `${PHOTON_API}?q=${query}&lat=${center.lat}&lon=${center.lng}&bbox=${bbox}&limit=25&lang=en`
    + STAY_TAGS.map((tag) => `&osm_tag=tourism:${tag}`).join('');
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Stay search failed (${res.status})`);
  return ((await res.json())?.features ?? []) as PhotonFeature[];
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const liveStaysService = {
  /** Real places to stay around a point, nearest first. */
  async searchStays(center: { lat: number; lng: number }, signal?: AbortSignal): Promise<LiveStay[]> {
    const batches = await Promise.all(STAY_QUERIES.map((q) => photon(q, center, signal)));

    const seen = new Set<string>();
    const stays: LiveStay[] = [];
    for (const feature of batches.flat()) {
      const p = feature.properties;
      const name = p.name?.trim();
      // Unnamed listings and ones literally called "Hotel" cannot be looked up on a booking site
      if (!name || STAY_TAGS.includes(name.toLowerCase())) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      const [lng, lat] = feature.geometry.coordinates;
      stays.push({
        id: `stay_${p.osm_id ?? key}`,
        name,
        kind: KIND_BY_TAG[p.osm_value ?? ''] ?? 'Hotel',
        address: [p.street, p.district, p.city].filter(Boolean).join(', '),
        coordinates: { lat, lng },
        distanceKm: distanceKm(center, { lat, lng }),
      });
    }

    return stays.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, MAX_STAYS);
  },

  /** Booking.com search for one property, pre-filled with the trip dates and travellers. */
  stayPriceUrl(stay: LiveStay, trip: Trip): string {
    const params = new URLSearchParams({
      ss: `${stay.name}, ${trip.destination}`,
      checkin: trip.startDate,
      checkout: trip.endDate,
      group_adults: String(trip.travelers || 1),
    });
    return `https://www.booking.com/searchresults.html?${params}`;
  },

  /** Every available stay at the destination for the trip dates. */
  allStaysUrl(trip: Trip): string {
    const params = new URLSearchParams({
      ss: trip.destination,
      checkin: trip.startDate,
      checkout: trip.endDate,
      group_adults: String(trip.travelers || 1),
    });
    return `https://www.booking.com/searchresults.html?${params}`;
  },

  /** Google Flights search for the trip dates. */
  flightsUrl(trip: Trip): string {
    const q = `Flights to ${trip.destination} on ${trip.startDate} through ${trip.endDate}`;
    return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}`;
  },

  /** Train options to the destination on the departure date. */
  trainsUrl(trip: Trip): string {
    const q = `trains to ${trip.destination} on ${trip.startDate}`;
    return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  },
};

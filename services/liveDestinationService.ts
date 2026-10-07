/**
 * liveDestinationService.ts
 * =========================
 * Real-time data for the Discover section.
 *
 *  - Destinations: generated on demand by Gemini for the current date/season
 *    (cached in localStorage so a page revisit does not burn API quota)
 *  - Place search: any city, region or country as you type, from Wikipedia and
 *    Open-Meteo's geocoder (keyless, no Gemini quota)
 *  - Photos:       lead image of the matching Wikipedia article (keyless)
 *  - Weather:      current conditions from Open-Meteo (keyless)
 */

import { Type } from '@google/genai';
import { DestinationGuide } from '../types';
import { CURATED_DESTINATIONS } from './mockData';
import { geminiRM } from './geminiRequestManager';
import { MODEL } from './geminiService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LiveWeather {
  temperature: number;
  condition: string;
}

export interface LiveDestinationBatch {
  destinations: DestinationGuide[];
  fetchedAt: number;
}

type Category = DestinationGuide['category'];

// ─── Constants ────────────────────────────────────────────────────────────────

const CACHE_KEY    = 'voyage_live_destinations_v1';
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const BATCH_SIZE   = 9;

const CATEGORIES: Category[] = [
  'Trending', 'Beach', 'Mountains', 'Culture', 'Food', 'Adventure', 'Luxury', 'Budget', 'Solo', 'Couples',
];

const DESTINATION_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      country: { type: Type.STRING },
      tagline: { type: Type.STRING },
      overview: { type: Type.STRING },
      bestTimeToVisit: { type: Type.STRING },
      avgBudgetMin: { type: Type.NUMBER },
      avgBudgetMax: { type: Type.NUMBER },
      howToReach: { type: Type.STRING },
      category: { type: Type.STRING },
      popularAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
      topExperiences: { type: Type.ARRAY, items: { type: Type.STRING } },
      coordinates: {
        type: Type.OBJECT,
        properties: {
          lat: { type: Type.NUMBER },
          lng: { type: Type.NUMBER },
        },
        required: ['lat', 'lng'],
      },
      wikiTitle: { type: Type.STRING },
    },
    required: [
      'name', 'country', 'tagline', 'overview', 'bestTimeToVisit', 'avgBudgetMin', 'avgBudgetMax',
      'howToReach', 'category', 'popularAreas', 'topExperiences', 'coordinates', 'wikiTitle',
    ],
  },
};

const DETAILS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    bestTimeToVisit: { type: Type.STRING },
    avgBudgetMin: { type: Type.NUMBER },
    avgBudgetMax: { type: Type.NUMBER },
    howToReach: { type: Type.STRING },
    category: { type: Type.STRING },
    popularAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
    topExperiences: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    'bestTimeToVisit', 'avgBudgetMin', 'avgBudgetMax', 'howToReach', 'category', 'popularAreas', 'topExperiences',
  ],
};

// ─── Cache & registry ─────────────────────────────────────────────────────────

/** Every live destination seen this session, so the detail page can look one up by id. */
const registry = new Map<string, DestinationGuide>();
const inflight = new Map<string, Promise<LiveDestinationBatch>>();

function readCache(): Record<string, LiveDestinationBatch> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeCache(category: string, batch: LiveDestinationBatch): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...readCache(), [category]: batch }));
  } catch { /* storage full or unavailable – live data still works in memory */ }
}

function register(destinations: DestinationGuide[]): void {
  destinations.forEach((d) => registry.set(d.id, d));
}

Object.values(readCache()).forEach((batch) => register(batch.destinations ?? []));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function describeWeatherCode(code: number): string {
  if (code === 0) return 'Clear';
  if (code === 1) return 'Mostly clear';
  if (code === 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code === 85 || code === 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
}

function categoryInstruction(category: string): string {
  switch (category) {
    case 'All':
      return 'List destinations that are trending or in their ideal season right now (this month and the next two). Mix Indian and international places across varied categories.';
    case 'Trending':
      return 'List the destinations that are trending with travellers right now.';
    case 'Weekend escapes':
      return 'List short 2-3 day getaways within India that are easy to reach from major Indian metros and pleasant at this time of year.';
    default:
      return `List the best "${category}" destinations worldwide to visit in the current season.`;
  }
}

/** Lead image of each Wikipedia article, keyed by the title that was asked for. */
async function fetchWikiImages(titles: string[]): Promise<Record<string, string>> {
  const unique = [...new Set(titles.filter(Boolean))];
  if (unique.length === 0) return {};

  try {
    const url = 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1'
      + '&prop=pageimages&piprop=thumbnail&pithumbsize=1200'
      + `&titles=${encodeURIComponent(unique.join('|'))}`;
    const res = await fetch(url);
    if (!res.ok) return {};
    const query = (await res.json())?.query ?? {};

    // Wikipedia may normalise and/or redirect a title before resolving it to a page.
    const renamed = new Map<string, string>();
    [...(query.normalized ?? []), ...(query.redirects ?? [])].forEach(
      (r: { from: string; to: string }) => renamed.set(r.from, r.to),
    );
    const imageByTitle = new Map<string, string>();
    Object.values(query.pages ?? {}).forEach((p) => {
      const page = p as { title: string; thumbnail?: { source: string } };
      if (page.thumbnail?.source) imageByTitle.set(page.title, page.thumbnail.source);
    });

    const result: Record<string, string> = {};
    unique.forEach((title) => {
      let resolved = title;
      for (let i = 0; i < 3 && renamed.has(resolved); i++) resolved = renamed.get(resolved)!;
      const image = imageByTitle.get(resolved);
      if (image) result[title] = image;
    });
    return result;
  } catch {
    return {};
  }
}

async function generate(
  instruction: string,
  count: number,
  exclude: string[],
  forcedCategory?: Category,
): Promise<DestinationGuide[]> {
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const prompt = `You are a travel intelligence engine for travellers based in India. Today is ${today}.
    ${instruction}
    Return exactly ${count} distinct destinations.${exclude.length ? ` Do NOT include any of these: ${exclude.join('; ')}.` : ''}

    For each destination provide:
    - name: the city or region name only, without the country.
    - country
    - tagline: one evocative line under 12 words.
    - overview: two sentences on what makes it special.
    - bestTimeToVisit: the months, then a short reason in parentheses.
    - avgBudgetMin / avgBudgetMax: realistic total cost in Indian Rupees per person for a 5-day trip at current prices, including travel from India.
    - howToReach: nearest airport(s) with IATA codes and the usual route from India.
    - category: exactly one of ${CATEGORIES.join(', ')}.
    - popularAreas: 4 neighbourhoods or areas worth staying in or visiting.
    - topExperiences: 4 specific things to do.
    - coordinates: precise latitude and longitude.
    - wikiTitle: the exact title of the English Wikipedia article about the place.`;

  const request = () => geminiRM.request({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: DESTINATION_SCHEMA,
    },
    // Freshness is the point here – caching is handled above in localStorage.
    cacheKey: `liveDestinations::${Date.now()}::${Math.random()}`,
  });

  // The model intermittently answers 503 under load; one delayed retry usually clears it.
  const text = await request().catch(async (err) => {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes('503') && !msg.includes('UNAVAILABLE')) throw err;
    await new Promise((resolve) => setTimeout(resolve, 4000));
    return request();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw: any[] = JSON.parse(text);
  const valid = (Array.isArray(raw) ? raw : []).filter(
    (d) => d?.name && d?.country && Number.isFinite(d?.coordinates?.lat) && Number.isFinite(d?.coordinates?.lng),
  );
  const images = await fetchWikiImages(valid.map((d) => d.wikiTitle));

  const destinations = valid.map((d): DestinationGuide => {
    const min = Math.round(Number(d.avgBudgetMin) || 0);
    const max = Math.round(Number(d.avgBudgetMax) || 0);
    return {
      id: `live-${slug(d.name)}-${slug(d.country)}`,
      name: d.name,
      country: d.country,
      tagline: d.tagline ?? '',
      overview: d.overview ?? '',
      bestTimeToVisit: d.bestTimeToVisit ?? '',
      avgBudgetMin: Math.min(min, max),
      avgBudgetMax: Math.max(min, max),
      currency: '₹',
      howToReach: d.howToReach ?? '',
      category: forcedCategory ?? (CATEGORIES.includes(d.category) ? d.category : 'Trending'),
      imageUrl: images[d.wikiTitle] ?? '',
      popularAreas: Array.isArray(d.popularAreas) ? d.popularAreas : [],
      topExperiences: Array.isArray(d.topExperiences) ? d.topExperiences : [],
      coordinates: { lat: d.coordinates.lat, lng: d.coordinates.lng },
    };
  });

  register(destinations);
  return destinations;
}

function dedupe(destinations: DestinationGuide[]): DestinationGuide[] {
  const seen = new Set<string>();
  return destinations.filter((d) => (seen.has(d.id) ? false : (seen.add(d.id), true)));
}

// ─── Live place search (Wikipedia + Open-Meteo geocoder) ─────────────────────

interface WikiPage {
  title: string;
  index?: number;
  thumbnail?: { source: string };
  extract?: string;
  description?: string;
  coordinates?: Array<{ lat: number; lon: number; type?: string; country?: string }>;
}

interface GeoPlace {
  name: string;
  latitude: number;
  longitude: number;
  feature_code?: string;
  country?: string;
  admin1?: string;
  population?: number;
}

const WIKI_API = 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1'
  + '&prop=pageimages|extracts|coordinates|description&coprop=country|type'
  + '&piprop=thumbnail&pithumbsize=1200&exintro=1&explaintext=1&exsentences=2&exlimit=max';

/** Wikipedia coordinate types that are places a traveller would search for. */
const WIKI_PLACE_TYPES: Record<string, string> = {
  country: 'Country', adm1st: 'Region', adm2nd: 'Region', adm3rd: 'Region',
  city: 'City', isle: 'Island', mountain: 'Mountain', forest: 'Nature',
  glacier: 'Nature', waterbody: 'Nature', landmark: 'Landmark',
};

const regionNames = typeof Intl !== 'undefined' && 'DisplayNames' in Intl
  ? new Intl.DisplayNames(['en'], { type: 'region' })
  : null;

const placeSearchCache = new Map<string, DestinationGuide[]>();

async function wikiPages(params: string, signal?: AbortSignal): Promise<WikiPage[]> {
  const res = await fetch(`${WIKI_API}&${params}`, { signal });
  if (!res.ok) return [];
  const pages = Object.values((await res.json())?.query?.pages ?? {}) as WikiPage[];
  return pages.sort((a, b) => (a.index ?? 99) - (b.index ?? 99));
}

async function geocode(query: string, signal?: AbortSignal): Promise<GeoPlace[]> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en`,
    { signal },
  );
  if (!res.ok) return [];
  const results = ((await res.json())?.results ?? []) as GeoPlace[];
  // Countries and towns with a known population – drops the many hamlets that share a famous name
  return results.filter((r) => r.feature_code === 'PCLI' || (r.population ?? 0) > 0);
}

function isNear(a: { lat: number; lng: number }, b: { lat: number; lng: number }, degrees = 1): boolean {
  return Math.abs(a.lat - b.lat) <= degrees && Math.abs(a.lng - b.lng) <= degrees;
}

/** A destination card built from live place data; trip details are generated when it is opened. */
function placeGuide(place: {
  name: string; country: string; placeType: string; lat: number; lng: number;
  description?: string; extract?: string; imageUrl?: string; region?: string;
}): DestinationGuide {
  const where = [place.region, place.country].filter((p) => p && p !== place.name).join(', ');
  return {
    id: `place-${slug(place.name)}-${slug(place.country || place.region || 'world')}`,
    name: place.name,
    country: place.country,
    tagline: place.description || (where ? `${place.placeType} in ${where}` : place.placeType),
    overview: place.extract || (where ? `${place.name} is a ${place.placeType.toLowerCase()} in ${where}.` : place.name),
    bestTimeToVisit: '',
    avgBudgetMin: 0,
    avgBudgetMax: 0,
    currency: '₹',
    howToReach: '',
    category: 'Trending',
    imageUrl: place.imageUrl ?? '',
    popularAreas: [],
    topExperiences: [],
    coordinates: { lat: place.lat, lng: place.lng },
    placeType: place.placeType,
    needsDetails: true,
  };
}

async function searchPlaces(query: string, signal?: AbortSignal): Promise<DestinationGuide[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const cacheKey = q.toLowerCase();
  const cached = placeSearchCache.get(cacheKey);
  if (cached) return cached;

  const [pages, geo] = await Promise.all([
    wikiPages(`generator=prefixsearch&gpssearch=${encodeURIComponent(q)}&gpslimit=10`, signal).catch(() => []),
    geocode(q, signal).catch(() => []),
  ]);
  if (signal?.aborted) return [];

  const guides: DestinationGuide[] = [];
  const usedGeo = new Set<GeoPlace>();

  // 1. Wikipedia articles that are places: they come with a photo, a description and a summary
  for (const page of pages) {
    const coord = page.coordinates?.[0];
    if (!coord) continue;
    if (coord.type && !WIKI_PLACE_TYPES[coord.type]) continue; // events, universities, stations…
    const point = { lat: coord.lat, lng: coord.lon };
    const name = page.title.replace(/\s*\(.*\)$/, '');
    const baseName = name.split(',')[0].trim().toLowerCase();
    // Untyped articles are only trusted as places when the geocoder knows a
    // place of the same name at the same spot (drops constituencies, stadiums…)
    const match = geo.find((g) =>
      isNear(point, { lat: g.latitude, lng: g.longitude })
      && (Boolean(coord.type) || g.name.toLowerCase() === baseName));
    if (match) usedGeo.add(match);
    if (!coord.type && !match) continue;

    const isCountry = coord.type === 'country';
    guides.push(placeGuide({
      name,
      country: isCountry ? name : ((coord.country && regionNames?.of(coord.country)) || match?.country || ''),
      placeType: coord.type ? WIKI_PLACE_TYPES[coord.type] : (match?.feature_code === 'PCLI' ? 'Country' : 'City'),
      lat: point.lat,
      lng: point.lng,
      description: page.description,
      extract: page.extract,
      imageUrl: page.thumbnail?.source,
      region: match?.admin1,
    }));
  }

  // 2. Towns the geocoder found that have no matching article above
  const rest = geo.filter((g) => !usedGeo.has(g)).slice(0, 6);
  if (rest.length > 0) {
    const titles = [...new Set(rest.map((g) => g.name))];
    const articles = await wikiPages(`titles=${encodeURIComponent(titles.join('|'))}`, signal).catch(() => []);
    if (signal?.aborted) return [];
    for (const g of rest) {
      const point = { lat: g.latitude, lng: g.longitude };
      // Only borrow an article's photo and text when it is about this very place
      const article = articles.find((p) => {
        const c = p.coordinates?.[0];
        return c && p.title.toLowerCase() === g.name.toLowerCase() && isNear(point, { lat: c.lat, lng: c.lon });
      });
      guides.push(placeGuide({
        name: g.name,
        country: g.country ?? '',
        placeType: g.feature_code === 'PCLI' ? 'Country' : 'City',
        lat: point.lat,
        lng: point.lng,
        description: article?.description,
        extract: article?.extract,
        imageUrl: article?.thumbnail?.source,
        region: g.admin1,
      }));
    }
  }

  const results = dedupe(guides).slice(0, 9);
  register(results);
  placeSearchCache.set(cacheKey, results);
  return results;
}

/** Budget, season, routes and experiences for a place found through live search. */
async function loadDetails(dest: DestinationGuide): Promise<DestinationGuide> {
  const place = dest.country && dest.country !== dest.name ? `${dest.name}, ${dest.country}` : dest.name;
  const prompt = `You are a travel intelligence engine for travellers based in India.
    Give trip-planning facts for ${place} (latitude ${dest.coordinates.lat}, longitude ${dest.coordinates.lng}):
    - bestTimeToVisit: the months, then a short reason in parentheses.
    - avgBudgetMin / avgBudgetMax: realistic total cost in Indian Rupees per person for a 5-day trip at current prices, including travel from India.
    - howToReach: nearest airport(s) with IATA codes and the usual route from India.
    - category: exactly one of ${CATEGORIES.join(', ')}.
    - popularAreas: 4 neighbourhoods or areas worth staying in or visiting.
    - topExperiences: 4 specific things to do.`;

  const text = await geminiRM.request({
    model: MODEL,
    contents: prompt,
    config: { responseMimeType: 'application/json', responseSchema: DETAILS_SCHEMA },
    cacheKey: `placeDetails::${dest.id}`,
  });

  const d = JSON.parse(text);
  const min = Math.round(Number(d.avgBudgetMin) || 0);
  const max = Math.round(Number(d.avgBudgetMax) || 0);
  const detailed: DestinationGuide = {
    ...dest,
    bestTimeToVisit: d.bestTimeToVisit ?? '',
    avgBudgetMin: Math.min(min, max),
    avgBudgetMax: Math.max(min, max),
    howToReach: d.howToReach ?? '',
    category: CATEGORIES.includes(d.category) ? d.category : dest.category,
    popularAreas: Array.isArray(d.popularAreas) ? d.popularAreas : [],
    topExperiences: Array.isArray(d.topExperiences) ? d.topExperiences : [],
    needsDetails: false,
  };
  register([detailed]);
  return detailed;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const liveDestinationService = {
  /**
   * Live destinations for a Discover category. Served from the 6-hour cache
   * unless `force` is set.
   */
  loadCategory(category: string, opts: { force?: boolean } = {}): Promise<LiveDestinationBatch> {
    if (!opts.force) {
      const cached = readCache()[category];
      if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return Promise.resolve(cached);
    }

    const pending = inflight.get(category);
    if (pending) return pending;

    const forced = CATEGORIES.includes(category as Category) ? (category as Category) : undefined;
    const promise = generate(
      categoryInstruction(category),
      BATCH_SIZE,
      CURATED_DESTINATIONS.map((d) => d.name),
      forced,
    )
      .then((destinations) => {
        const batch = { destinations: dedupe(destinations), fetchedAt: Date.now() };
        writeCache(category, batch);
        return batch;
      })
      .finally(() => inflight.delete(category));

    inflight.set(category, promise);
    return promise;
  },

  /** Fetch another page of destinations for a category and append it to the cache. */
  async loadMore(category: string, current: DestinationGuide[]): Promise<LiveDestinationBatch> {
    const forced = CATEGORIES.includes(category as Category) ? (category as Category) : undefined;
    const more = await generate(
      categoryInstruction(category),
      BATCH_SIZE,
      [...CURATED_DESTINATIONS, ...current].map((d) => d.name),
      forced,
    );
    const batch = {
      destinations: dedupe([...current, ...more]),
      fetchedAt: readCache()[category]?.fetchedAt ?? Date.now(),
    };
    writeCache(category, batch);
    return batch;
  },

  /**
   * Real-time search for any city, region or country. Keyless and instant, so it
   * is safe to call on every keystroke (pass a signal to drop stale requests).
   */
  searchPlaces,

  /** Generate the trip-planning details a live search result does not have yet. */
  loadDetails,

  getDestinationById(id: string): DestinationGuide | undefined {
    return registry.get(id);
  },

  /** Current weather for each destination, keyed by destination id. */
  async getWeather(
    destinations: Pick<DestinationGuide, 'id' | 'coordinates'>[],
  ): Promise<Record<string, LiveWeather>> {
    const result: Record<string, LiveWeather> = {};

    for (let i = 0; i < destinations.length; i += 50) {
      const chunk = destinations.slice(i, i + 50);
      try {
        const url = 'https://api.open-meteo.com/v1/forecast'
          + `?latitude=${chunk.map((d) => d.coordinates.lat).join(',')}`
          + `&longitude=${chunk.map((d) => d.coordinates.lng).join(',')}`
          + '&current=temperature_2m,weather_code';
        const res = await fetch(url);
        if (!res.ok) continue;
        const json = await res.json();
        // Open-Meteo returns a bare object for one location and an array for several.
        const rows = Array.isArray(json) ? json : [json];
        rows.forEach((row, idx) => {
          const current = row?.current;
          if (chunk[idx] && Number.isFinite(current?.temperature_2m)) {
            result[chunk[idx].id] = {
              temperature: Math.round(current.temperature_2m),
              condition: describeWeatherCode(current.weather_code),
            };
          }
        });
      } catch { /* weather is a nice-to-have – cards render without it */ }
    }

    return result;
  },
};

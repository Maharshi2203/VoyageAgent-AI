import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  Compass,
  Sparkles,
  Calendar,
  RefreshCw,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { DestinationGuide } from '../types';
import { CURATED_DESTINATIONS } from '../services/mockData';
import { liveDestinationService, LiveDestinationBatch, LiveWeather } from '../services/liveDestinationService';
import { friendlyErrorMessage } from '../services/geminiRequestManager';

interface DiscoverPageProps {
  onSelectDestination: (destId: string) => void;
  onPlanTripForDestination: (destName: string) => void;
}

const WEATHER_REFRESH_MS = 10 * 60 * 1000;
const SEARCH_DEBOUNCE_MS = 250;

const formatAgo = (timestamp: number): string => {
  const mins = Math.floor((Date.now() - timestamp) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)} h ago`;
};

const DestinationImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 via-space-secondary to-space-card flex items-center justify-center">
        <Compass size={48} className="text-typo-muted" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
    />
  );
};

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  onSelectDestination,
  onPlanTripForDestination
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Live data states
  const [liveByCategory, setLiveByCategory] = useState<Record<string, LiveDestinationBatch>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveSearch, setLiveSearch] = useState<{ query: string; results: DestinationGuide[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [weather, setWeather] = useState<Record<string, LiveWeather>>({});

  const categories = [
    'All',
    'Trending',
    'Beach',
    'Culture',
    'Mountains',
    'Food',
    'Luxury',
    'Adventure',
    'Budget',
    'Weekend escapes'
  ];

  const liveBatch = liveByCategory[selectedCategory];
  const trimmedQuery = searchQuery.trim();

  const loadLive = (category: string, force = false) => {
    setIsLoading(true);
    setLiveError(null);
    return liveDestinationService.loadCategory(category, { force })
      .then((batch) => setLiveByCategory((prev) => ({ ...prev, [category]: batch })));
  };

  // Load live destinations whenever a category is opened for the first time
  useEffect(() => {
    if (liveByCategory[selectedCategory]) return;

    let cancelled = false;
    loadLive(selectedCategory)
      .catch((err) => { if (!cancelled) setLiveError(friendlyErrorMessage(err)); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [selectedCategory]);

  const handleRefresh = () => {
    loadLive(selectedCategory, true)
      .catch((err) => setLiveError(friendlyErrorMessage(err)))
      .finally(() => setIsLoading(false));
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setLiveError(null);
    try {
      const batch = await liveDestinationService.loadMore(selectedCategory, liveBatch?.destinations ?? []);
      setLiveByCategory((prev) => ({ ...prev, [selectedCategory]: batch }));
    } catch (err) {
      setLiveError(friendlyErrorMessage(err));
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Real-time worldwide place search: runs as you type, stale requests are dropped
  useEffect(() => {
    if (trimmedQuery.length < 2) {
      setLiveSearch(null);
      setIsSearching(false);
      return;
    }

    const ctrl = new AbortController();
    setIsSearching(true);
    const timer = setTimeout(() => {
      liveDestinationService.searchPlaces(trimmedQuery, ctrl.signal)
        .then((results) => {
          if (!ctrl.signal.aborted) setLiveSearch({ query: trimmedQuery, results });
        })
        .catch(() => { /* aborted or offline – local matches still show */ })
        .finally(() => { if (!ctrl.signal.aborted) setIsSearching(false); });
    }, SEARCH_DEBOUNCE_MS);

    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [trimmedQuery]);

  const matchesSearch = (dest: DestinationGuide) =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.overview.toLowerCase().includes(searchQuery.toLowerCase());

  const filteredDestinations = useMemo(() => {
    const curated = CURATED_DESTINATIONS.filter((dest) =>
      matchesSearch(dest) && (
        selectedCategory === 'All' ||
        dest.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    );
    const live = (liveBatch?.destinations ?? []).filter(matchesSearch);
    // Worldwide search results belong to the query they were fetched for
    const searched = liveSearch && liveSearch.query === trimmedQuery ? liveSearch.results : [];

    // Full guides first; a searched place already covered by one of them is not repeated
    const seen = new Set<string>();
    return [...curated, ...live, ...searched].filter((d) => {
      const place = `${d.name}|${d.country}`.toLowerCase();
      if (seen.has(d.id) || seen.has(place)) return false;
      seen.add(d.id);
      seen.add(place);
      return true;
    });
  }, [searchQuery, selectedCategory, liveBatch, liveSearch]);

  // Live weather for every destination on this tab, refreshed every 10 minutes
  const weatherTargets = useMemo(
    () => [...CURATED_DESTINATIONS, ...(liveBatch?.destinations ?? []), ...(liveSearch?.results ?? [])],
    [liveBatch, liveSearch]
  );

  useEffect(() => {
    let cancelled = false;
    const refreshWeather = () => {
      liveDestinationService.getWeather(weatherTargets).then((data) => {
        if (!cancelled) setWeather((prev) => ({ ...prev, ...data }));
      });
    };

    refreshWeather();
    const timer = setInterval(refreshWeather, WEATHER_REFRESH_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, [weatherTargets]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-in fade-in duration-300">

      {/* Header Banner */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-brand-glow text-xs font-black uppercase tracking-[0.3em]">
          <Compass size={16} /> Destination Intelligence
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-typo-primary tracking-tight leading-none">
          Discover Places Worth Exploring.
        </h1>
        <p className="text-base sm:text-lg text-typo-secondary font-medium">
          Comprehensive guides with real budget estimates, optimal visiting windows, and direct AI-assisted itinerary synthesis.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="space-y-6">
        <div className="relative max-w-2xl">
          <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-typo-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any city or country in the world..."
            className="w-full bg-space-card border-2 border-space-border focus:border-brand-primary rounded-2xl py-5 pl-16 pr-14 text-sm font-semibold text-typo-primary placeholder:text-typo-muted shadow-lg outline-none transition-all"
          />
          {isSearching && (
            <RefreshCw size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-brand-primary animate-spin" />
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                selectedCategory === cat
                  ? 'bg-brand-primary text-space-main border-transparent shadow-md shadow-brand-primary/20 scale-105'
                  : 'bg-space-card border-space-border text-typo-secondary hover:text-typo-primary hover:border-space-border/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Live Status Bar */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-typo-secondary">
          <span className="inline-flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLoading || isSearching ? 'bg-yellow-400' : 'bg-brand-glow'} animate-pulse`} />
            {isSearching
              ? `Searching the world for "${trimmedQuery}"…`
              : trimmedQuery.length >= 2
                ? `${filteredDestinations.length} places match "${trimmedQuery}"`
              : isLoading
              ? 'Fetching live destinations…'
              : liveBatch
                ? `Live · ${filteredDestinations.length} destinations · updated ${formatAgo(liveBatch.fetchedAt)}`
                : `${filteredDestinations.length} destinations`}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-brand-primary hover:text-brand-glow transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {liveError && (
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-space-card border border-space-border text-xs font-semibold text-typo-secondary">
            <AlertTriangle size={16} className="text-yellow-400 shrink-0 mt-0.5" />
            <span>Couldn't load live destinations. {liveError}</span>
          </div>
        )}
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length === 0 && !isLoading && !isSearching ? (
        <div className="bg-space-card rounded-3xl p-16 text-center border border-space-border space-y-4">
          <Compass size={48} className="mx-auto text-typo-muted" />
          <h3 className="text-xl font-bold text-typo-primary">No destinations found</h3>
          <p className="text-sm text-typo-secondary">
            {trimmedQuery.length >= 2
              ? `No city or country matches "${trimmedQuery}". Check the spelling or try a nearby place.`
              : 'Try searching for "Goa", "Japan", "Bali", or "Switzerland".'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="px-6 py-2.5 rounded-xl bg-space-secondary text-xs font-bold text-typo-primary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDestinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-space-card rounded-[2rem] overflow-hidden border border-space-border hover:border-brand-primary/60 shadow-xl group transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5"
            >
              <div
                className="relative h-64 overflow-hidden cursor-pointer"
                onClick={() => onSelectDestination(dest.id)}
              >
                <DestinationImage src={dest.imageUrl} alt={dest.name} />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-space-card/90 backdrop-blur-md border border-space-border text-[10px] font-black uppercase tracking-wider text-typo-primary">
                  {dest.placeType ?? dest.category}
                </div>
                {weather[dest.id] && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-xl bg-space-card/90 backdrop-blur-md border border-space-border text-[10px] font-black uppercase tracking-wider text-typo-primary flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-glow animate-pulse" />
                    {weather[dest.id].temperature}°C · {weather[dest.id].condition}
                  </div>
                )}
                {dest.avgBudgetMax > 0 && (
                  <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-xl bg-space-main/90 backdrop-blur-md border border-space-border text-xs font-black text-brand-glow shadow-md">
                    ₹{(dest.avgBudgetMin / 1000).toFixed(0)}K – ₹{(dest.avgBudgetMax / 1000).toFixed(0)}K
                  </div>
                )}
              </div>

              <div className="p-7 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <h3
                      onClick={() => onSelectDestination(dest.id)}
                      className="text-2xl font-black text-typo-primary tracking-tight hover:text-brand-glow transition-colors cursor-pointer"
                    >
                      {dest.name}
                    </h3>
                    <span className="text-xs font-bold text-typo-secondary text-right">{dest.country}</span>
                  </div>
                  <p className="text-xs font-medium text-typo-secondary leading-relaxed line-clamp-2">
                    "{dest.tagline}"
                  </p>
                </div>

                {/* Meta details */}
                {dest.needsDetails ? (
                  <p className="py-3 border-y border-space-border/60 text-xs font-medium text-typo-muted leading-relaxed line-clamp-3">
                    {dest.overview}
                  </p>
                ) : (
                  <div className="space-y-2 py-3 border-y border-space-border/60 text-xs">
                    <div className="flex items-center gap-2 text-typo-muted">
                      <Calendar size={14} className="text-brand-primary shrink-0" />
                      <span className="truncate font-semibold">Best: {dest.bestTimeToVisit.split('(')[0]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-typo-muted">
                      <MapPin size={14} className="text-brand-primary shrink-0" />
                      <span className="truncate font-semibold">{dest.popularAreas.slice(0, 3).join(', ')}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => onSelectDestination(dest.id)}
                    className="flex-1 py-3 rounded-xl bg-space-secondary hover:bg-space-border text-typo-primary font-bold text-xs uppercase tracking-wider transition-colors text-center"
                  >
                    View Guide
                  </button>
                  <button
                    onClick={() => onPlanTripForDestination(dest.name)}
                    className="p-3 rounded-xl bg-brand-primary/10 hover:bg-brand-primary text-brand-primary hover:text-space-main border border-brand-primary/20 transition-all"
                    title={`Plan trip to ${dest.name} with AI`}
                  >
                    <Sparkles size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Skeleton cards while live destinations stream in */}
          {(isLoading || isLoadingMore) && [0, 1, 2].map((i) => (
            <div
              key={`skeleton-${i}`}
              className="bg-space-card rounded-[2rem] overflow-hidden border border-space-border shadow-xl animate-pulse"
            >
              <div className="h-64 bg-space-secondary" />
              <div className="p-7 space-y-4">
                <div className="h-6 w-2/3 rounded-lg bg-space-secondary" />
                <div className="h-3 w-full rounded bg-space-secondary" />
                <div className="h-3 w-5/6 rounded bg-space-secondary" />
                <div className="h-10 w-full rounded-xl bg-space-secondary" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {liveBatch && !isLoading && !trimmedQuery && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-8 py-4 rounded-2xl bg-space-card hover:bg-space-secondary border border-space-border text-typo-primary font-black text-xs uppercase tracking-widest flex items-center gap-2.5 shadow-lg transition-all disabled:opacity-60"
          >
            <Plus size={16} />
            {isLoadingMore ? 'Finding more places…' : 'Load more destinations'}
          </button>
        </div>
      )}

    </div>
  );
};

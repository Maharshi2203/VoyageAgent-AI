import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Wallet, 
  Plane, 
  Bed, 
  Utensils, 
  Star, 
  CheckCircle,
  Compass
} from 'lucide-react';
import { DestinationGuide } from '../types';
import { CURATED_ACCOMMODATIONS } from '../services/mockData';
import { liveDestinationService, LiveWeather } from '../services/liveDestinationService';

interface DestinationDetailPageProps {
  destination: DestinationGuide;
  onBack: () => void;
  onPlanTrip: (destinationName: string) => void;
}

export const DestinationDetailPage: React.FC<DestinationDetailPageProps> = ({
  destination: initialDestination,
  onBack,
  onPlanTrip
}) => {
  // Places found through live search arrive without trip details; they are generated here.
  const [destination, setDestination] = useState(initialDestination);
  const [detailsFailed, setDetailsFailed] = useState(false);
  const isLoadingDetails = Boolean(destination.needsDetails) && !detailsFailed;
  const pendingText = isLoadingDetails ? 'Generating…' : 'Not available right now';

  useEffect(() => {
    let cancelled = false;
    setDestination(initialDestination);
    setDetailsFailed(false);
    if (initialDestination.needsDetails) {
      liveDestinationService.loadDetails(initialDestination)
        .then((detailed) => { if (!cancelled) setDestination(detailed); })
        .catch(() => { if (!cancelled) setDetailsFailed(true); });
    }
    return () => { cancelled = true; };
  }, [initialDestination.id]);

  const accommodations = CURATED_ACCOMMODATIONS[destination.id] || [];
  const [weather, setWeather] = useState<LiveWeather | null>(null);

  useEffect(() => {
    let cancelled = false;
    setWeather(null);
    liveDestinationService.getWeather([destination]).then((data) => {
      if (!cancelled) setWeather(data[destination.id] ?? null);
    });
    return () => { cancelled = true; };
  }, [destination.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 animate-in fade-in duration-300">
      
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-space-card border border-space-border text-xs font-bold text-typo-secondary hover:text-typo-primary transition-colors"
      >
        <ArrowLeft size={16} /> Back to Discover
      </button>

      {/* Hero Showcase */}
      <div className="relative rounded-[3rem] overflow-hidden border border-space-border shadow-2xl h-[480px]">
        {destination.imageUrl ? (
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 via-space-secondary to-space-card" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-space-main via-space-main/50 to-transparent"></div>

        <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3.5 py-1.5 rounded-xl bg-brand-primary text-space-main text-[11px] font-black uppercase tracking-widest shadow-md">
                {destination.placeType ?? `${destination.category} Destination`}
              </span>
              {weather && (
                <span className="px-3.5 py-1.5 rounded-xl bg-space-card/90 backdrop-blur-md border border-space-border text-typo-primary text-[11px] font-black uppercase tracking-widest shadow-md flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-glow animate-pulse" />
                  Now {weather.temperature}°C · {weather.condition}
                </span>
              )}
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-typo-primary tracking-tight leading-none">
              {destination.name}{destination.country && destination.country !== destination.name && (
                <>, <span className="text-brand-glow">{destination.country}</span></>
              )}
            </h1>
            <p className="text-base sm:text-lg font-medium text-typo-secondary">
              {destination.tagline}
            </p>
          </div>

          <button
            onClick={() => onPlanTrip(destination.name)}
            className="px-8 py-4 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all transform active:scale-95 shrink-0"
          >
            <Sparkles size={18} />
            <span>Plan My {destination.name} Trip</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-space-card p-6 rounded-3xl border border-space-border space-y-1 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted flex items-center gap-1.5">
            <Calendar size={13} className="text-brand-primary" /> Best Season
          </span>
          <p className="text-sm font-extrabold text-typo-primary leading-snug">{destination.bestTimeToVisit || pendingText}</p>
        </div>
        <div className="bg-space-card p-6 rounded-3xl border border-space-border space-y-1 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted flex items-center gap-1.5">
            <Wallet size={13} className="text-brand-primary" /> Estimated Budget
          </span>
          <p className="text-sm font-extrabold text-brand-primary leading-snug">
            {destination.avgBudgetMax > 0
              ? `₹${destination.avgBudgetMin.toLocaleString()} – ₹${destination.avgBudgetMax.toLocaleString()}`
              : pendingText}
          </p>
        </div>
        <div className="bg-space-card p-6 rounded-3xl border border-space-border space-y-1 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted flex items-center gap-1.5">
            <Plane size={13} className="text-brand-primary" /> How to Reach
          </span>
          <p className="text-xs font-semibold text-typo-secondary leading-snug line-clamp-2">{destination.howToReach || pendingText}</p>
        </div>
        <div className="bg-space-card p-6 rounded-3xl border border-space-border space-y-1 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted flex items-center gap-1.5">
            <MapPin size={13} className="text-brand-primary" /> Geo Coordinates
          </span>
          <p className="text-xs font-semibold text-typo-secondary leading-snug">
            {destination.coordinates.lat.toFixed(4)}°N, {destination.coordinates.lng.toFixed(4)}°E
          </p>
        </div>
      </div>

      {/* Main Grid: Overview & Top Experiences */}
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-10">
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-typo-primary tracking-tight">Overview & Essence</h2>
            <p className="text-base text-typo-secondary font-medium leading-relaxed">
              {destination.overview}
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-typo-primary tracking-tight">Prime Districts & Sectors</h2>
            <div className="flex flex-wrap gap-2.5">
              {destination.popularAreas.length === 0 && (
                <span className="text-xs font-semibold text-typo-muted">{pendingText}</span>
              )}
              {destination.popularAreas.map((area, idx) => (
                <span 
                  key={idx}
                  className="px-4 py-2 rounded-xl bg-space-secondary border border-space-border text-xs font-bold text-typo-primary"
                >
                  📍 {area}
                </span>
              ))}
            </div>
          </section>

          {/* Stays & Accommodation Preview */}
          {accommodations.length > 0 && (
            <section className="space-y-6 pt-6 border-t border-space-border">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-typo-primary tracking-tight flex items-center gap-2">
                  <Bed size={22} className="text-brand-primary" /> Curated Stays
                </h2>
                <span className="text-xs font-bold text-typo-muted">{accommodations.length} recommendations</span>
              </div>

              <div className="space-y-4">
                {accommodations.map((acc) => (
                  <div 
                    key={acc.id}
                    className="p-5 bg-space-card rounded-2xl border border-space-border flex flex-col sm:flex-row gap-5 items-center hover:border-brand-primary/50 transition-all shadow-md"
                  >
                    <img 
                      src={acc.imageUrl} 
                      alt={acc.name} 
                      className="w-full sm:w-32 h-28 rounded-xl object-cover"
                    />
                    <div className="space-y-2 flex-1 w-full">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary">
                          {acc.type}
                        </span>
                        <span className="text-xs font-bold text-typo-primary flex items-center gap-1">
                          <Star size={13} className="text-yellow-400 fill-yellow-400" /> {acc.rating} ({acc.reviewsCount})
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-typo-primary leading-tight">{acc.name}</h4>
                      <p className="text-xs text-typo-secondary">{acc.location}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-black text-brand-glow">
                          ₹{acc.pricePerNight.toLocaleString()}<span className="text-[10px] text-typo-muted font-normal"> / night</span>
                        </span>
                        <span className="text-[10px] font-bold text-typo-muted">{acc.cancellation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Top Experiences & Planner Trigger */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-space-card rounded-3xl p-8 border border-space-border shadow-xl space-y-6">
            <h3 className="text-lg font-black text-typo-primary tracking-tight flex items-center gap-2">
              <Compass size={20} className="text-brand-glow" /> Unmissable Experiences
            </h3>
            <div className="space-y-4">
              {destination.topExperiences.length === 0 && (
                <p className="text-xs font-semibold text-typo-muted">{pendingText}</p>
              )}
              {destination.topExperiences.map((exp, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-brand-primary shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-typo-primary leading-snug">{exp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Banner Box */}
          <div className="bg-gradient-to-br from-brand-primary/10 via-space-card to-space-secondary border-2 border-brand-primary/30 rounded-3xl p-8 shadow-2xl space-y-5 text-center">
            <Sparkles size={32} className="mx-auto text-brand-glow" />
            <h3 className="text-2xl font-black text-typo-primary tracking-tight">
              Ready to visit {destination.name}?
            </h3>
            <p className="text-xs font-medium text-typo-secondary">
              Let the Autonomous Travel Architect generate a custom day-by-day itinerary tailored to your exact budget and travel style.
            </p>
            <button
              onClick={() => onPlanTrip(destination.name)}
              className="w-full py-4 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-xs uppercase tracking-widest shadow-xl transition-all"
            >
              Generate Itinerary with AI
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

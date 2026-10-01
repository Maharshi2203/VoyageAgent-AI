import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  ArrowRight, 
  Compass, 
  Sparkles,
  Calendar,
  Wallet
} from 'lucide-react';
import { DestinationGuide } from '../types';
import { CURATED_DESTINATIONS } from '../services/mockData';

interface DiscoverPageProps {
  onSelectDestination: (destId: string) => void;
  onPlanTripForDestination: (destName: string) => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({
  onSelectDestination,
  onPlanTripForDestination
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

  const filteredDestinations = CURATED_DESTINATIONS.filter((dest) => {
    const matchesSearch = 
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.overview.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'All' || 
      dest.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

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
            placeholder="Search destinations by city, country, or vibe..."
            className="w-full bg-space-card border-2 border-space-border focus:border-brand-primary rounded-2xl py-5 pl-16 pr-6 text-sm font-semibold text-typo-primary placeholder:text-typo-muted shadow-lg outline-none transition-all"
          />
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
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length === 0 ? (
        <div className="bg-space-card rounded-3xl p-16 text-center border border-space-border space-y-4">
          <Compass size={48} className="mx-auto text-typo-muted" />
          <h3 className="text-xl font-bold text-typo-primary">No destinations found</h3>
          <p className="text-sm text-typo-secondary">Try searching for "Goa", "Japan", "Bali", or "Switzerland".</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            className="px-6 py-2.5 rounded-xl bg-space-secondary text-xs font-bold text-typo-primary"
          >
            Clear Filters
          </button>
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
                <img 
                  src={dest.imageUrl} 
                  alt={dest.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-space-card/90 backdrop-blur-md border border-space-border text-[10px] font-black uppercase tracking-wider text-typo-primary">
                  {dest.category}
                </div>
                <div className="absolute bottom-4 right-4 px-3.5 py-1.5 rounded-xl bg-space-main/90 backdrop-blur-md border border-space-border text-xs font-black text-brand-glow shadow-md">
                  ₹{(dest.avgBudgetMin / 1000).toFixed(0)}K – ₹{(dest.avgBudgetMax / 1000).toFixed(0)}K
                </div>
              </div>

              <div className="p-7 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 
                      onClick={() => onSelectDestination(dest.id)}
                      className="text-2xl font-black text-typo-primary tracking-tight hover:text-brand-glow transition-colors cursor-pointer"
                    >
                      {dest.name}
                    </h3>
                    <span className="text-xs font-bold text-typo-secondary">{dest.country}</span>
                  </div>
                  <p className="text-xs font-medium text-typo-secondary leading-relaxed line-clamp-2">
                    "{dest.tagline}"
                  </p>
                </div>

                {/* Meta details */}
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
        </div>
      )}

    </div>
  );
};

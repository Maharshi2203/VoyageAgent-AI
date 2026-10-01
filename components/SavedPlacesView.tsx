import React, { useState } from 'react';
import { 
  Bookmark, 
  MapPin, 
  Star, 
  Trash2, 
  Compass, 
  Filter, 
  Plus, 
  ExternalLink 
} from 'lucide-react';
import { SavedPlace } from '../types';

interface SavedPlacesViewProps {
  savedPlaces: SavedPlace[];
  onToggleSavedPlace: (place: SavedPlace) => void;
  onNavigateToMap: () => void;
}

export const SavedPlacesView: React.FC<SavedPlacesViewProps> = ({
  savedPlaces,
  onToggleSavedPlace,
  onNavigateToMap
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const categories = ['all', 'Hotel', 'Restaurant', 'Activity', 'Attraction', 'Viewpoint'];
  const statuses = [
    { id: 'all', label: 'All Statuses' },
    { id: 'want_to_visit', label: 'Want to Visit' },
    { id: 'loved_it', label: 'Loved It' },
    { id: 'recommend', label: 'Recommend' }
  ];

  const filteredPlaces = savedPlaces.filter((place) => {
    const matchesCat = filterCategory === 'all' || place.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesStatus = filterStatus === 'all' || place.status === filterStatus;
    return matchesCat && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-space-border/60">
        <div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-glow">Personal Travel Stash</span>
          <h1 className="text-4xl font-black text-typo-primary tracking-tight mt-1">Saved Places</h1>
          <p className="text-sm font-medium text-typo-secondary mt-1">
            Spots you want to explore, beloved cafes, and gems recommended by friends.
          </p>
        </div>

        <button
          onClick={onNavigateToMap}
          className="px-6 py-3.5 rounded-2xl bg-space-card border-2 border-space-border hover:border-brand-primary text-typo-primary font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
        >
          <Compass size={16} className="text-brand-glow" />
          <span>View on Personal Map</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                filterCategory === cat
                  ? 'bg-brand-primary text-space-main border-transparent shadow-md'
                  : 'bg-space-card border-space-border text-typo-secondary hover:text-typo-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {statuses.map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                filterStatus === st.id
                  ? 'bg-space-secondary text-brand-glow border-brand-glow/40'
                  : 'text-typo-muted border-transparent hover:text-typo-secondary'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredPlaces.length === 0 ? (
        <div className="bg-space-card rounded-3xl p-16 text-center border-2 border-dashed border-space-border space-y-4">
          <Bookmark size={48} className="mx-auto text-typo-muted" />
          <h3 className="text-xl font-bold text-typo-primary">No saved places in this category</h3>
          <p className="text-sm text-typo-secondary">Bookmark spots from destination guides to see them pinned here.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="bg-space-card rounded-3xl p-6 border border-space-border hover:border-brand-primary/50 shadow-xl transition-all duration-300 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {place.imageUrl && (
                  <div className="h-44 rounded-2xl overflow-hidden relative">
                    <img 
                      src={place.imageUrl} 
                      alt={place.name} 
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-space-main/90 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-typo-primary border border-space-border">
                      {place.category}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-brand-primary text-space-main text-[10px] font-black uppercase tracking-wider">
                      {place.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}

                <div>
                  <h4 className="text-xl font-black text-typo-primary tracking-tight leading-tight">{place.name}</h4>
                  <p className="text-xs font-semibold text-typo-secondary flex items-center gap-1.5 mt-1">
                    <MapPin size={13} className="text-brand-glow" /> {place.destination}
                  </p>
                </div>

                {place.notes && (
                  <p className="text-xs text-typo-secondary font-medium leading-relaxed bg-space-secondary/60 p-3 rounded-xl border border-space-border/50 italic">
                    "{place.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-space-border flex items-center justify-between">
                <button
                  onClick={() => {
                    const query = encodeURIComponent(`${place.name} ${place.destination}`);
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                  }}
                  className="text-xs font-bold text-brand-primary hover:text-brand-glow flex items-center gap-1 transition-colors"
                >
                  <span>Google Maps</span>
                  <ExternalLink size={12} />
                </button>

                <button
                  onClick={() => onToggleSavedPlace(place)}
                  className="p-2 rounded-xl text-typo-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

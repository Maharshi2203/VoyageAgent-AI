import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Globe, Compass, CheckCircle2, Bookmark, Heart } from 'lucide-react';
import { SavedPlace, Trip } from '../types';
import { FitBounds } from './MapView';

interface PersonalTravelMapViewProps {
  trips: Trip[];
  savedPlaces: SavedPlace[];
  onOpenTrip: (tripId: string) => void;
}

export const PersonalTravelMapView: React.FC<PersonalTravelMapViewProps> = ({
  trips,
  savedPlaces,
  onOpenTrip
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'trips' | 'saved'>('all');

  // Markers from trips
  const tripMarkers = trips
    .filter(t => t.destinationCoords && t.destinationCoords.lat && t.destinationCoords.lng)
    .map(t => ({
      id: t.id,
      title: t.title,
      subtitle: t.destination,
      type: 'trip' as const,
      coords: [t.destinationCoords!.lat, t.destinationCoords!.lng] as [number, number],
      badge: `${t.duration} Days`,
      tripId: t.id
    }));

  // Markers from saved places
  const savedMarkers = savedPlaces
    .filter(p => p.coordinates && p.coordinates.lat && p.coordinates.lng)
    .map(p => ({
      id: p.id,
      title: p.name,
      subtitle: p.destination,
      type: 'saved' as const,
      coords: [p.coordinates!.lat, p.coordinates!.lng] as [number, number],
      badge: p.category,
      tripId: undefined
    }));

  const allMarkers = [
    ...(activeFilter === 'saved' ? [] : tripMarkers),
    ...(activeFilter === 'trips' ? [] : savedMarkers)
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-space-border/60">
        <div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-glow">Your Global Footprint</span>
          <h1 className="text-4xl font-black text-typo-primary tracking-tight mt-1">Personal Travel Map</h1>
          <p className="text-sm font-medium text-typo-secondary mt-1">
            Visual log of your expedition roadmaps, bucket list pins, and saved sanctuaries across the world.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2 bg-space-secondary p-1.5 rounded-2xl border border-space-border">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-space-card text-brand-primary shadow-sm border border-space-border'
                : 'text-typo-secondary hover:text-typo-primary'
            }`}
          >
            All Pins ({tripMarkers.length + savedMarkers.length})
          </button>
          <button
            onClick={() => setActiveFilter('trips')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'trips'
                ? 'bg-space-card text-brand-primary shadow-sm border border-space-border'
                : 'text-typo-secondary hover:text-typo-primary'
            }`}
          >
            Expeditions ({tripMarkers.length})
          </button>
          <button
            onClick={() => setActiveFilter('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'saved'
                ? 'bg-space-card text-brand-primary shadow-sm border border-space-border'
                : 'text-typo-secondary hover:text-typo-primary'
            }`}
          >
            Saved Gems ({savedMarkers.length})
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="h-[550px] w-full rounded-[3rem] overflow-hidden border-2 border-space-border shadow-2xl relative z-0">
        <MapContainer
          {...({
            center: [22.0, 78.0],
            zoom: 3,
            scrollWheelZoom: true,
            className: "h-full w-full"
          } as any)}
        >
          <TileLayer
            {...({
              attribution: '&copy; OpenStreetMap contributors',
              url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            } as any)}
          />

          <FitBounds points={allMarkers.map(m => m.coords)} fallback={[22.0, 78.0]} />

          {allMarkers.map((marker) => (
            <Marker key={marker.id} position={marker.coords}>
              <Popup>
                <div className="p-3 max-w-[200px] space-y-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    marker.type === 'trip' 
                      ? 'bg-brand-primary text-space-main' 
                      : 'bg-space-secondary text-brand-glow border border-space-border'
                  }`}>
                    {marker.badge}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-typo-primary leading-tight">{marker.title}</h4>
                    <p className="text-xs text-typo-secondary">{marker.subtitle}</p>
                  </div>
                  {marker.tripId && (
                    <button
                      onClick={() => onOpenTrip(marker.tripId!)}
                      className="w-full mt-2 py-1.5 rounded-lg bg-brand-primary text-space-main text-[11px] font-bold text-center"
                    >
                      Open Trip Workspace
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Stat Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-space-card p-6 rounded-3xl border border-space-border space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted flex items-center gap-1.5">
            <Globe size={13} className="text-brand-glow" /> Total Expeditions
          </span>
          <p className="text-2xl font-black text-typo-primary">{trips.length}</p>
        </div>
        <div className="bg-space-card p-6 rounded-3xl border border-space-border space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted flex items-center gap-1.5">
            <Bookmark size={13} className="text-brand-glow" /> Saved Sanctuaries
          </span>
          <p className="text-2xl font-black text-brand-primary">{savedPlaces.length}</p>
        </div>
        <div className="bg-space-card p-6 rounded-3xl border border-space-border space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted flex items-center gap-1.5">
            <Compass size={13} className="text-brand-glow" /> Map Waypoints
          </span>
          <p className="text-2xl font-black text-typo-primary">{allMarkers.length}</p>
        </div>
        <div className="bg-space-card p-6 rounded-3xl border border-space-border space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-brand-glow" /> Active Network
          </span>
          <p className="text-2xl font-black text-brand-glow">Synchronized</p>
        </div>
      </div>

    </div>
  );
};

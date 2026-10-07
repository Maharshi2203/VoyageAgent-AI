import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Layers, 
  ArrowRight,
  Filter,
  Navigation
} from 'lucide-react';
import { Trip, Activity } from '../../types';
import { MapView } from '../MapView';
import { formatLeg } from '../../services/liveMapService';
import { useLiveTripMap, dayColor } from '../../services/useLiveTripMap';

interface TripMapTabProps {
  trip: Trip;
  onSelectActivity: (activity: Activity) => void;
}

export const TripMapTab: React.FC<TripMapTabProps> = ({
  trip,
  onSelectActivity
}) => {
  const [selectedDay, setSelectedDay] = useState<number | undefined>(undefined);

  // Real stop positions and road routes, shared by the map and the list below
  const liveMap = useLiveTripMap(trip.itinerary, selectedDay);
  const { stops, routes, status } = liveMap;

  const allLegs = routes.flatMap(r => r.legs);
  const totalLeg = {
    distanceKm: allLegs.reduce((sum, l) => sum + l.distanceKm, 0),
    durationMin: allLegs.reduce((sum, l) => sum + l.durationMin, 0)
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-space-card p-4 rounded-2xl border border-space-border shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          <button
            onClick={() => setSelectedDay(undefined)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
              selectedDay === undefined
                ? 'bg-brand-primary text-space-main border-transparent shadow-md'
                : 'bg-space-secondary border-space-border text-typo-secondary hover:text-typo-primary'
            }`}
          >
            All Route Waypoints ({trip.itinerary.days.flatMap(d => d.activities).length})
          </button>

          {trip.itinerary.days.map((day) => (
            <button
              key={day.day}
              onClick={() => setSelectedDay(day.day)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                selectedDay === day.day
                  ? 'bg-brand-primary text-space-main border-transparent shadow-md'
                  : 'bg-space-secondary border-space-border text-typo-secondary hover:text-typo-primary'
              }`}
            >
              Day {day.day}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-typo-muted flex items-center gap-1.5 self-end sm:self-auto whitespace-nowrap">
          <span className={`w-2 h-2 rounded-full ${status === 'loading' ? 'bg-yellow-400' : status === 'live' ? 'bg-brand-glow' : 'bg-red-400'} animate-pulse`} />
          {status === 'loading' && 'Loading live roads…'}
          {status === 'offline' && 'Road routing unavailable – straight lines shown'}
          {status === 'live' && (allLegs.length > 0 ? `Live route · ${formatLeg(totalLeg)}` : 'Live map')}
        </span>
      </div>

      {/* Main Grid: Interactive Map + Waypoint Stepper List */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Map Container */}
        <div className="lg:col-span-8">
          <MapView 
            itinerary={trip.itinerary} 
            selectedDay={selectedDay}
            heightClass="h-[600px]"
            onSelectActivity={onSelectActivity}
            showRoute={true}
            liveMap={liveMap}
          />
        </div>

        {/* Waypoint Sequence List */}
        <div className="lg:col-span-4 bg-space-card rounded-[2.5rem] p-6 sm:p-8 border border-space-border shadow-xl space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between pb-3 border-b border-space-border">
            <h4 className="font-extrabold text-sm text-typo-primary uppercase tracking-wider flex items-center gap-2">
              <Compass size={16} className="text-brand-glow" /> Transit Sequence
            </h4>
            <span className="text-[11px] font-bold text-brand-primary">{stops.length} Stops</span>
          </div>

          <div className="space-y-4 relative">
            {stops.length === 0 ? (
              <p className="text-xs text-typo-muted text-center py-8">No geo-tagged stops found for this selection.</p>
            ) : (
              stops.map((stop, idx) => {
                const act = stop.activity;
                const next = stops[idx + 1];
                const leg = next?.day === stop.day
                  ? routes.find(r => r.day === stop.day)?.legs[stop.order - 1]
                  : undefined;

                return (
                  <div
                    key={`${act.id}-${stop.day}-${stop.order}`}
                    onClick={() => onSelectActivity(act)}
                    className="p-4 bg-space-secondary/60 hover:bg-space-secondary rounded-2xl border border-space-border/60 hover:border-brand-primary/50 cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: dayColor(stop.day) }} />
                        Day {stop.day} · Stop {stop.order} • {act.timeSlot}
                      </span>
                      <span className="text-xs font-bold text-typo-primary">
                        {act.cost === 0 ? 'Free' : `₹${act.cost.toLocaleString()}`}
                      </span>
                    </div>

                    <h5 className="font-bold text-sm text-typo-primary group-hover:text-brand-glow transition-colors leading-tight">
                      {act.name}
                    </h5>

                    <p className="text-[11px] text-typo-secondary flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-brand-glow shrink-0" /> {act.location}
                    </p>

                    {leg && (
                      <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-brand-glow/80">
                        <span>↓ {formatLeg(leg)}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

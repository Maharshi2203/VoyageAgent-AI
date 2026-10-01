import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Wallet, 
  Bed, 
  Plane, 
  Compass, 
  Users, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  FileText, 
  Share2, 
  Download,
  Luggage,
  CheckCircle2
} from 'lucide-react';
import { Trip, Activity } from '../../types';
import { MapView } from '../MapView';

interface TripOverviewTabProps {
  trip: Trip;
  onNavigateTab: (tab: string) => void;
  onSelectActivity: (activity: Activity) => void;
  onOpenReel: () => void;
  onExportManifest: () => void;
}

export const TripOverviewTab: React.FC<TripOverviewTabProps> = ({
  trip,
  onNavigateTab,
  onSelectActivity,
  onOpenReel,
  onExportManifest
}) => {
  const allActivities = trip.itinerary.days.flatMap(d => d.activities);
  const nextActivity = allActivities[0] || null;
  const packedCount = trip.packingList.filter(p => p.isPacked).length;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Hero Overview Card */}
      <div className="relative bg-space-card rounded-[3rem] p-8 sm:p-12 border border-space-border shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-glow/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-brand-glow text-xs font-black uppercase tracking-[0.3em]">
              <Sparkles size={16} /> Verified Active Workspace
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-typo-primary tracking-tight leading-none">
              {trip.title}
            </h1>
            <p className="text-sm font-semibold text-typo-secondary flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5"><MapPin size={15} className="text-brand-glow" /> {trip.destination}</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Calendar size={15} className="text-brand-glow" /> {trip.startDate} to {trip.endDate}</span>
              <span>•</span>
              <span>{trip.travelers} Travelers</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenReel}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-glow text-space-main font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
            >
              <span>Watch Trip Reel</span>
            </button>
            <button
              onClick={onExportManifest}
              className="px-5 py-3 rounded-2xl bg-space-secondary hover:bg-space-card border border-space-border text-typo-primary font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <Download size={15} />
              <span>Export Manifest</span>
            </button>
          </div>
        </div>

        {/* 6 Key Overview Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-10 pt-8 border-t border-space-border/60">
          <div 
            onClick={() => onNavigateTab('itinerary')}
            className="bg-space-secondary/60 hover:bg-space-secondary p-4 rounded-2xl border border-space-border/50 cursor-pointer transition-all space-y-1"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted block">Duration</span>
            <span className="text-2xl font-black text-typo-primary">{trip.duration} <span className="text-xs text-typo-muted">Days</span></span>
          </div>

          <div 
            onClick={() => onNavigateTab('itinerary')}
            className="bg-space-secondary/60 hover:bg-space-secondary p-4 rounded-2xl border border-space-border/50 cursor-pointer transition-all space-y-1"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted block">Activities</span>
            <span className="text-2xl font-black text-brand-primary">{allActivities.length}</span>
          </div>

          <div 
            onClick={() => onNavigateTab('stays')}
            className="bg-space-secondary/60 hover:bg-space-secondary p-4 rounded-2xl border border-space-border/50 cursor-pointer transition-all space-y-1"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted block">Stays</span>
            <span className="text-2xl font-black text-brand-glow">{trip.bookings.filter(b => b.type === 'hotel').length || 1}</span>
          </div>

          <div 
            onClick={() => onNavigateTab('transport')}
            className="bg-space-secondary/60 hover:bg-space-secondary p-4 rounded-2xl border border-space-border/50 cursor-pointer transition-all space-y-1"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted block">Transport</span>
            <span className="text-2xl font-black text-typo-primary">{trip.transports.length} <span className="text-xs text-typo-muted">legs</span></span>
          </div>

          <div 
            onClick={() => onNavigateTab('budget')}
            className="bg-space-secondary/60 hover:bg-space-secondary p-4 rounded-2xl border border-space-border/50 cursor-pointer transition-all space-y-1"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted block">Budget</span>
            <span className="text-xl font-black text-brand-primary">₹{(trip.totalBudget / 1000).toFixed(0)}K</span>
          </div>

          <div 
            onClick={() => onNavigateTab('packing')}
            className="bg-space-secondary/60 hover:bg-space-secondary p-4 rounded-2xl border border-space-border/50 cursor-pointer transition-all space-y-1"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted block">Packing</span>
            <span className="text-2xl font-black text-brand-glow">{packedCount}/{trip.packingList.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Next Upcoming Item + Route Snapshot */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Next Up Highlight & Weather Brief */}
        <div className="lg:col-span-5 space-y-6">
          {nextActivity && (
            <div className="bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-glow flex items-center gap-1.5">
                  <Clock size={14} /> Upcoming Highlight
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-brand-primary/10 text-brand-primary">
                  {nextActivity.timeSlot}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-typo-primary tracking-tight leading-tight">{nextActivity.name}</h3>
                <p className="text-xs font-semibold text-typo-secondary flex items-center gap-1.5 mt-1">
                  <MapPin size={13} className="text-brand-glow" /> {nextActivity.location}
                </p>
              </div>

              <p className="text-xs text-typo-secondary leading-relaxed font-medium">
                {nextActivity.description}
              </p>

              <div className="pt-4 border-t border-space-border flex items-center justify-between">
                <span className="text-sm font-black text-brand-primary">
                  {nextActivity.cost === 0 ? 'Complimentary' : `₹${nextActivity.cost.toLocaleString()}`}
                </span>
                <button
                  onClick={() => onSelectActivity(nextActivity)}
                  className="text-xs font-bold text-brand-glow hover:underline flex items-center gap-1"
                >
                  View Details <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Quick Weather Forecast Card */}
          {trip.itinerary.weather && (
            <div className="bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted">Forecast in {trip.destination}</span>
                <span className="text-base font-black text-brand-glow">{trip.itinerary.weather.temperature}</span>
              </div>
              <h4 className="text-xl font-black text-typo-primary">{trip.itinerary.weather.condition}</h4>
              <p className="text-xs text-typo-secondary font-medium leading-relaxed">
                {trip.itinerary.weather.forecast}
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Route Map Snapshot */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-typo-primary tracking-tight flex items-center gap-2">
              <Compass size={18} className="text-brand-glow" /> Interactive Route Map
            </h3>
            <button
              onClick={() => onNavigateTab('map')}
              className="text-xs font-bold text-brand-primary hover:text-brand-glow transition-colors"
            >
              Full Screen Map →
            </button>
          </div>

          <MapView 
            itinerary={trip.itinerary} 
            heightClass="h-[380px]"
            onSelectActivity={onSelectActivity}
          />
        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  MapPin, 
  Calendar, 
  Wallet, 
  Trash2, 
  ArrowRight, 
  Compass, 
  Share2, 
  Users,
  Copy
} from 'lucide-react';
import { Trip } from '../types';

interface MyTripsViewProps {
  trips: Trip[];
  onOpenTrip: (tripId: string) => void;
  onOpenCreateTrip: () => void;
  onDeleteTrip: (tripId: string) => void;
  onNavigate: (route: string) => void;
}

export const MyTripsView: React.FC<MyTripsViewProps> = ({
  trips,
  onOpenTrip,
  onOpenCreateTrip,
  onDeleteTrip,
  onNavigate
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-space-border/60">
        <div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-glow">Your Travel Portfolio</span>
          <h1 className="text-4xl font-black text-typo-primary tracking-tight mt-1">My Expeditions</h1>
          <p className="text-sm font-medium text-typo-secondary mt-1">
            Manage your personal travel roadmaps, group collaborations, and archived trips.
          </p>
        </div>

        <button
          onClick={onOpenCreateTrip}
          className="px-6 py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-brand-primary/20 transition-all transform active:scale-95 shrink-0"
        >
          <Sparkles size={16} />
          <span>Plan New Trip</span>
        </button>
      </div>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <div className="bg-space-card rounded-[2.5rem] p-16 text-center border-2 border-dashed border-space-border space-y-6">
          <Compass size={56} className="mx-auto text-typo-muted" />
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-typo-primary">No adventures yet.</h3>
            <p className="text-sm text-typo-secondary max-w-md mx-auto">
              You haven't planned a trip yet. Launch the AI Trip Architect to turn an idea into an organized roadmap in minutes.
            </p>
          </div>
          <button
            onClick={onOpenCreateTrip}
            className="px-8 py-4 rounded-2xl bg-brand-primary text-space-main font-black text-xs uppercase tracking-widest inline-flex items-center gap-2 shadow-xl hover:bg-brand-glow transition-all"
          >
            <Sparkles size={16} /> Plan with AI
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => {
            const activitiesCount = trip.itinerary.days.reduce((acc, d) => acc + d.activities.length, 0);
            return (
              <div
                key={trip.id}
                className="bg-space-card rounded-[2.5rem] border border-space-border hover:border-brand-primary/60 shadow-xl overflow-hidden group transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5"
              >
                {/* Cover Image & Badges */}
                <div 
                  className="relative h-56 overflow-hidden cursor-pointer"
                  onClick={() => onOpenTrip(trip.id)}
                >
                  <img 
                    src={trip.coverImage || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'} 
                    alt={trip.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-space-card via-transparent to-transparent"></div>
                  
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-space-card/90 backdrop-blur-md border border-space-border text-[10px] font-black uppercase tracking-wider text-typo-primary">
                    {trip.duration} Days
                  </div>

                  <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                    <span className="text-xs font-black text-brand-glow bg-space-main/80 backdrop-blur-md px-3 py-1 rounded-xl border border-space-border">
                      ₹{trip.totalBudget.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-bold text-typo-secondary bg-space-main/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-space-border">
                      {trip.travelers} Travelers
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-7 space-y-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 
                      onClick={() => onOpenTrip(trip.id)}
                      className="text-2xl font-black text-typo-primary tracking-tight leading-tight hover:text-brand-glow transition-colors cursor-pointer"
                    >
                      {trip.title}
                    </h3>
                    <p className="text-xs font-semibold text-typo-secondary flex items-center gap-1.5">
                      <MapPin size={13} className="text-brand-primary" /> {trip.destination}
                    </p>
                  </div>

                  {/* Summary row */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-space-border/60 text-center">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-typo-muted block">Days</span>
                      <span className="text-sm font-extrabold text-typo-primary">{trip.itinerary.days.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-typo-muted block">Activities</span>
                      <span className="text-sm font-extrabold text-typo-primary">{activitiesCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-typo-muted block">Bookings</span>
                      <span className="text-sm font-extrabold text-typo-primary">{trip.bookings.length}</span>
                    </div>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="flex items-center gap-3 pt-1">
                    <button
                      onClick={() => onOpenTrip(trip.id)}
                      className="flex-1 py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight size={14} />
                    </button>
                    
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${trip.title}"?`)) {
                          onDeleteTrip(trip.id);
                        }
                      }}
                      className="p-3.5 rounded-2xl bg-space-secondary hover:bg-red-500/10 text-typo-muted hover:text-red-500 border border-space-border transition-colors"
                      title="Delete trip"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

import React from 'react';
import { 
  Sparkles, 
  Plus, 
  MapPin, 
  Calendar, 
  Wallet, 
  CheckCircle2, 
  ArrowRight, 
  Bed, 
  Luggage, 
  Bookmark, 
  Globe,
  Clock,
  Compass
} from 'lucide-react';
import { User, Trip } from '../types';

interface DashboardViewProps {
  user: User;
  trips: Trip[];
  onOpenTrip: (tripId: string) => void;
  onOpenCreateTrip: () => void;
  onNavigate: (route: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  trips,
  onOpenTrip,
  onOpenCreateTrip,
  onNavigate
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const upcomingTrip = trips[0] || null;
  const recentTrips = trips.slice(1);

  // Calculate planning progress for upcoming trip
  const calculateProgress = (trip: Trip | null): number => {
    if (!trip) return 0;
    let score = 25; // Basic trip created
    if (trip.itinerary && trip.itinerary.days.length > 0) score += 25;
    if (trip.bookings.length > 0) score += 20;
    if (trip.packingList.length > 0) score += 15;
    if (trip.transports.length > 0) score += 15;
    return Math.min(score, 100);
  };

  const progress = calculateProgress(upcomingTrip);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-300">
      
      {/* Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-space-border/60">
        <div className="space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-glow">
            Command Center
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-typo-primary tracking-tight">
            {getGreeting()}, <span className="text-brand-primary">{user.name.split(' ')[0]}</span>.
          </h1>
          <p className="text-sm font-medium text-typo-secondary">
            Where are you traveling to next? Your autonomous travel engine is synchronized.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateTrip}
            className="px-6 py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-brand-primary/20 transition-all transform active:scale-95"
          >
            <Sparkles size={16} />
            <span>Plan with AI</span>
          </button>
          <button
            onClick={() => onNavigate('discover')}
            className="px-5 py-3.5 rounded-2xl bg-space-card border border-space-border hover:border-brand-primary/50 text-typo-primary font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Explore
          </button>
        </div>
      </div>

      {/* Hero: Active / Upcoming Trip Card */}
      {upcomingTrip ? (
        <div className="bg-gradient-to-br from-space-card via-space-card to-space-secondary rounded-[3rem] p-8 sm:p-12 border-2 border-space-border hover:border-brand-glow/40 shadow-2xl transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-glow/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-brand-primary/10 border border-brand-primary/30 text-[10px] font-black uppercase tracking-widest text-brand-glow">
                <Clock size={12} /> Next Upcoming Expedition
              </div>

              <div>
                <h2 className="text-4xl sm:text-5xl font-black text-typo-primary tracking-tight leading-tight">
                  {upcomingTrip.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-typo-secondary mt-2">
                  <span className="flex items-center gap-1.5"><MapPin size={15} className="text-brand-glow" /> {upcomingTrip.destination}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5"><Calendar size={15} className="text-brand-glow" /> {upcomingTrip.startDate} ({upcomingTrip.duration} Days)</span>
                  <span>•</span>
                  <span>{upcomingTrip.travelers} Travelers</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 max-w-md">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-typo-muted uppercase tracking-wider">Planning Progress</span>
                  <span className="text-brand-glow">{progress}% Complete</span>
                </div>
                <div className="w-full h-2.5 bg-space-secondary rounded-full overflow-hidden border border-space-border">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-primary to-brand-glow rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Quick Actions inside Upcoming Trip */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenTrip(upcomingTrip.id)}
                  className="px-7 py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
                >
                  <span>Open Trip Workspace</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Column: Mini Metric Cards */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-space-secondary/80 p-5 rounded-3xl border border-space-border space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted flex items-center gap-1.5">
                  <Calendar size={13} className="text-brand-glow" /> Days Planned
                </span>
                <p className="text-2xl font-black text-typo-primary">{upcomingTrip.itinerary.days.length}</p>
                <p className="text-[10px] text-typo-secondary font-semibold">
                  {upcomingTrip.itinerary.days.reduce((acc, d) => acc + d.activities.length, 0)} activities total
                </p>
              </div>

              <div className="bg-space-secondary/80 p-5 rounded-3xl border border-space-border space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted flex items-center gap-1.5">
                  <Wallet size={13} className="text-brand-glow" /> Total Budget
                </span>
                <p className="text-2xl font-black text-brand-primary">
                  ₹{upcomingTrip.totalBudget.toLocaleString()}
                </p>
                <p className="text-[10px] text-typo-secondary font-semibold">
                  ₹{upcomingTrip.itinerary.grandTotal.toLocaleString()} allocated
                </p>
              </div>

              <div className="bg-space-secondary/80 p-5 rounded-3xl border border-space-border space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted flex items-center gap-1.5">
                  <Bed size={13} className="text-brand-glow" /> Bookings
                </span>
                <p className="text-2xl font-black text-typo-primary">{upcomingTrip.bookings.length}</p>
                <p className="text-[10px] text-typo-secondary font-semibold">Stays & flights logged</p>
              </div>

              <div className="bg-space-secondary/80 p-5 rounded-3xl border border-space-border space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted flex items-center gap-1.5">
                  <Luggage size={13} className="text-brand-glow" /> Packing
                </span>
                <p className="text-2xl font-black text-typo-primary">
                  {upcomingTrip.packingList.filter(p => p.isPacked).length}/{upcomingTrip.packingList.length}
                </p>
                <p className="text-[10px] text-typo-secondary font-semibold">Items ready in bags</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-space-card rounded-[2.5rem] p-16 text-center border-2 border-dashed border-space-border space-y-6">
          <Compass size={56} className="mx-auto text-brand-glow animate-pulse" />
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-typo-primary">No adventures planned yet.</h3>
            <p className="text-sm text-typo-secondary max-w-md mx-auto font-medium">
              Start with the AI Trip Architect to turn an idea into a synchronized multi-day itinerary.
            </p>
          </div>
          <button
            onClick={onOpenCreateTrip}
            className="px-8 py-4 rounded-2xl bg-brand-primary text-space-main font-black text-xs uppercase tracking-widest inline-flex items-center gap-2 shadow-xl hover:bg-brand-glow transition-all"
          >
            <Sparkles size={16} /> Plan Your First Trip
          </button>
        </div>
      )}

      {/* Recent Expeditions Grid */}
      {recentTrips.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-typo-primary tracking-tight">Your Other Expeditions</h3>
            <button
              onClick={() => onNavigate('my-trips')}
              className="text-xs font-bold text-brand-primary hover:text-brand-glow transition-colors"
            >
              View All Trips ({trips.length}) →
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTrips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => onOpenTrip(trip.id)}
                className="bg-space-card rounded-3xl p-6 border border-space-border hover:border-brand-primary/50 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-space-secondary text-brand-primary border border-space-border">
                    {trip.duration} Days
                  </span>
                  <span className="text-xs font-black text-typo-primary">₹{trip.totalBudget.toLocaleString()}</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-typo-primary tracking-tight leading-tight">{trip.title}</h4>
                  <p className="text-xs text-typo-secondary font-medium mt-1">{trip.destination}</p>
                </div>
                <div className="pt-3 border-t border-space-border flex items-center justify-between text-xs text-typo-muted font-semibold">
                  <span>{trip.itinerary.days.reduce((acc, d) => acc + d.activities.length, 0)} activities</span>
                  <span className="text-brand-primary font-bold">Open Workspace →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Launch Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div 
          onClick={() => onNavigate('discover')}
          className="bg-space-card p-6 rounded-3xl border border-space-border hover:border-brand-primary/40 shadow-md cursor-pointer transition-all group flex items-center gap-5"
        >
          <div className="p-4 rounded-2xl bg-space-secondary text-brand-primary group-hover:scale-110 transition-transform">
            <Globe size={24} />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-typo-primary">Explore Destinations</h4>
            <p className="text-xs text-typo-secondary font-medium">Curated travel guides & budgets</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('community')}
          className="bg-space-card p-6 rounded-3xl border border-space-border hover:border-brand-primary/40 shadow-md cursor-pointer transition-all group flex items-center gap-5"
        >
          <div className="p-4 rounded-2xl bg-space-secondary text-brand-glow group-hover:scale-110 transition-transform">
            <Sparkles size={24} />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-typo-primary">Remix Templates</h4>
            <p className="text-xs text-typo-secondary font-medium">Clone public trips into your app</p>
          </div>
        </div>

        <div 
          onClick={() => onNavigate('saved-places')}
          className="bg-space-card p-6 rounded-3xl border border-space-border hover:border-brand-primary/40 shadow-md cursor-pointer transition-all group flex items-center gap-5"
        >
          <div className="p-4 rounded-2xl bg-space-secondary text-brand-primary group-hover:scale-110 transition-transform">
            <Bookmark size={24} />
          </div>
          <div>
            <h4 className="font-extrabold text-base text-typo-primary">Saved Places</h4>
            <p className="text-xs text-typo-secondary font-medium">Hotels, sights & restaurants saved</p>
          </div>
        </div>
      </div>

    </div>
  );
};

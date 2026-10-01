import React, { useState } from 'react';
import { 
  Bed, 
  Search, 
  Star, 
  Check, 
  Plus, 
  Filter, 
  MapPin, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Trip, AccommodationOption, BookingItem } from '../../types';
import { CURATED_ACCOMMODATIONS } from '../../services/mockData';

interface TripStaysTabProps {
  trip: Trip;
  onUpdateTrip: (updater: (t: Trip) => Trip) => void;
}

export const TripStaysTab: React.FC<TripStaysTabProps> = ({
  trip,
  onUpdateTrip
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDayToAttach, setSelectedDayToAttach] = useState<number>(1);

  // Pool options based on trip destination
  const matchedKey = Object.keys(CURATED_ACCOMMODATIONS).find(k => 
    trip.destination.toLowerCase().includes(k)
  ) || 'japan';

  const baseStays = CURATED_ACCOMMODATIONS[matchedKey] || CURATED_ACCOMMODATIONS.japan;

  const filteredStays = baseStays.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || s.type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const handleAttachStayToTrip = (stay: AccommodationOption) => {
    // 1. Add as booking
    const newBooking: BookingItem = {
      id: `bk_stay_${Date.now()}`,
      tripId: trip.id,
      type: 'hotel',
      title: stay.name,
      provider: 'Verified Accommodation Partner',
      bookingRef: `HTL-${Math.floor(1000 + Math.random() * 9000)}`,
      date: trip.startDate,
      location: stay.location,
      cost: stay.pricePerNight * trip.duration,
      currency: trip.currency,
      status: 'confirmed',
      notes: `Curated ${stay.type}. Includes amenities: ${stay.amenities.join(', ')}.`
    };

    // 2. Update itinerary days' accommodation cost
    onUpdateTrip(prev => {
      const days = prev.itinerary.days.map(d => ({
        ...d,
        accommodationCost: stay.pricePerNight,
        dailyTotal: d.activities.reduce((s, a) => s + a.cost, 0) + stay.pricePerNight
      }));

      const grandTotal = days.reduce((s, d) => s + d.dailyTotal, 0);

      return {
        ...prev,
        bookings: [...prev.bookings, newBooking],
        itinerary: {
          ...prev.itinerary,
          days,
          grandTotal,
          remainingBudget: prev.totalBudget - grandTotal
        }
      };
    });

    alert(`Attached "${stay.name}" to all ${trip.duration} days of your trip itinerary and budget!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-space-border">
        <div>
          <h2 className="text-3xl font-black text-typo-primary tracking-tight">Accommodation & Stays</h2>
          <p className="text-xs font-semibold text-typo-secondary mt-1">
            Curated resorts, heritage boutique lodges, and design apartments in {trip.destination}.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-bold">
          <Sparkles size={14} /> Synced with Day Plans & Budget
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-typo-muted" />
          <input 
            type="text"
            placeholder="Search stays by property name or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-space-card border-2 border-space-border focus:border-brand-primary rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-typo-primary placeholder:text-typo-muted outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {['All', 'Hotel', 'Resort', 'Villa', 'Apartment'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
                selectedType === t
                  ? 'bg-brand-primary text-space-main border-transparent shadow-md'
                  : 'bg-space-card border-space-border text-typo-secondary hover:text-typo-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stays Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStays.map((stay) => {
          const isAlreadyAdded = trip.bookings.some(b => b.title === stay.name);

          return (
            <div
              key={stay.id}
              className="bg-space-card rounded-[2.5rem] border border-space-border hover:border-brand-primary/50 shadow-xl overflow-hidden group transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={stay.imageUrl} 
                  alt={stay.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-space-card/90 backdrop-blur-md border border-space-border text-[10px] font-black uppercase tracking-wider text-typo-primary">
                  {stay.type}
                </span>

                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-xl bg-space-main/90 backdrop-blur-md border border-space-border text-xs font-black text-brand-glow">
                  ₹{stay.pricePerNight.toLocaleString()} <span className="text-[10px] font-normal text-typo-muted">/ night</span>
                </div>
              </div>

              <div className="p-7 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black text-typo-primary tracking-tight leading-tight">{stay.name}</h4>
                    <span className="text-xs font-bold text-typo-primary flex items-center gap-1 shrink-0">
                      <Star size={13} className="text-yellow-400 fill-yellow-400" /> {stay.rating}
                    </span>
                  </div>
                  <p className="text-xs text-typo-secondary flex items-center gap-1 truncate font-medium">
                    <MapPin size={12} className="text-brand-glow shrink-0" /> {stay.location}
                  </p>
                </div>

                {/* Amenities pills */}
                <div className="flex flex-wrap gap-1.5 py-1">
                  {stay.amenities.slice(0, 3).map((am, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-space-secondary text-typo-secondary border border-space-border/50">
                      ✓ {am}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-space-border flex items-center justify-between">
                  <span className="text-[10px] font-bold text-typo-muted">{stay.cancellation}</span>
                  
                  {isAlreadyAdded ? (
                    <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center gap-1.5">
                      <Check size={14} /> Added to Trip
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAttachStayToTrip(stay)}
                      className="px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-glow text-space-main text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <Plus size={14} /> Add to Trip
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

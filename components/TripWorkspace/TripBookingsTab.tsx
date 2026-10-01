import React, { useState } from 'react';
import { 
  Bed, 
  Plane, 
  Train, 
  Bus, 
  Car, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  MapPin,
  Tag
} from 'lucide-react';
import { Trip, BookingItem, BookingType, BookingStatus, User } from '../../types';
import { notificationService } from '../../services/email/notificationService';

interface TripBookingsTabProps {
  trip: Trip;
  onUpdateTrip: (updater: (t: Trip) => Trip) => void;
}

export const TripBookingsTab: React.FC<TripBookingsTabProps> = ({
  trip,
  onUpdateTrip
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newType, setNewType] = useState<BookingType>('hotel');
  const [newTitle, setNewTitle] = useState('');
  const [newProvider, setNewProvider] = useState('');
  const [newRef, setNewRef] = useState('');
  const [newDate, setNewDate] = useState(trip.startDate);
  const [newLocation, setNewLocation] = useState(trip.destination);
  const [newCost, setNewCost] = useState<number>(0);
  const [newNotes, setNewNotes] = useState('');

  const getIconForType = (type: BookingType) => {
    switch (type) {
      case 'hotel': return <Bed size={18} className="text-brand-glow" />;
      case 'flight': return <Plane size={18} className="text-brand-glow" />;
      case 'train': return <Train size={18} className="text-brand-glow" />;
      case 'car_rental': return <Car size={18} className="text-brand-glow" />;
      default: return <Tag size={18} className="text-brand-glow" />;
    }
  };

  const filteredBookings = trip.bookings.filter(b => {
    if (filterType === 'all') return true;
    return b.type === filterType;
  });

  const handleAddBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newBooking: BookingItem = {
      id: `bk_${Date.now()}`,
      tripId: trip.id,
      type: newType,
      title: newTitle.trim(),
      provider: newProvider.trim() || 'Direct Provider',
      bookingRef: newRef.trim() || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      date: newDate || trip.startDate,
      location: newLocation.trim() || trip.destination,
      cost: Number(newCost) || 0,
      currency: trip.currency,
      status: 'confirmed',
      notes: newNotes.trim()
    };

    onUpdateTrip(prev => ({
      ...prev,
      bookings: [...prev.bookings, newBooking]
    }));

    // Trigger real-time booking confirmation email
    const ownerMember = trip.members.find(m => m.role === 'owner') || trip.members[0];
    const userObj: User = {
      id: trip.userId,
      name: ownerMember?.name || 'Explorer',
      email: ownerMember?.email || 'traveler@voyage.ai'
    };
    notificationService.sendBookingConfirmation(userObj, trip, newBooking);

    // Reset
    setNewTitle('');
    setNewProvider('');
    setNewRef('');
    setNewCost(0);
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleDeleteBooking = (id: string) => {
    const target = trip.bookings.find(b => b.id === id);
    if (target) {
      const ownerMember = trip.members.find(m => m.role === 'owner') || trip.members[0];
      const userObj: User = {
        id: trip.userId,
        name: ownerMember?.name || 'Explorer',
        email: ownerMember?.email || 'traveler@voyage.ai'
      };
      notificationService.sendBookingCancellation(userObj, trip, target);
    }

    onUpdateTrip(prev => ({
      ...prev,
      bookings: prev.bookings.filter(b => b.id !== id)
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-space-border">
        <div>
          <h2 className="text-3xl font-black text-typo-primary tracking-tight">Trip Bookings & Reservations</h2>
          <p className="text-xs font-semibold text-typo-secondary mt-1">
            Confirmed stays, flight itineraries, transit tickets, and activities in one synchronized hub.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={16} />
          <span>Add Booking</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {['all', 'hotel', 'flight', 'train', 'activity', 'car_rental'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border ${
              filterType === t
                ? 'bg-brand-primary text-space-main border-transparent shadow-md'
                : 'bg-space-card border-space-border text-typo-secondary hover:text-typo-primary'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length === 0 ? (
        <div className="bg-space-card rounded-[2.5rem] p-16 text-center border-2 border-dashed border-space-border space-y-4">
          <Bed size={48} className="mx-auto text-typo-muted" />
          <h3 className="text-xl font-bold text-typo-primary">Your bookings will appear here.</h3>
          <p className="text-xs text-typo-secondary max-w-sm mx-auto">
            Log hotel reservations, flights, train tickets, or car bookings to connect them with your itinerary.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-2xl bg-brand-primary text-space-main font-bold text-xs uppercase tracking-wider"
          >
            Add First Booking
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-space-card rounded-3xl p-7 border border-space-border hover:border-brand-primary/50 shadow-xl transition-all space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-space-secondary flex items-center justify-center border border-space-border">
                      {getIconForType(b.type)}
                    </div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-space-secondary text-brand-primary border border-space-border">
                      {b.type}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                    <CheckCircle2 size={12} /> {b.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-xl font-black text-typo-primary tracking-tight leading-tight">{b.title}</h4>
                  <p className="text-xs text-typo-muted font-semibold mt-0.5">Provider: {b.provider}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-space-border/60 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-typo-muted uppercase block">Ref Code</span>
                    <span className="font-extrabold text-typo-primary">{b.bookingRef}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-typo-muted uppercase block">Date</span>
                    <span className="font-extrabold text-typo-primary">{b.date}</span>
                  </div>
                </div>

                <p className="text-xs text-typo-secondary flex items-center gap-1.5 truncate">
                  <MapPin size={13} className="text-brand-glow shrink-0" /> {b.location}
                </p>

                {b.notes && (
                  <p className="text-xs text-typo-secondary italic bg-space-secondary/50 p-3 rounded-xl">
                    "{b.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-space-border flex items-center justify-between">
                <span className="text-lg font-black text-brand-primary">
                  ₹{b.cost.toLocaleString()}
                </span>
                <button
                  onClick={() => handleDeleteBooking(b.id)}
                  className="p-2 rounded-xl text-typo-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Remove booking"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-space-main/80 backdrop-blur-md">
          <form 
            onSubmit={handleAddBooking}
            className="w-full max-w-xl bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-2xl space-y-6"
          >
            <h3 className="text-2xl font-black text-typo-primary tracking-tight">Add Trip Booking</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Booking Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none cursor-pointer"
                >
                  <option value="hotel">Hotel / Stay</option>
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                  <option value="activity">Activity / Tour</option>
                  <option value="car_rental">Car Rental</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Booking Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Marriott Resort Deluxe King"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Provider</label>
                <input 
                  type="text"
                  placeholder="e.g. Booking.com / Airline"
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Confirmation Code</label>
                <input 
                  type="text"
                  placeholder="e.g. CONF-8921"
                  value={newRef}
                  onChange={(e) => setNewRef(e.target.value)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Date</label>
                <input 
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Cost (₹)</label>
                <input 
                  type="number"
                  placeholder="Cost"
                  value={newCost || ''}
                  onChange={(e) => setNewCost(Number(e.target.value))}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-brand-primary">Notes / Confirmation Details</label>
              <textarea 
                rows={2}
                placeholder="Check-in timing, gate instructions, or breakfast inclusions..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-typo-secondary hover:text-typo-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-brand-primary text-space-main text-xs font-bold shadow-md hover:bg-brand-glow transition-all"
              >
                Save Booking
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { 
  Plane, 
  Train, 
  Bus, 
  Car, 
  Navigation, 
  Clock, 
  Plus, 
  Trash2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Trip, TransportItem, TransportType } from '../../types';

interface TripTransportTabProps {
  trip: Trip;
  onUpdateTrip: (updater: (t: Trip) => Trip) => void;
}

export const TripTransportTab: React.FC<TripTransportTabProps> = ({
  trip,
  onUpdateTrip
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [type, setType] = useState<TransportType>('flight');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [deptTime, setDeptTime] = useState('');
  const [arrTime, setArrTime] = useState('');
  const [carrier, setCarrier] = useState('');
  const [seat, setSeat] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [bookingRef, setBookingRef] = useState('');

  const getTransportIcon = (t: TransportType) => {
    switch (t) {
      case 'flight': return <Plane size={20} className="text-brand-glow" />;
      case 'train': return <Train size={20} className="text-brand-glow" />;
      case 'car': return <Car size={20} className="text-brand-glow" />;
      default: return <Bus size={20} className="text-brand-glow" />;
    }
  };

  const handleAddTransport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from.trim() || !to.trim()) return;

    const newLeg: TransportItem = {
      id: `tr_${Date.now()}`,
      tripId: trip.id,
      type,
      from: from.trim(),
      to: to.trim(),
      departureTime: deptTime || '10:00 AM',
      arrivalTime: arrTime || '01:30 PM',
      carrier: carrier.trim() || 'Scheduled Carrier',
      seatOrClass: seat.trim() || 'Standard Class',
      cost: Number(cost) || 0,
      currency: trip.currency,
      bookingRef: bookingRef.trim() || `TKT-${Math.floor(100 + Math.random() * 900)}`
    };

    onUpdateTrip(prev => ({
      ...prev,
      transports: [...prev.transports, newLeg]
    }));

    setFrom('');
    setTo('');
    setDeptTime('');
    setArrTime('');
    setCarrier('');
    setSeat('');
    setCost(0);
    setBookingRef('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    onUpdateTrip(prev => ({
      ...prev,
      transports: prev.transports.filter(t => t.id !== id)
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-space-border">
        <div>
          <h2 className="text-3xl font-black text-typo-primary tracking-tight">Transit & Mobility</h2>
          <p className="text-xs font-semibold text-typo-secondary mt-1">
            Flights, bullet trains, transfers, and rental vehicles linking your expedition sectors.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={16} />
          <span>Add Transport Leg</span>
        </button>
      </div>

      {/* Transit Cards */}
      {trip.transports.length === 0 ? (
        <div className="bg-space-card rounded-[2.5rem] p-16 text-center border-2 border-dashed border-space-border space-y-4">
          <Plane size={48} className="mx-auto text-typo-muted" />
          <h3 className="text-xl font-bold text-typo-primary">No transport legs recorded.</h3>
          <p className="text-xs text-typo-secondary max-w-sm mx-auto">
            Log flights or bullet trains to map out travel transitions between cities.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-2xl bg-brand-primary text-space-main font-bold text-xs uppercase tracking-wider"
          >
            Add Transit Segment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {trip.transports.map((item) => (
            <div
              key={item.id}
              className="bg-space-card rounded-3xl p-6 border border-space-border hover:border-brand-primary/50 shadow-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Type and Route */}
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-space-secondary flex items-center justify-center border border-space-border shrink-0">
                  {getTransportIcon(item.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-typo-primary">{item.from}</span>
                    <ArrowRight size={16} className="text-brand-glow" />
                    <span className="text-lg font-black text-typo-primary">{item.to}</span>
                  </div>
                  <p className="text-xs font-semibold text-typo-secondary">
                    {item.carrier} • Seat: {item.seatOrClass || 'Assigned at check-in'}
                  </p>
                </div>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-typo-muted uppercase block">Departure</span>
                  <span className="font-extrabold text-typo-primary">{item.departureTime}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-typo-muted uppercase block">Arrival</span>
                  <span className="font-extrabold text-typo-primary">{item.arrivalTime}</span>
                </div>
              </div>

              {/* Cost & Delete */}
              <div className="flex items-center gap-6 justify-between md:justify-end">
                <div className="text-right">
                  <span className="text-base font-black text-brand-primary">₹{item.cost.toLocaleString()}</span>
                  <span className="text-[10px] text-typo-muted font-bold block">Ref: {item.bookingRef || 'Direct'}</span>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2.5 rounded-xl text-typo-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-space-main/80 backdrop-blur-md">
          <form 
            onSubmit={handleAddTransport}
            className="w-full max-w-xl bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-2xl space-y-6"
          >
            <h3 className="text-2xl font-black text-typo-primary tracking-tight">Add Transit Segment</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Mode of Travel</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none cursor-pointer"
                >
                  <option value="flight">Flight</option>
                  <option value="train">Train / Bullet Train</option>
                  <option value="car">Rental Car / Taxi</option>
                  <option value="bus">Bus / Coach</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Carrier & Number</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Air India AI 306 / Shinkansen"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Origin *</label>
                <input 
                  type="text"
                  required
                  placeholder="Departure station or city"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Destination *</label>
                <input 
                  type="text"
                  required
                  placeholder="Arrival station or city"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Departure Timing</label>
                <input 
                  type="text"
                  placeholder="e.g. 12 Oct, 10:30 AM"
                  value={deptTime}
                  onChange={(e) => setDeptTime(e.target.value)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Arrival Timing</label>
                <input 
                  type="text"
                  placeholder="e.g. 12 Oct, 02:45 PM"
                  value={arrTime}
                  onChange={(e) => setArrTime(e.target.value)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Seat / Class</label>
                <input 
                  type="text"
                  placeholder="e.g. Seat 12A / Reserved"
                  value={seat}
                  onChange={(e) => setSeat(e.target.value)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Cost (₹)</label>
                <input 
                  type="number"
                  placeholder="0"
                  value={cost || ''}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>
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
                Save Segment
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

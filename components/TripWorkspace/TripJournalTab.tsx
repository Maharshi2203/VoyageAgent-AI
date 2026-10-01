import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Image, 
  Lock, 
  Globe2,
  Film
} from 'lucide-react';
import { Trip, JournalEntry } from '../../types';

interface TripJournalTabProps {
  trip: Trip;
  onUpdateTrip: (updater: (t: Trip) => Trip) => void;
  onOpenReel: () => void;
}

export const TripJournalTab: React.FC<TripJournalTabProps> = ({
  trip,
  onUpdateTrip,
  onOpenReel
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState(trip.destination);
  const [photoUrl, setPhotoUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newEntry: JournalEntry = {
      id: `jnl_${Date.now()}`,
      tripId: trip.id,
      dayNumber,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      title: title.trim(),
      content: content.trim(),
      location: location.trim() || trip.destination,
      photos: photoUrl.trim() 
        ? [photoUrl.trim()] 
        : ['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'],
      isPublic,
      createdAt: new Date().toISOString()
    };

    onUpdateTrip(prev => ({
      ...prev,
      journalEntries: [newEntry, ...prev.journalEntries]
    }));

    setTitle('');
    setContent('');
    setPhotoUrl('');
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    onUpdateTrip(prev => ({
      ...prev,
      journalEntries: prev.journalEntries.filter(e => e.id !== id)
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-space-border">
        <div>
          <h2 className="text-3xl font-black text-typo-primary tracking-tight">Expedition Journal & Memories</h2>
          <p className="text-xs font-semibold text-typo-secondary mt-1">
            Capture daily reflections, photos, and highlight moments for private keeping or community sharing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReel}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-glow text-space-main font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-brand-primary/20 hover:scale-105 transition-all"
          >
            <Film size={15} />
            <span>Generate Trip Reel</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-space-card hover:bg-space-secondary border border-space-border text-xs font-bold text-typo-primary flex items-center gap-2 transition-colors"
          >
            <Plus size={15} />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Entries List */}
      {trip.journalEntries.length === 0 ? (
        <div className="bg-space-card rounded-[2.5rem] p-16 text-center border-2 border-dashed border-space-border space-y-4">
          <BookOpen size={48} className="mx-auto text-typo-muted" />
          <h3 className="text-xl font-bold text-typo-primary">Your travel story starts here.</h3>
          <p className="text-xs text-typo-secondary max-w-sm mx-auto">
            Log your impressions, photos, and discoveries day by day as your trip unfolds.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-2xl bg-brand-primary text-space-main font-bold text-xs uppercase tracking-wider"
          >
            Add First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {trip.journalEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-xl hover:border-brand-primary/40 transition-all space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-space-border/60">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-brand-primary text-space-main font-black text-sm flex items-center justify-center shadow-md">
                    D{entry.dayNumber}
                  </span>
                  <div>
                    <h3 className="text-2xl font-black text-typo-primary tracking-tight leading-tight">{entry.title}</h3>
                    <p className="text-xs text-typo-muted font-semibold flex items-center gap-2 mt-0.5">
                      <Calendar size={13} /> {entry.date} • <MapPin size={13} className="text-brand-glow" /> {entry.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-typo-muted flex items-center gap-1 bg-space-secondary px-2.5 py-1 rounded-lg border border-space-border/50">
                    {entry.isPublic ? <Globe2 size={12} className="text-brand-glow" /> : <Lock size={12} />}
                    {entry.isPublic ? 'Public Story' : 'Private'}
                  </span>

                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 rounded-xl text-typo-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <p className="text-sm font-medium text-typo-secondary leading-relaxed whitespace-pre-line">
                {entry.content}
              </p>

              {entry.photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                  {entry.photos.map((photo, pIdx) => (
                    <div key={pIdx} className="h-44 rounded-2xl overflow-hidden border border-space-border">
                      <img src={photo} alt="Journal highlight" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-space-main/80 backdrop-blur-md">
          <form 
            onSubmit={handleAddEntry}
            className="w-full max-w-xl bg-space-card rounded-[2.5rem] p-8 border border-space-border shadow-2xl space-y-5"
          >
            <h3 className="text-2xl font-black text-typo-primary tracking-tight">Record Daily Reflection</h3>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Day #</label>
                <select
                  value={dayNumber}
                  onChange={(e) => setDayNumber(Number(e.target.value))}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none cursor-pointer"
                >
                  {trip.itinerary.days.map(d => (
                    <option key={d.day} value={d.day}>Day {d.day}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-brand-primary">Entry Title *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Touching down in Tokyo & First Ramen Bowl"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-brand-primary">Location / Sector</label>
              <input 
                type="text"
                placeholder="e.g. Shinjuku & Shibuya"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-brand-primary">Story / Journal Reflection *</label>
              <textarea 
                rows={4}
                required
                placeholder="What was your favorite moment today? Describe sensory sights, tastes, and unexpected discoveries..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-medium text-typo-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-brand-primary">Photo URL (Optional)</label>
              <input 
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full bg-space-secondary border border-space-border rounded-xl px-4 py-2.5 text-xs font-bold text-typo-primary outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-typo-secondary">
                <input 
                  type="checkbox" 
                  checked={isPublic} 
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded border-space-border text-brand-primary focus:ring-0" 
                />
                <span>Share with community reel</span>
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-typo-secondary hover:text-typo-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-brand-primary text-space-main text-xs font-bold shadow-md hover:bg-brand-glow transition-all"
                >
                  Save Reflection
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

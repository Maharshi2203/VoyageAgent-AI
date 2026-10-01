import React, { useState } from 'react';
import { 
  User as UserIcon, 
  MapPin, 
  Globe, 
  Compass, 
  Bookmark, 
  Sparkles, 
  ShieldCheck, 
  Save,
  Check
} from 'lucide-react';
import { User } from '../types';

interface UserProfileViewProps {
  user: User;
  tripsCount: number;
  savedPlacesCount: number;
  onUpdateUser: (updated: User) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  tripsCount,
  savedPlacesCount,
  onUpdateUser
}) => {
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || 'Curious nomad exploring ancient shrines, remote coastlines, and artisan bakeries.');
  const [travelStyle, setTravelStyle] = useState(user.travelStyle || 'Culture & Food Exploration');
  const [homeCity, setHomeCity] = useState(user.homeCity || 'Bengaluru, India');
  const [countriesCount, setCountriesCount] = useState(user.countriesVisited || 6);
  const [citiesCount, setCitiesCount] = useState(user.citiesVisited || 18);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...user,
      name,
      bio,
      travelStyle,
      homeCity,
      countriesVisited: countriesCount,
      citiesVisited: citiesCount,
      savedPlacesCount
    };
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-300">
      
      {/* Header Profile Hero Card */}
      <div className="bg-space-card rounded-[3rem] p-8 sm:p-12 border border-space-border shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-glow/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 text-center sm:text-left">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-brand-primary to-brand-glow text-space-main font-black text-3xl flex items-center justify-center shadow-xl shadow-brand-primary/20 shrink-0">
            {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-3xl sm:text-4xl font-black text-typo-primary tracking-tight">{name}</h1>
              <span className="px-3 py-1 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-extrabold uppercase tracking-wider">
                Autonomous Explorer
              </span>
            </div>
            <p className="text-xs font-semibold text-typo-secondary flex items-center justify-center sm:justify-start gap-1.5">
              <MapPin size={14} className="text-brand-glow" /> Based in {homeCity}
            </p>
            <p className="text-sm text-typo-secondary font-medium leading-relaxed max-w-xl">
              "{bio}"
            </p>
          </div>
        </div>

        {/* Lifetime Travel Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-8 border-t border-space-border">
          <div className="bg-space-secondary/70 p-4 rounded-2xl text-center border border-space-border/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted block">Expeditions</span>
            <span className="text-2xl font-black text-typo-primary">{tripsCount}</span>
          </div>
          <div className="bg-space-secondary/70 p-4 rounded-2xl text-center border border-space-border/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted block">Countries</span>
            <span className="text-2xl font-black text-brand-primary">{countriesCount}</span>
          </div>
          <div className="bg-space-secondary/70 p-4 rounded-2xl text-center border border-space-border/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted block">Cities</span>
            <span className="text-2xl font-black text-brand-glow">{citiesCount}</span>
          </div>
          <div className="bg-space-secondary/70 p-4 rounded-2xl text-center border border-space-border/50">
            <span className="text-[10px] font-black uppercase tracking-widest text-typo-muted block">Saved Spots</span>
            <span className="text-2xl font-black text-typo-primary">{savedPlacesCount}</span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-space-card rounded-[2.5rem] p-8 sm:p-10 border border-space-border shadow-xl space-y-8">
        <h3 className="text-2xl font-black text-typo-primary tracking-tight">Profile Details & Travel Philosophy</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary">Full Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-primary rounded-2xl py-3.5 px-5 text-sm font-bold text-typo-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary">Home City</label>
            <input 
              type="text"
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-primary rounded-2xl py-3.5 px-5 text-sm font-bold text-typo-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary">Bio</label>
          <textarea 
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-primary rounded-2xl py-3.5 px-5 text-sm font-semibold text-typo-primary outline-none transition-all"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary">Travel Style</label>
            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-primary rounded-2xl py-3.5 px-5 text-sm font-bold text-typo-primary outline-none transition-all"
            >
              <option value="Culture & Food Exploration">Culture & Food Exploration</option>
              <option value="High-Adrenaline Adventure">High-Adrenaline Adventure</option>
              <option value="Coastal Slow Living & Wellness">Coastal Slow Living & Wellness</option>
              <option value="Luxury Urban Escapes">Luxury Urban Escapes</option>
              <option value="Backpacking & Budget Road Trips">Backpacking & Budget Road Trips</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary">Countries Visited</label>
            <input 
              type="number"
              value={countriesCount}
              onChange={(e) => setCountriesCount(Number(e.target.value))}
              className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-primary rounded-2xl py-3.5 px-5 text-sm font-bold text-typo-primary outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary">Cities Explored</label>
            <input 
              type="number"
              value={citiesCount}
              onChange={(e) => setCitiesCount(Number(e.target.value))}
              className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-primary rounded-2xl py-3.5 px-5 text-sm font-bold text-typo-primary outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-4">
          {savedSuccess && (
            <span className="text-xs font-bold text-brand-glow flex items-center gap-1.5 animate-in fade-in">
              <Check size={16} /> Preferences updated!
            </span>
          )}
          <button
            type="submit"
            className="px-8 py-3.5 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl transition-all transform active:scale-95"
          >
            <Save size={16} />
            <span>Save Profile</span>
          </button>
        </div>
      </form>

    </div>
  );
};

import React, { useState } from 'react';
import { DayPlan, ActivityType } from '../types';
import { ChevronDown, ChevronUp, MapPin, Clock, DollarSign, Bed, Calendar, ArrowRight, Zap, Activity } from 'lucide-react';

interface Props {
  dayPlan: DayPlan;
  currency: string;
}

const ActivityIcon = ({ type }: { type: ActivityType }) => {
  switch (type) {
    case ActivityType.ADVENTURE: return '🧗';
    case ActivityType.CULTURAL: return '🏛️';
    case ActivityType.FOOD: return '🥘';
    case ActivityType.NIGHTLIFE: return '🍹';
    case ActivityType.RELAXATION: return '🧘';
    case ActivityType.SHOPPING: return '🛍️';
    default: return '📍';
  }
};

const ItineraryCard: React.FC<Props> = ({ dayPlan, currency }) => {
  const [isOpen, setIsOpen] = useState(dayPlan.day === 1);

  return (
    <div className="bg-space-card rounded-[2.5rem] shadow-2xl border border-space-border overflow-hidden transition-all duration-600 hover:border-brand-primary/50 group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-10 py-8 flex items-center justify-between bg-space-card hover:bg-space-secondary transition-all text-left"
      >
        <div className="flex items-center gap-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl transition-all duration-500 border-2 ${isOpen ? 'bg-brand-primary border-brand-primary text-space-main shadow-lg' : 'bg-space-main border-space-border text-brand-primary'}`}>
            {dayPlan.day}
          </div>
          <div>
            <h4 className="font-black text-typo-primary text-2xl tracking-tighter leading-none">Day {dayPlan.day} Schedule</h4>
            <div className="flex items-center gap-6 mt-2">
                <span className="text-[11px] font-black text-typo-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                  <Calendar size={14} className="text-brand-glow" /> {dayPlan.activities.length} Activities
                </span>
                <span className="text-[11px] font-black text-typo-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="text-brand-glow font-black">{currency} {dayPlan.dailyTotal.toLocaleString()} Day Total</span>
                </span>
            </div>
          </div>
        </div>
        <div className={`w-12 h-12 rounded-full border-2 border-space-border flex items-center justify-center transition-all duration-500 ${isOpen ? 'rotate-180 bg-brand-primary border-brand-primary shadow-md' : ''}`}>
          <ChevronDown size={24} className={isOpen ? 'text-space-main' : 'text-typo-muted'} />
        </div>
      </button>

      {isOpen && (
        <div className="px-10 pb-12 animate-in slide-in-from-top-6 duration-600 bg-space-main/10">
          <div className="border-t-2 border-space-border pt-10 mt-2 space-y-12">
            {/* Stay Section */}
            <div className="bg-space-secondary rounded-[2rem] p-8 flex items-center justify-between border border-space-border shadow-xl transition-colors duration-300">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-brand-glow/10 rounded-2xl flex items-center justify-center border border-brand-glow/20">
                  <Bed size={28} className="text-brand-glow" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-typo-muted uppercase tracking-[0.3em]">Logistics Hub</p>
                  <p className="text-lg font-black text-typo-primary tracking-tight">Curated Accommodation</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-brand-primary">{currency}{dayPlan.accommodationCost.toLocaleString()}</p>
                <p className="text-[10px] font-black text-typo-muted uppercase tracking-widest mt-1">Verified Signal</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-16 relative pl-6">
              <div className="absolute left-10 top-4 bottom-4 w-1 bg-gradient-to-b from-brand-glow/40 via-brand-primary/10 to-brand-glow/40 rounded-full"></div>
              
              {dayPlan.activities.map((activity, idx) => (
                <div key={activity.id} className="relative pl-16 group/item">
                  <div className="absolute left-0 top-2 w-6 h-6 rounded-xl border-4 border-space-card shadow-xl bg-space-border z-10 transition-all duration-500 group-hover/item:scale-125 group-hover/item:bg-brand-glow group-hover/item:border-brand-primary"></div>
                  
                  <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-space-main bg-brand-primary px-4 py-1.5 rounded-xl shadow-lg">
                          {activity.timeSlot}
                        </span>
                        <h5 className="font-black text-typo-primary text-xl tracking-tighter group-hover/item:text-brand-glow transition-colors">{activity.name}</h5>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-glow bg-brand-glow/10 px-3 py-1 rounded-lg border border-brand-glow/20">
                          {activity.activityType}
                        </span>
                      </div>
                      <p className="text-base text-typo-secondary font-bold leading-relaxed max-w-2xl">{activity.description}</p>
                      
                      <div className="flex flex-wrap gap-8 pt-2">
                        <span className="flex items-center gap-3 text-[11px] font-black text-typo-muted uppercase tracking-widest">
                          <MapPin size={16} className="text-brand-glow" /> {activity.location}
                        </span>
                        <span className="flex items-center gap-3 text-[11px] font-black text-typo-muted uppercase tracking-widest">
                          <Clock size={16} className="text-brand-glow" /> Active Sector
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="bg-space-main text-typo-primary px-8 py-4 rounded-2xl text-base font-black border-2 border-space-border shadow-xl group-hover/item:border-brand-glow transition-colors">
                        {activity.cost === 0 ? 'COMPLIMENTARY' : `${currency}${activity.cost.toLocaleString()}`}
                      </div>
                        <button 
                          onClick={() => {
                            const query = encodeURIComponent(`${activity.name} ${activity.location}`);
                            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                          }}
                          className="flex items-center gap-2 text-[10px] font-black text-brand-glow/60 uppercase tracking-[0.3em] hover:text-brand-glow transition-all group/btn pr-2"
                        >
                          Acquire details <ArrowRight size={14} className="group-hover/btn:translate-x-3 transition-transform text-brand-primary" />
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryCard;
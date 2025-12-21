import React, { useEffect } from 'react';
import { X, Clock, MapPin, Wallet, Info, Sparkles, Navigation, Lightbulb } from 'lucide-react';
import { Activity } from '../types';

interface Props {
  activity: Activity | null;
  onClose: () => void;
  currency: string;
}

const ActivityDetailPanel: React.FC<Props> = ({ activity, onClose, currency }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!activity) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-space-main/40 backdrop-blur-sm z-[60] transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[40%] bg-space-card z-[70] shadow-2xl border-l border-space-border transform transition-transform duration-300 ease-out overflow-y-auto ${activity ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="sticky top-0 bg-space-card/80 backdrop-blur-md z-10 px-8 py-6 border-b border-space-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-space-main bg-brand-primary px-3 py-1 rounded-lg">
              {activity.timeSlot}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-glow">
              {activity.activityType}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-space-secondary hover:bg-space-border transition-colors text-typo-primary"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-10">
          {/* Header Info */}
          <section className="space-y-4">
            <h2 className="text-4xl font-black text-typo-primary tracking-tighter leading-tight">
              {activity.name}
            </h2>
            <div className="flex items-center gap-4 text-typo-muted text-sm font-bold">
              <span className="flex items-center gap-2"><MapPin size={16} className="text-brand-glow" /> {activity.location}</span>
            </div>
          </section>

          {/* Key Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-space-secondary p-6 rounded-3xl border border-space-border space-y-1">
              <p className="text-[10px] font-black text-typo-muted uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Duration
              </p>
              <p className="text-lg font-black text-typo-primary">{activity.estimatedDuration}</p>
            </div>
            <div className="bg-space-secondary p-6 rounded-3xl border border-space-border space-y-1">
              <p className="text-[10px] font-black text-typo-muted uppercase tracking-widest flex items-center gap-2">
                <Wallet size={12} /> Access Cost
              </p>
              <p className="text-lg font-black text-brand-primary">
                {activity.cost === 0 ? 'Free' : `${currency}${activity.cost.toLocaleString()}`}
              </p>
            </div>
          </div>

          {/* Description */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-black text-typo-muted uppercase tracking-[0.3em] flex items-center gap-2">
              <Info size={16} className="text-brand-glow" /> Detailed Brief
            </h3>
            <p className="text-typo-secondary leading-relaxed font-bold">
              {activity.description}
            </p>
          </section>

          {/* Best Time & Visiting */}
          <div className="bg-brand-primary/5 rounded-[2.5rem] p-8 border border-brand-primary/20 space-y-4">
            <h3 className="text-[11px] font-black text-brand-primary uppercase tracking-[0.3em] flex items-center gap-2">
              <Sparkles size={16} /> AI Expedition Insights
            </h3>
            <p className="text-typo-primary font-bold italic">
              "{activity.aiInsights}"
            </p>
            <div className="pt-4 flex items-center gap-3">
              <Navigation size={18} className="text-brand-glow" />
              <div className="text-sm font-black text-typo-secondary">
                Best Timing: <span className="text-typo-primary">{activity.bestVisitingTime}</span>
              </div>
            </div>
          </div>

          {/* Local Tips */}
          <section className="space-y-6">
            <h3 className="text-[11px] font-black text-typo-muted uppercase tracking-[0.3em] flex items-center gap-2">
              <Lightbulb size={16} className="text-brand-glow" /> Field Operative Tips
            </h3>
            <div className="space-y-4">
              {activity.localTips.map((tip, idx) => (
                <div key={idx} className="flex gap-4 items-start group">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0 group-hover:scale-150 transition-transform shadow-[0_0_8px_var(--brand-primary)]" />
                  <p className="text-sm font-bold text-typo-secondary leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default ActivityDetailPanel;
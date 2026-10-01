import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  Star, 
  MapPin, 
  Calendar, 
  Copy, 
  ArrowRight, 
  Heart,
  Share2
} from 'lucide-react';
import { CommunityTripTemplate } from '../types';
import { INITIAL_COMMUNITY_TEMPLATES } from '../services/mockData';

interface CommunityPageProps {
  onRemixTemplate: (templateId: string) => void;
  onViewTemplateDetails: (template: CommunityTripTemplate) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({
  onRemixTemplate,
  onViewTemplateDetails
}) => {
  const [likes, setLikes] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    INITIAL_COMMUNITY_TEMPLATES.forEach(t => map[t.id] = t.likes);
    return map;
  });
  const [userLiked, setUserLiked] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUserLiked(prev => {
      const isNow = !prev[id];
      setLikes(l => ({ ...l, [id]: (l[id] || 0) + (isNow ? 1 : -1) }));
      return { ...prev, [id]: isNow };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 text-brand-glow text-xs font-black uppercase tracking-[0.3em]">
          <Users size={16} /> Global Explorer Vault
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-typo-primary tracking-tight leading-none">
          Community Trips & Templates
        </h1>
        <p className="text-base sm:text-lg text-typo-secondary font-medium">
          Tested, real-world itineraries created by seasoned travelers. Remix any itinerary as a template directly into your private workspace with one click.
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {INITIAL_COMMUNITY_TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.id}
            className="bg-space-card rounded-[2.5rem] border border-space-border hover:border-brand-primary/60 shadow-xl overflow-hidden group transition-all duration-300 flex flex-col justify-between"
          >
            {/* Cover Image & Badges */}
            <div className="relative h-64 overflow-hidden">
              <img 
                src={tmpl.coverImage} 
                alt={tmpl.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-space-card via-transparent to-transparent"></div>
              
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-xl bg-space-card/90 backdrop-blur-md border border-space-border text-[10px] font-black uppercase tracking-wider text-typo-primary">
                  {tmpl.duration} Days
                </span>
                <span className="px-3 py-1 rounded-xl bg-space-card/90 backdrop-blur-md border border-space-border text-[10px] font-black uppercase tracking-wider text-typo-primary">
                  {tmpl.citiesCount} Cities
                </span>
              </div>

              <button
                onClick={(e) => toggleLike(tmpl.id, e)}
                className={`absolute top-4 right-4 p-2.5 rounded-2xl backdrop-blur-md border transition-all ${
                  userLiked[tmpl.id] 
                    ? 'bg-red-500 text-white border-red-500 scale-110' 
                    : 'bg-space-card/80 border-space-border text-typo-muted hover:text-red-400'
                }`}
              >
                <Heart size={16} className={userLiked[tmpl.id] ? 'fill-white' : ''} />
              </button>

              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                <span className="text-xl font-black text-brand-glow drop-shadow-md">
                  ₹{tmpl.estimatedBudget.toLocaleString()} <span className="text-xs font-normal text-typo-muted">est. total</span>
                </span>
                <span className="text-xs font-bold text-typo-secondary flex items-center gap-1">
                  <Heart size={13} className="text-red-400 fill-red-400" /> {likes[tmpl.id]} likes
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-typo-primary tracking-tight leading-tight">
                  {tmpl.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tmpl.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-space-secondary text-[10px] font-bold text-typo-secondary border border-space-border/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author & Action */}
              <div className="pt-6 border-t border-space-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {tmpl.author.avatarUrl ? (
                    <img 
                      src={tmpl.author.avatarUrl} 
                      alt={tmpl.author.name} 
                      className="w-9 h-9 rounded-xl object-cover border border-space-border"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-brand-primary text-space-main font-black text-xs flex items-center justify-center">
                      {tmpl.author.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-typo-primary leading-tight">{tmpl.author.name}</p>
                    <p className="text-[10px] text-typo-muted font-semibold">Verified Creator</p>
                  </div>
                </div>

                <button
                  onClick={() => onRemixTemplate(tmpl.id)}
                  className="px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-brand-primary/20 transition-all transform active:scale-95"
                >
                  <Copy size={14} />
                  <span>Use as Template</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

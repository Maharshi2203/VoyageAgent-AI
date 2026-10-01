import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Share2,
  Volume2
} from 'lucide-react';
import { Trip } from '../../types';

interface TripReelModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
}

export const TripReelModal: React.FC<TripReelModalProps> = ({
  trip,
  isOpen,
  onClose
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Build slides from journal entries or top activities
  const slides = trip.journalEntries.length > 0 
    ? trip.journalEntries.map(j => ({
        title: j.title,
        subtitle: `Day ${j.dayNumber} • ${j.location}`,
        caption: j.content,
        image: j.photos[0] || trip.coverImage || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1080&q=85',
        tag: `DAY ${j.dayNumber}`
      }))
    : trip.itinerary.days.flatMap(d => d.activities.slice(0, 2).map(a => ({
        title: a.name,
        subtitle: `Day ${d.day} • ${a.location}`,
        caption: a.description,
        image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1080&q=85',
        tag: a.timeSlot
      })));

  // Auto-advance timer (5 seconds per slide)
  useEffect(() => {
    if (!isOpen || slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isOpen, slides.length]);

  if (!isOpen || slides.length === 0) return null;

  const currentSlide = slides[currentSlideIndex];

  const handleNext = () => {
    setCurrentSlideIndex(prev => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlideIndex(prev => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 animate-in fade-in duration-300">
      
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white z-50 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Main Vertical Story Container (9:16 aspect ratio feeling) */}
      <div className="relative w-full max-w-sm sm:max-w-md h-[85vh] rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl flex flex-col justify-between select-none">
        
        {/* Background Image with Ken Burns zoom effect */}
        <img 
          src={currentSlide.image} 
          alt={currentSlide.title} 
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-pulse duration-[8000ms]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70 pointer-events-none" />

        {/* Top Progress Bars */}
        <div className="relative z-20 px-6 pt-6 flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div 
                className={`h-full bg-white rounded-full transition-all duration-300 ${
                  idx === currentSlideIndex 
                    ? 'w-full animate-pulse' 
                    : idx < currentSlideIndex 
                    ? 'w-full' 
                    : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Top Header metadata */}
        <div className="relative z-20 px-6 pt-3 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-brand-primary text-space-main text-[10px] font-black uppercase tracking-wider">
              {currentSlide.tag}
            </span>
            <span className="text-xs font-bold drop-shadow-md">{trip.destination}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
            {currentSlideIndex + 1} / {slides.length}
          </span>
        </div>

        {/* Interactive Tap Zones (Left / Right) */}
        <div className="absolute inset-0 z-10 flex">
          <div onClick={handlePrev} className="w-1/2 h-full cursor-pointer" />
          <div onClick={handleNext} className="w-1/2 h-full cursor-pointer" />
        </div>

        {/* Bottom Content Card */}
        <div className="relative z-20 p-6 sm:p-8 space-y-4 text-white">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase tracking-widest text-brand-glow drop-shadow">
              {currentSlide.subtitle}
            </p>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight drop-shadow-lg">
              {currentSlide.title}
            </h3>
          </div>

          <p className="text-xs sm:text-sm font-medium text-white/90 leading-relaxed line-clamp-4 drop-shadow">
            {currentSlide.caption}
          </p>

          <div className="pt-2 flex items-center justify-between border-t border-white/20">
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
              VOYAGEAGENT MEMORY ARCHIVE
            </span>
            <button
              onClick={() => alert('Trip Reel link copied to clipboard!')}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Share Reel"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

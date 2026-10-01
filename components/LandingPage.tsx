import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  Compass, 
  Calendar, 
  ShieldCheck, 
  Users, 
  Wallet, 
  Luggage, 
  FileText, 
  BookOpen, 
  Zap,
  Globe2,
  CheckCircle2,
  Star
} from 'lucide-react';
import { CURATED_DESTINATIONS, INITIAL_COMMUNITY_TEMPLATES } from '../services/mockData';

interface LandingPageProps {
  onPlanTrip: (prompt?: string) => void;
  onExploreDestinations: () => void;
  onViewDestination: (destId: string) => void;
  onViewCommunity: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onPlanTrip,
  onExploreDestinations,
  onViewDestination,
  onViewCommunity
}) => {
  const [heroPrompt, setHeroPrompt] = useState(
    'Plan a 7-day trip to Japan for two people under ₹1,50,000 with food, culture and photography.'
  );

  const samplePrompts = [
    '7-day Japan for 2 people with food & culture under ₹1.5L',
    '4-day weekend in Goa with beach villas & seafood under ₹40K',
    '6-day scenic Bali tropical road trip under ₹80K',
    '10-day Swiss Alps panoramic railway adventure under ₹2.5L'
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* ─── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Immersive Background Photography Backdrop with Soft Glass Layer */}
        <div className="absolute inset-0 -z-20">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=85" 
            alt="Scenic Travel Landscape"
            className="w-full h-full object-cover scale-105 opacity-20 filter blur-[2px] transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-space-main/90 via-space-main/70 to-space-main"></div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-brand-glow/15 rounded-full blur-[140px] -z-10 pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-brand-primary/15 rounded-full blur-[140px] -z-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto w-full text-center space-y-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-space-card/80 border border-space-border backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-brand-glow animate-ping" />
            <Sparkles size={14} className="text-brand-glow" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-typo-primary">
              AI-Powered All-in-One Travel Operating System
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-typo-primary tracking-tighter leading-[0.95]">
              Where will you <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-glow to-brand-primary">
                go next?
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-xl font-medium text-typo-secondary leading-relaxed">
              Plan your entire trip with AI — itinerary, stays, routes, budget and everything in between. One connected workspace for your whole journey.
            </p>
          </div>

          {/* Direct AI Trip Input Box */}
          <div className="max-w-3xl mx-auto w-full bg-space-card/95 border-2 border-space-border hover:border-brand-primary/60 rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-3 w-full px-3 py-2">
                <Sparkles size={22} className="text-brand-glow shrink-0" />
                <input 
                  type="text"
                  value={heroPrompt}
                  onChange={(e) => setHeroPrompt(e.target.value)}
                  placeholder="e.g. Plan a 7-day trip to Japan for 2 people under ₹1,50,000..."
                  className="w-full bg-transparent text-sm sm:text-base font-semibold text-typo-primary placeholder:text-typo-muted focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onPlanTrip(heroPrompt);
                  }}
                />
              </div>
              <button
                onClick={() => onPlanTrip(heroPrompt)}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shrink-0 transition-all transform active:scale-95"
              >
                <span>Create my trip</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Quick Prompt Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-3 px-2 text-left custom-scrollbar border-t border-space-border/50 mt-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-typo-muted shrink-0">Try:</span>
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setHeroPrompt(p)}
                  className="shrink-0 text-xs px-3 py-1 rounded-xl bg-space-secondary text-typo-secondary hover:text-brand-primary hover:bg-brand-primary/10 transition-colors truncate max-w-[240px]"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onPlanTrip()}
              className="px-8 py-4 rounded-2xl bg-space-card border-2 border-space-border hover:border-brand-glow text-typo-primary font-black text-xs uppercase tracking-wider flex items-center gap-3 shadow-lg hover:shadow-brand-primary/10 transition-all"
            >
              <Compass size={18} className="text-brand-glow" />
              <span>Explore AI Studio</span>
            </button>
            <button
              onClick={onExploreDestinations}
              className="px-8 py-4 rounded-2xl bg-space-secondary hover:bg-space-card text-typo-primary font-black text-xs uppercase tracking-wider flex items-center gap-3 border border-space-border transition-all"
            >
              <Globe2 size={18} className="text-brand-primary" />
              <span>Explore Destinations</span>
            </button>
          </div>

          {/* Social Proof & Metrics */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-typo-secondary border-t border-space-border/40">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-typo-primary">100%</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-typo-muted">Synchronized Trip OS</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-typo-primary">12+</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-typo-muted">Integrated Tools In One</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-brand-glow">₹0 Fee</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-typo-muted">Free Community Access</span>
            </div>
          </div>

        </div>
      </section>

      {/* ─── THE CONNECTED TRAVEL OPERATING SYSTEM ─────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-brand-glow font-black text-xs uppercase tracking-[0.3em]">
            <Zap size={16} /> Everything Connected
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-typo-primary tracking-tight">
            Not separate widgets. One continuous journey.
          </h2>
          <p className="text-typo-secondary font-medium text-base">
            When you add a hotel or activity, it automatically updates your Itinerary, Map, Budget, Documents vault, and Group expense split.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Sparkles className="text-brand-glow" size={26} />,
              title: "AI Trip Architect",
              desc: "Generate structured, realistic day-by-day plans with exact coordinates, realistic costs in INR, and transit logic."
            },
            {
              icon: <Compass className="text-brand-glow" size={26} />,
              title: "Interactive Route Map",
              desc: "See every stop, stay, and transit segment sequenced on an interactive map with walking and driving times."
            },
            {
              icon: <Wallet className="text-brand-glow" size={26} />,
              title: "Budget & Expense Splitting",
              desc: "Track planned vs actual spend by category. Split group expenses and settle balances between friends effortlessly."
            },
            {
              icon: <Luggage className="text-brand-glow" size={26} />,
              title: "Weather-Smart Packing",
              desc: "Dynamic packing checklists tailored to your destination's forecast, trip length, and planned activities."
            },
            {
              icon: <FileText className="text-brand-glow" size={26} />,
              title: "Secure Document Vault",
              desc: "Store boarding passes, visas, and hotel vouchers safely linked directly to the specific day and booking."
            },
            {
              icon: <BookOpen className="text-brand-glow" size={26} />,
              title: "Journal & Memory Reels",
              desc: "Log daily reflections and photos. Generate animated vertical travel reels of your favorite highlights."
            }
          ].map((feature, idx) => (
            <div 
              key={idx}
              className="bg-space-card rounded-3xl p-8 border border-space-border hover:border-brand-primary/50 transition-all duration-300 shadow-xl space-y-4 group hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-space-secondary flex items-center justify-center border border-space-border group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-extrabold text-typo-primary tracking-tight">{feature.title}</h3>
              <p className="text-sm font-medium text-typo-secondary leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TRENDING DESTINATIONS SECTION ───────────────────────── */}
      <section className="py-20 bg-space-secondary/40 border-y border-space-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-glow">Curated Inspiration</span>
              <h2 className="text-4xl font-black text-typo-primary tracking-tight mt-1">Trending Destinations</h2>
            </div>
            <button
              onClick={onExploreDestinations}
              className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-brand-primary hover:text-brand-glow transition-colors"
            >
              <span>View All 20+ Guides</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {CURATED_DESTINATIONS.slice(0, 3).map((dest) => (
              <div
                key={dest.id}
                onClick={() => onViewDestination(dest.id)}
                className="bg-space-card rounded-3xl overflow-hidden border border-space-border hover:border-brand-primary/50 shadow-xl group cursor-pointer transition-all duration-300 hover:-translate-y-1.5 flex flex-col"
              >
                <div className="relative h-60 overflow-hidden">
                  <img 
                    src={dest.imageUrl} 
                    alt={dest.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-space-card/80 backdrop-blur-md border border-space-border text-[10px] font-black uppercase tracking-wider text-typo-primary">
                    {dest.category}
                  </div>
                  <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-space-main/90 backdrop-blur-md border border-space-border text-xs font-black text-brand-glow">
                    ₹{(dest.avgBudgetMin / 1000).toFixed(0)}K – ₹{(dest.avgBudgetMax / 1000).toFixed(0)}K
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-typo-primary tracking-tight">{dest.name}</h3>
                      <span className="text-xs font-bold text-typo-secondary">{dest.country}</span>
                    </div>
                    <p className="text-xs font-medium text-typo-secondary line-clamp-2 leading-relaxed">
                      {dest.tagline}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-space-border flex items-center justify-between">
                    <span className="text-[11px] font-bold text-typo-muted">Best: {dest.bestTimeToVisit.split('(')[0]}</span>
                    <span className="text-xs font-extrabold text-brand-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Explore <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── COMMUNITY TEMPLATES SECTION ─────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-primary">Remixable Itineraries</span>
            <h2 className="text-4xl font-black text-typo-primary tracking-tight mt-1">Community Expeditions</h2>
          </div>
          <button
            onClick={onViewCommunity}
            className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-brand-primary hover:text-brand-glow transition-colors"
          >
            <span>Explore Community Vault</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {INITIAL_COMMUNITY_TEMPLATES.map((tmpl) => (
            <div 
              key={tmpl.id}
              className="bg-space-card rounded-[2.5rem] p-6 sm:p-8 border border-space-border hover:border-brand-glow/40 shadow-2xl transition-all duration-300 flex flex-col sm:flex-row gap-6 items-center"
            >
              <img 
                src={tmpl.coverImage} 
                alt={tmpl.title} 
                className="w-full sm:w-48 h-48 rounded-2xl object-cover shrink-0"
              />
              <div className="space-y-4 flex-1 w-full">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-[10px] font-extrabold uppercase tracking-wider">
                    {tmpl.duration} Days • {tmpl.citiesCount} Cities
                  </span>
                  <span className="text-xs font-black text-typo-muted flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" /> {tmpl.likes}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-black text-typo-primary leading-tight tracking-tight">{tmpl.title}</h4>
                  <p className="text-xs font-semibold text-brand-glow mt-1">Estimated ₹{tmpl.estimatedBudget.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-space-border">
                  <span className="text-xs font-bold text-typo-secondary">By {tmpl.author.name}</span>
                  <button
                    onClick={onViewCommunity}
                    className="px-4 py-2 rounded-xl bg-space-secondary hover:bg-brand-primary hover:text-space-main text-xs font-bold transition-colors"
                  >
                    View & Remix
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM CALL TO ACTION ──────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="bg-gradient-to-br from-space-card via-space-secondary to-space-card border-2 border-space-border rounded-[3rem] p-12 sm:p-16 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-glow/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-typo-primary tracking-tight">
              Ready to architect your journey?
            </h2>
            <p className="text-sm sm:text-base font-medium text-typo-secondary max-w-xl mx-auto">
              Join thousands of modern travelers who plan complete, multi-city itineraries with AI in seconds.
            </p>
          </div>

          <button
            onClick={() => onPlanTrip()}
            className="px-10 py-5 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-sm uppercase tracking-widest shadow-2xl transition-all transform active:scale-95 inline-flex items-center gap-3"
          >
            <Sparkles size={18} />
            <span>Launch Trip Planner</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

    </div>
  );
};

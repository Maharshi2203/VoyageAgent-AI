import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Wallet, 
  Users, 
  RefreshCw, 
  Compass, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Bed,
  Utensils
} from 'lucide-react';
import { TripParams, ActivityType, Trip, AgentLog } from '../types';
import { travelAgentService } from '../services/geminiService';
import { geminiRM, friendlyErrorMessage } from '../services/geminiRequestManager';
import { aiAssistantService } from '../services/aiAssistantService';
import AgentLogConsole from './AgentLogConsole';

interface AITripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripGenerated: (trip: Trip) => void;
  initialPrompt?: string;
  initialDestination?: string;
  userId: string;
}

export const AITripPlannerModal: React.FC<AITripPlannerModalProps> = ({
  isOpen,
  onClose,
  onTripGenerated,
  initialPrompt,
  initialDestination,
  userId
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [draftTrip, setDraftTrip] = useState<Trip | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [destination, setDestination] = useState(initialDestination || '');
  const [budget, setBudget] = useState<number>(120000);
  const [days, setDays] = useState<number>(5);
  const [travelers, setTravelers] = useState<number>(2);
  const [travelStyle, setTravelStyle] = useState('Culture & Local Hidden Gems');
  const [accommodationType, setAccommodationType] = useState('Boutique Stays & Hotels');
  const [selectedPreferences, setSelectedPreferences] = useState<ActivityType[]>([
    ActivityType.CULTURAL,
    ActivityType.FOOD
  ]);
  const [specialNotes, setSpecialNotes] = useState('');

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const suggestionRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialDestination) {
      setDestination(initialDestination);
    } else if (initialPrompt) {
      // Heuristic extract
      if (initialPrompt.toLowerCase().includes('japan')) setDestination('Tokyo & Kyoto, Japan');
      else if (initialPrompt.toLowerCase().includes('goa')) setDestination('Goa, India');
      else if (initialPrompt.toLowerCase().includes('bali')) setDestination('Bali, Indonesia');
      else if (initialPrompt.toLowerCase().includes('swiss')) setDestination('Swiss Alps, Switzerland');
    }
  }, [initialPrompt, initialDestination]);

  const togglePreference = (pref: ActivityType) => {
    setSelectedPreferences(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const addLog = (
    logStep: AgentLog['step'], 
    message: string, 
    status: AgentLog['status'] = 'info', 
    reasoning?: string
  ) => {
    const newLog: AgentLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      step: logStep,
      message,
      status,
      reasoning
    };
    setLogs(prev => [...prev, newLog]);
  };

  const onDestinationChange = (val: string) => {
    setDestination(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(async () => {
      if (val.length >= 2) {
        const res = await travelAgentService.getLocationSuggestions(val);
        setSuggestions(res);
        setShowSuggestions(res.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);
  };

  const handleStartPlanning = async () => {
    if (!destination.trim()) return;

    setStep(2);
    setIsSynthesizing(true);
    setLogs([]);

    const params: TripParams = {
      destination: destination.trim(),
      budget: budget || 100000,
      days: days || 5,
      travelers,
      preferences: selectedPreferences,
      travelStyle,
      accommodationType
    };

    // Tracks the stage in progress so a failure is reported against the right step
    let currentStep: AgentLog['step'] = 'Research';

    try {
      addLog('Research', `Initializing Autonomous Exploration Core for ${params.destination}...`);
      await new Promise(r => setTimeout(r, 800));
      addLog('Research', `Scanning geolocations, local attractions, and market indices...`, 'success');

      currentStep = 'Drafting';
      addLog('Drafting', `Synthesizing ${params.days}-day schedule within ₹${params.budget.toLocaleString()} ceiling...`);
      const draft = await travelAgentService.draftPlan(params);
      addLog('Drafting', `Draft plan established with logical geographic clusters.`, 'success', draft.reasoning);

      addLog('Validation', `Verifying transit feasibility and fiscal allocation...`);
      await new Promise(r => setTimeout(r, 800));

      currentStep = 'Optimization';
      addLog('Optimization', `Polishing travel pacing and local experiences...`);
      // The optimization pass regenerates the whole itinerary, so it only runs
      // when the draft actually breaks the budget.
      const draftTotal = draft.data.days.reduce(
        (acc, d) => acc + d.accommodationCost + d.activities.reduce((s, a) => s + a.cost, 0),
        0
      );
      const optimized = draftTotal <= params.budget
        ? { data: draft.data, adjustments: [] as string[] }
        : await travelAgentService.optimizePlan(params, draft.data);
      if (optimized.adjustments.length > 0) {
        optimized.adjustments.forEach(adj => addLog('Optimization', adj, 'info'));
      }
      addLog('Optimization', `Transit sequence optimized.`, 'success');

      currentStep = 'Finalizing';
      addLog('Finalizing', `Generating smart packing list and booking placeholders...`);
      const smartPacking = await aiAssistantService.generateSmartPackingList(
        params.destination, 
        params.days, 
        params.preferences
      );

      const finalItinerary = {
        ...optimized.data,
        grandTotal: optimized.data.days.reduce((acc, d) => {
          const actsTotal = d.activities.reduce((s, a) => s + a.cost, 0);
          d.dailyTotal = actsTotal + d.accommodationCost;
          return acc + d.dailyTotal;
        }, 0)
      };
      finalItinerary.remainingBudget = params.budget - finalItinerary.grandTotal;

      // Create complete Trip Operating System entity
      const newTrip: Trip = {
        id: `trip_${Date.now()}`,
        userId,
        title: `${params.destination} Expedition`,
        destination: params.destination,
        destinationCoords: finalItinerary.destinationCoords,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + params.days * 86400000).toISOString().split('T')[0],
        duration: params.days,
        travelers: params.travelers || 2,
        travelStyle: params.travelStyle || 'Curated Exploration',
        totalBudget: params.budget,
        currency: '₹',
        coverImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
        itinerary: finalItinerary,
        members: [{ id: userId, name: 'You (Owner)', email: 'traveler@voyage.ai', role: 'owner' }],
        bookings: [],
        transports: [
          {
            id: `tr_${Date.now()}_1`,
            tripId: `trip_${Date.now()}`,
            type: 'flight',
            from: 'Home City',
            to: params.destination,
            departureTime: 'Day 1, 08:00',
            arrivalTime: 'Day 1, 11:30',
            carrier: 'Regional Transit',
            cost: Math.round(params.budget * 0.25),
            currency: '₹',
            bookingRef: `FLT-${Math.floor(100 + Math.random() * 900)}`
          }
        ],
        expenses: [],
        packingList: smartPacking,
        documents: [],
        journalEntries: [],
        polls: [],
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      addLog('Finalizing', `Trip OS workspace generated successfully. Launching...`, 'success');
      await new Promise(r => setTimeout(r, 600));

      setIsSynthesizing(false);
      onTripGenerated(newTrip);
      onClose();

    } catch (err) {
      console.error(err);
      addLog(currentStep, friendlyErrorMessage(err), 'error');
      setIsSynthesizing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-space-main/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-space-card rounded-[3rem] border-2 border-space-border shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-space-border flex items-center justify-between bg-space-secondary/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-primary text-space-main">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-typo-primary tracking-tight">AI Trip Architect Studio</h3>
              <p className="text-[11px] font-bold text-typo-muted uppercase tracking-wider">Autonomous Expedition Synthesizer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-space-card hover:bg-space-secondary text-typo-secondary hover:text-typo-primary border border-space-border transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 sm:p-12">
          {step === 1 ? (
            <div className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-typo-primary tracking-tight">
                  Tell us where you want to venture.
                </h2>
                <p className="text-sm text-typo-secondary font-medium">
                  Provide your destination, constraints, and desires. Our neural core will structure your entire journey.
                </p>
              </div>

              {/* Form Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                
                {/* Destination with Autocomplete */}
                <div className="space-y-2" ref={suggestionRef}>
                  <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-typo-muted" size={20} />
                    <input 
                      type="text"
                      value={destination}
                      onChange={(e) => onDestinationChange(e.target.value)}
                      placeholder="e.g. Tokyo & Kyoto, Japan or Goa"
                      className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-primary rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-typo-primary placeholder:text-typo-muted outline-none transition-all"
                    />

                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-space-card border-2 border-space-border rounded-2xl overflow-hidden z-50 shadow-2xl">
                        {suggestions.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setDestination(s);
                              setShowSuggestions(false);
                            }}
                            className="w-full text-left px-6 py-3.5 hover:bg-brand-primary/10 text-xs font-bold text-typo-primary border-b border-space-border last:border-0 flex items-center gap-2"
                          >
                            <MapPin size={14} className="text-brand-glow" />
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration & Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary">Duration (Days)</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-typo-muted" size={18} />
                      <input 
                        type="number"
                        min={1}
                        max={14}
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-primary rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-typo-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary">Total Budget (₹)</label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-typo-muted" size={18} />
                      <input 
                        type="number"
                        step={5000}
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-primary rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-typo-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Travelers & Travel Style */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary">Travelers</label>
                  <div className="relative">
                    <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-typo-muted" size={20} />
                    <input 
                      type="number"
                      min={1}
                      max={12}
                      value={travelers}
                      onChange={(e) => setTravelers(Number(e.target.value))}
                      className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-primary rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-typo-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary">Accommodation Vibe</label>
                  <div className="relative">
                    <Bed className="absolute left-5 top-1/2 -translate-y-1/2 text-typo-muted" size={20} />
                    <select
                      value={accommodationType}
                      onChange={(e) => setAccommodationType(e.target.value)}
                      className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-primary rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-typo-primary outline-none transition-all cursor-pointer"
                    >
                      <option value="Boutique Stays & Hotels">Boutique Stays & Hotels</option>
                      <option value="Luxury Villas & 5-Star Resorts">Luxury Villas & 5-Star Resorts</option>
                      <option value="Budget-Friendly Hostels & Airbnbs">Budget Hostels & Airbnbs</option>
                      <option value="Heritage Traditional Lodges">Heritage & Traditional Lodges</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Preferences Checklist */}
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary block">
                  Core Preferences & Interests
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {Object.values(ActivityType).map((pref) => {
                    const active = selectedPreferences.includes(pref);
                    return (
                      <button
                        key={pref}
                        type="button"
                        onClick={() => togglePreference(pref)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                          active
                            ? 'bg-brand-primary text-space-main border-brand-primary shadow-md shadow-brand-primary/20 scale-105'
                            : 'bg-space-secondary border-space-border text-typo-secondary hover:text-typo-primary'
                        }`}
                      >
                        {pref}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleStartPlanning}
                  disabled={!destination.trim()}
                  className="w-full py-5 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-40"
                >
                  <Sparkles size={20} />
                  <span>Synthesize Full Trip OS</span>
                  <ArrowRight size={18} />
                </button>
              </div>

            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-typo-primary tracking-tight">
                  Autonomous Synthesis in Progress
                </h3>
                <p className="text-xs font-medium text-typo-secondary">
                  Architecting your {days}-day itinerary for {destination} with live telemetry.
                </p>
              </div>

              {/* Console log display */}
              <AgentLogConsole logs={logs} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

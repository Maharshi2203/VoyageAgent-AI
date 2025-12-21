import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Plane, 
  Wallet, 
  Calendar as CalendarIcon, 
  MapPin, 
  ChevronRight, 
  Sparkles, 
  Download, 
  RefreshCw,
  Search,
  CheckCircle2,
  Globe,
  Compass,
  Wind,
  Zap,
  Moon,
  Sun
} from 'lucide-react';
import { TripParams, ActivityType, Itinerary, AgentLog } from './types';
import { travelAgentService } from './services/geminiService';
import AgentLogConsole from './components/AgentLogConsole';
import BudgetGauge from './components/BudgetGauge';
import ItineraryCard from './components/ItineraryCard';
import AnimatedBackground from './components/AnimatedBackground';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('voyage-theme');
    if (saved) return saved as 'dark' | 'light';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  const [params, setParams] = useState<TripParams>({
    destination: 'Kyoto, Japan',
    budget: 250000,
    days: 7,
    preferences: [ActivityType.CULTURAL, ActivityType.FOOD, ActivityType.RELAXATION]
  });

  const [isPlanning, setIsPlanning] = useState(false);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('voyage-theme', theme);
    
    // Smooth transition helper
    root.classList.add('theme-transition');
    const timer = setTimeout(() => root.classList.remove('theme-transition'), 300);
    return () => clearTimeout(timer);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const addLog = (step: AgentLog['step'], message: string, status: AgentLog['status'] = 'info', reasoning?: string) => {
    const newLog: AgentLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      step,
      message,
      status,
      reasoning
    };
    setLogs(prev => [...prev, newLog]);
  };

  const runAgent = async () => {
    setIsPlanning(true);
    setLogs([]);
    setItinerary(null);
    setActiveStep(1);

    try {
      addLog('Research', `Initializing ${theme === 'dark' ? 'Sage-Space' : 'Nature-Core'} research for ${params.destination}...`);
      await new Promise(r => setTimeout(r, 1200));
      addLog('Research', `AI successfully identified local nodes and high-affinity locations.`, 'success');
      
      addLog('Drafting', `Drafting autonomous itinerary logic...`);
      const draftResult = await travelAgentService.draftPlan(params);
      addLog('Drafting', `Initial structure synthesized. Logical clustering complete.`, 'success', draftResult.reasoning);
      setActiveStep(2);

      addLog('Validation', `Cross-referencing logistics with ₹${params.budget.toLocaleString()} constraints...`);
      await new Promise(r => setTimeout(r, 1000));
      
      const currentTotal = draftResult.data.days.reduce((acc, d) => acc + d.activities.reduce((sum, a) => sum + a.cost, 0) + d.accommodationCost, 0);
      
      if (currentTotal > params.budget) {
        addLog('Validation', `Budget violation detected: Projected spend ₹${currentTotal.toLocaleString()} exceeds cap.`, 'warning');
        addLog('Optimization', `Executing AI cost-balancing protocols...`);
      } else {
        addLog('Validation', `Budget validation: PASS.`, 'success');
      }
      
      setActiveStep(3);
      const optimizedResult = await travelAgentService.optimizePlan(params, draftResult.data);
      
      if (optimizedResult.adjustments.length > 0) {
        optimizedResult.adjustments.forEach(adj => addLog('Optimization', adj, 'info'));
        addLog('Optimization', `Logistics refined for maximum transit efficiency.`, 'success');
      }
      
      setActiveStep(4);
      addLog('Finalizing', `Rendering visual analytics and expedition manifest...`);
      await new Promise(r => setTimeout(r, 1200));

      const finalItinerary = {
        ...optimizedResult.data,
        grandTotal: optimizedResult.data.days.reduce((acc, d) => {
          const dailyActivitiesTotal = d.activities.reduce((sum, a) => sum + a.cost, 0);
          d.dailyTotal = dailyActivitiesTotal + d.accommodationCost;
          return acc + d.dailyTotal;
        }, 0)
      };
      finalItinerary.remainingBudget = params.budget - finalItinerary.grandTotal;

      setItinerary(finalItinerary);
      addLog('Finalizing', `Expedition Architecture for ${params.destination} ready for deployment.`, 'success');
      setActiveStep(5);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500);

    } catch (error) {
      console.error(error);
      addLog('Finalizing', `System Error: ${error instanceof Error ? error.message : 'Unknown Fault'}`, 'error');
    } finally {
      setIsPlanning(false);
    }
  };

  const exportItinerary = () => {
    if (!itinerary) return;
    let text = `VOYAGEAGENT - EXPEDITION MANIFEST\n================================\n\n`;
    text += `Target: ${itinerary.destination}\nDuration: ${itinerary.duration} Days\nCap: ₹${params.budget.toLocaleString()}\nTotal Cost: ₹${itinerary.grandTotal.toLocaleString()}\n\n`;
    itinerary.days.forEach(day => {
      text += `PHASE ${day.day}\n----------------\nStay: ₹${day.accommodationCost.toLocaleString()}\n`;
      day.activities.forEach(a => text += `[${a.timeSlot}] ${a.name} (₹${a.cost.toLocaleString()}) - ${a.location}\n`);
      text += `Day Total: ₹${day.dailyTotal.toLocaleString()}\n\n`;
    });
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Voyage_Manifest_${itinerary.destination.replace(/\s/g, '_')}.txt`;
    link.click();
  };

  const chartData = itinerary ? itinerary.days.map(d => ({
    name: `D${d.day}`,
    Activities: d.activities.reduce((sum, a) => sum + a.cost, 0),
    Stay: d.accommodationCost
  })) : [];

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Dynamic Animated Background */}
      <AnimatedBackground theme={theme} />
      
      {/* Structural Grid */}
      <div className="fixed inset-0 bg-grid -z-10 pointer-events-none"></div>
      
      {/* Background Ambience */}
      <div className="fixed top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-glow/10 rounded-full blur-[160px] -z-10 animate-pulse transition-colors duration-1000"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[140px] -z-10 transition-colors duration-1000"></div>

      {/* Header */}
      <nav className="sticky top-0 z-50 glass-morphism border-b border-space-border/50 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="bg-brand-primary p-2.5 rounded-xl shadow-lg shadow-brand-primary/20 group-hover:rotate-12 transition-transform duration-500">
              <Zap className="text-space-main" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-typo-primary leading-none uppercase">
                VOYAGE<span className="text-brand-glow">AGENT</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-typo-secondary">
                Sage Intelligence Engine
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 md:gap-8">
            <button 
              onClick={toggleTheme}
              className="p-3 rounded-2xl bg-space-secondary border border-space-border text-brand-primary hover:bg-space-card transition-all transform active:scale-90"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="h-8 w-[1px] bg-space-border hidden md:block"></div>
            <button 
              onClick={exportItinerary}
              disabled={!itinerary}
              className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest text-typo-secondary hover:text-brand-glow disabled:opacity-30 transition-all"
            >
              <Download size={16} /> Get Manifest
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-8 lg:p-12 space-y-16">
        {/* Planning Engine Form */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 staggered-entry" style={{ animationDelay: '0.1s' }}>
            <div className="card-deep rounded-[2.5rem] p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-[0.05]">
                <Wind size={220} className="text-brand-glow" />
              </div>
              
              <div className="flex flex-col space-y-2 mb-12">
                <div className="flex items-center gap-2 text-brand-glow mb-1">
                  <Sparkles size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em]">Neural Interface Warmup</span>
                </div>
                <h2 className="text-4xl font-black text-typo-primary tracking-tighter leading-none">Architect Your Expedition.</h2>
                <p className="text-typo-secondary font-medium text-sm">Deploy our autonomous travel agent to synchronize your next world-class journey.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] ml-1">Target Node</label>
                  <div className="relative group">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-typo-muted group-focus-within:text-brand-glow transition-colors" size={22} />
                    <input 
                      type="text" 
                      value={params.destination}
                      onChange={e => setParams(p => ({ ...p, destination: e.target.value }))}
                      placeholder="e.g. Kyoto, Japan"
                      className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-glow rounded-2xl py-6 pl-16 pr-8 outline-none transition-all text-typo-primary font-bold placeholder:text-typo-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] ml-1">Capital (₹)</label>
                    <div className="relative group">
                      <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 text-typo-muted group-focus-within:text-brand-glow transition-colors" size={22} />
                      <input 
                        type="number" 
                        value={params.budget}
                        onChange={e => setParams(p => ({ ...p, budget: Number(e.target.value) }))}
                        className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-glow rounded-2xl py-6 pl-16 pr-8 outline-none transition-all text-typo-primary font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] ml-1">Cycles (Days)</label>
                    <div className="relative group">
                      <CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-typo-muted group-focus-within:text-brand-glow transition-colors" size={22} />
                      <input 
                        type="number" 
                        value={params.days}
                        min={1}
                        max={14}
                        onChange={e => setParams(p => ({ ...p, days: Number(e.target.value) }))}
                        className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-glow rounded-2xl py-6 pl-16 pr-8 outline-none transition-all text-typo-primary font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 space-y-6">
                <label className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] ml-1">Expedition Signatures</label>
                <div className="flex flex-wrap gap-4">
                  {Object.values(ActivityType).map(pref => (
                    <button
                      key={pref}
                      onClick={() => setParams(p => ({ ...p, preferences: p.preferences.includes(pref) ? p.preferences.filter(x => x !== pref) : [...p.preferences, pref] }))}
                      className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all duration-300 ${
                        params.preferences.includes(pref) 
                        ? 'chip-selected shadow-lg shadow-brand-primary/20 scale-105 border-transparent' 
                        : 'bg-space-card border-space-border text-typo-secondary hover:border-brand-glow hover:text-brand-glow'
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-16">
                <button 
                  onClick={runAgent}
                  disabled={isPlanning || !params.destination}
                  className="w-full btn-primary font-black py-8 rounded-3xl shadow-2xl flex items-center justify-center gap-6 group transition-all transform active:scale-[0.98] disabled:opacity-40"
                >
                  {isPlanning ? (
                    <>
                      <RefreshCw size={28} className="animate-spin" />
                      <span className="tracking-[0.3em] uppercase text-sm">Synthesizing Logic...</span>
                    </>
                  ) : (
                    <>
                      <span className="tracking-[0.2em] uppercase text-base">Initialize Expedition Core</span>
                      <ChevronRight size={24} className="group-hover:translate-x-3 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-10 staggered-entry" style={{ animationDelay: '0.3s' }}>
            <AgentLogConsole logs={logs} />
            
            <div className="bg-space-card rounded-[2.5rem] p-10 shadow-xl border border-space-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-glow/5 rounded-full -translate-y-16 translate-x-16"></div>
              <h3 className="text-[11px] font-black text-typo-primary mb-10 flex items-center gap-3 uppercase tracking-[0.3em]">
                <Search size={18} className="text-brand-glow" />
                Processing Manifest
              </h3>
              <div className="space-y-8">
                {[
                  { id: 1, label: 'Geo-Signal Scan', desc: 'Regional node identification' },
                  { id: 2, label: 'Fiscal Balancing', desc: 'Budget boundary validation' },
                  { id: 3, label: 'Vector Optimization', desc: 'Experience flow architecting' },
                  { id: 4, label: 'Manifest Output', desc: 'Finalizing visual render' },
                ].map((step) => (
                  <div key={step.id} className="flex items-start gap-6">
                    <div className={`mt-1 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 transition-all duration-500 border-2 ${
                      activeStep === step.id ? 'bg-brand-glow border-brand-glow text-space-main ai-glow animate-pulse' : 
                      activeStep > step.id ? 'bg-brand-primary border-brand-primary text-space-main' : 'bg-space-main text-typo-muted border-space-border/50'
                    }`}>
                      {activeStep > step.id ? <CheckCircle2 size={16} /> : step.id}
                    </div>
                    <div>
                      <p className={`text-sm font-black ${activeStep >= step.id ? 'text-typo-primary' : 'text-typo-muted'}`}>{step.label}</p>
                      <p className="text-[10px] text-typo-secondary font-bold uppercase tracking-widest">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Area */}
        {itinerary && (
          <div ref={resultsRef} className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b-2 border-space-border">
                  <div>
                    <div className="flex items-center gap-2 text-brand-glow mb-3">
                      <Globe size={20} className="animate-pulse" />
                      <span className="text-[11px] font-black uppercase tracking-[0.4em]">Expedition Verified</span>
                    </div>
                    <h2 className="text-5xl font-black text-typo-primary leading-none tracking-tighter">
                      The {itinerary.destination} <span className="text-brand-primary">Protocol</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 text-brand-glow bg-brand-glow/10 px-8 py-4 rounded-2xl border border-brand-glow/20 shadow-md">
                    <CheckCircle2 size={22} />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Capped at ₹{params.budget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-8">
                  {itinerary.days.map((dayPlan) => (
                    <ItineraryCard key={dayPlan.day} dayPlan={dayPlan} currency="₹" />
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-10">
                <BudgetGauge 
                  total={params.budget} 
                  spent={itinerary.grandTotal} 
                  currency="₹" 
                />

                <div className="bg-space-card rounded-[2.5rem] p-10 shadow-xl border border-space-border">
                  <h3 className="text-typo-muted font-black text-[11px] uppercase tracking-[0.3em] mb-10">Resource Allocation</h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--space-border)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 800 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 800 }} />
                        <RechartsTooltip 
                          cursor={{ fill: 'var(--space-main)', radius: 16 }}
                          contentStyle={{ background: 'var(--space-card)', borderRadius: '24px', border: '1px solid var(--space-border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px', color: 'var(--text-primary)' }}
                        />
                        <Bar dataKey="Stay" stackId="a" fill="var(--space-border)" radius={[0, 0, 0, 0]} barSize={32} />
                        <Bar dataKey="Activities" stackId="a" fill="var(--brand-primary)" radius={[10, 10, 0, 0]} barSize={32} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-8 mt-8">
                    <div className="flex items-center gap-3 text-[11px] font-black text-typo-secondary uppercase tracking-widest">
                      <div className="w-4 h-4 bg-space-border rounded-lg"></div> Stay
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-black text-typo-secondary uppercase tracking-widest">
                      <div className="w-4 h-4 bg-brand-primary rounded-lg"></div> Activities
                    </div>
                  </div>
                </div>

                <div className="bg-space-secondary border border-space-border rounded-[3.5rem] p-12 text-typo-primary shadow-2xl relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 p-8 opacity-[0.05]">
                    <Compass size={160} className="text-brand-glow" />
                  </div>
                  <h3 className="font-black text-2xl mb-10 tracking-tighter">Manifest Summary</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-typo-muted text-xs font-black uppercase tracking-widest">Est. Burn</span>
                      <span className="font-black text-2xl text-brand-primary">₹{itinerary.grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-typo-muted text-xs font-black uppercase tracking-widest">Reserves</span>
                      <span className={`font-black text-2xl ${itinerary.remainingBudget >= 0 ? 'text-brand-glow' : 'text-red-400'}`}>
                        ₹{Math.abs(itinerary.remainingBudget).toLocaleString()}
                        {itinerary.remainingBudget < 0 ? ' OVERRUN' : ''}
                      </span>
                    </div>
                    <div className="h-[1px] bg-space-border my-8"></div>
                    <p className="text-typo-muted text-[11px] font-bold leading-relaxed italic uppercase tracking-wider">
                      "Autonomous simulations based on high-frequency market averages for {itinerary.destination}."
                    </p>
                  </div>
                  <button 
                    onClick={exportItinerary}
                    className="w-full mt-12 bg-brand-primary hover:bg-brand-glow text-space-main font-black py-6 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-4 group"
                  >
                    <Download size={22} className="group-hover:translate-y-1 transition-transform" />
                    <span className="text-xs uppercase tracking-[0.3em]">Acquire manifest protocol</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!itinerary && !isPlanning && (
          <div className="h-[45vh] flex flex-col items-center justify-center text-center space-y-8 text-typo-muted soft-float">
            <div className="w-32 h-32 bg-space-card rounded-[3.5rem] flex items-center justify-center mb-6 rotate-6 shadow-2xl border border-space-border">
              <Compass size={64} className="text-brand-glow" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-typo-primary tracking-tighter uppercase">Neural core initialized.</h3>
              <p className="max-w-md mx-auto text-base font-bold text-typo-secondary uppercase tracking-[0.2em]">Awaiting authorized travel vectors...</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-space-border py-20 mt-20 bg-space-main">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-5">
            <div className="bg-brand-primary p-3 rounded-2xl shadow-md shadow-brand-primary/20">
              <Plane size={24} className="text-space-main" />
            </div>
            <span className="font-black tracking-tighter text-typo-primary text-2xl uppercase">VOYAGE<span className="text-brand-glow">AGENT</span></span>
          </div>
          <p className="text-typo-muted text-[11px] font-black uppercase tracking-[0.4em] text-center">
            Pioneering Autonomous Travel Intelligence. Powered by Sage.
          </p>
          <div className="flex gap-10 text-[11px] font-black uppercase tracking-widest text-typo-muted">
            <a href="#" className="hover:text-brand-glow transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-glow transition-colors">Ethics</a>
            <a href="#" className="hover:text-brand-glow transition-colors">Architecture</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
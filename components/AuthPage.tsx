import React, { useState } from 'react';
import { Zap, Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, Compass, CheckCircle2 } from 'lucide-react';
import { User as UserType } from '../types';

import { databaseService } from '../services/databaseService';

interface AuthPageProps {
  onLogin: (user: UserType) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, theme, toggleTheme }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isSignUp && !name) {
      setError('Please enter your full name.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const res = await databaseService.signUpUser(name, email, password);
        setIsLoading(false);
        if (res.success && res.user) {
          onLogin(res.user);
        } else {
          setError(res.error || 'Failed to create account.');
        }
      } else {
        const res = await databaseService.signInUser(email, password);
        setIsLoading(false);
        if (res.success && res.user) {
          onLogin(res.user);
        } else {
          setError(res.error || 'Invalid email or password.');
        }
      }
    } catch {
      setIsLoading(false);
      setError('Authentication failed. Please try again.');
    }
  };

  const handleQuickDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        id: 'usr_demo_77',
        name: 'Captain Alex Vance',
        email: 'alex.vance@voyageagent.ai'
      });
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-space-main text-typo-primary transition-colors duration-300">
      {/* Dynamic Background Ambience */}
      <div className="fixed top-[-15%] right-[-10%] w-[55%] h-[55%] bg-brand-glow/10 rounded-full blur-[140px] -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-15%] left-[-10%] w-[45%] h-[45%] bg-brand-primary/10 rounded-full blur-[130px] -z-10"></div>
      <div className="fixed top-[40%] left-[50%] -translate-x-1/2 w-[30%] h-[30%] bg-brand-glow/5 rounded-full blur-[160px] -z-10"></div>

      {/* Header Bar */}
      <header className="px-8 py-6 flex items-center justify-between max-w-7xl mx-auto w-full z-20">
        <div className="flex items-center gap-4">
          <div className="bg-brand-primary p-3 rounded-2xl shadow-xl shadow-brand-primary/20">
            <Zap className="text-space-main" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tighter text-typo-primary uppercase leading-none">
              VOYAGE<span className="text-brand-glow">AGENT</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-typo-secondary">
              Sage Intelligence Engine
            </span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-space-secondary border border-space-border text-brand-primary hover:bg-space-card transition-all transform active:scale-95"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <Sparkles size={20} />
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 grid lg:grid-cols-12 gap-12 items-center z-10">
        
        {/* Left Side: Hero Info */}
        <div className="lg:col-span-6 space-y-8 pr-0 lg:pr-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-glow text-xs font-extrabold uppercase tracking-widest">
            <ShieldCheck size={16} />
            <span>Encrypted Agent Gateway v3.6</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-typo-primary leading-[1.1]">
            Architect Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-glow to-brand-tech">
              Next Expedition.
            </span>
          </h1>

          <p className="text-typo-secondary font-medium text-base md:text-lg leading-relaxed max-w-xl">
            Sign in to unlock autonomous multi-agent travel design, real-time budget optimization, and AI itinerary architecture.
          </p>

          <div className="space-y-4 pt-4 border-t border-space-border/60 max-w-lg">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-glow mt-0.5">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-typo-primary">Autonomous Fiscal Protocol</h4>
                <p className="text-xs text-typo-secondary font-medium">Automatic expense balancing ensuring zero budget breaches.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-glow mt-0.5">
                <Compass size={20} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-typo-primary">Real-time Location Clustering</h4>
                <p className="text-xs text-typo-secondary font-medium">Geographic route optimization for maximum transit efficiency.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="lg:col-span-6 flex justify-center w-full">
          <div className="w-full max-w-md card-deep rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden bg-space-card border-2 border-space-border">
            
            {/* Header / Tab Switcher */}
            <div className="flex bg-space-secondary p-1.5 rounded-2xl mb-8 border border-space-border">
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(''); }}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                  !isSignUp 
                    ? 'bg-brand-primary text-space-main shadow-lg shadow-brand-primary/20' 
                    : 'text-typo-secondary hover:text-typo-primary'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(''); }}
                className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                  isSignUp 
                    ? 'bg-brand-primary text-space-main shadow-lg shadow-brand-primary/20' 
                    : 'text-typo-secondary hover:text-typo-primary'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-typo-primary tracking-tight">
                {isSignUp ? 'Create your Agent Account' : 'Welcome back, Explorer'}
              </h2>
              <p className="text-xs text-typo-secondary mt-1">
                {isSignUp ? 'Fill in your details to get started with VoyageAgent.' : 'Enter your credentials to access your expedition console.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-typo-muted group-focus-within:text-brand-glow transition-colors" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Captain Alex Vance"
                      className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-glow rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-typo-primary placeholder:text-typo-muted outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-typo-muted group-focus-within:text-brand-glow transition-colors" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="explorer@voyageagent.ai"
                    className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-glow rounded-2xl py-4 pl-14 pr-5 text-sm font-bold text-typo-primary placeholder:text-typo-muted outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-brand-primary ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-typo-muted group-focus-within:text-brand-glow transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-space-secondary border-2 border-space-border focus:border-brand-glow rounded-2xl py-4 pl-14 pr-12 text-sm font-bold text-typo-primary placeholder:text-typo-muted outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-typo-muted hover:text-typo-primary"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl btn-primary font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/25 disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-space-main border-t-transparent"></span>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Agent Account' : 'Authenticate & Enter Console'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-space-border"></div>
              </div>
              <span className="relative px-4 text-[10px] uppercase font-black tracking-widest text-typo-muted bg-space-card">
                Fast Evaluation Access
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-space-secondary border-2 border-space-border hover:border-brand-glow text-typo-primary text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:bg-brand-primary/5"
            >
              <Zap size={16} className="text-brand-glow" />
              <span>Quick Demo Login</span>
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-space-border/50 text-center z-10">
        <p className="text-xs font-medium text-typo-muted">
          © {new Date().getFullYear()} VoyageAgent AI • Autonomous Expedition Architect Platform
        </p>
      </footer>
    </div>
  );
};

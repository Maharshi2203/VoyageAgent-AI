import React, { useState } from 'react';
import { 
  Zap, 
  Sun, 
  Moon, 
  LogOut, 
  Search, 
  Compass, 
  Map, 
  Bookmark, 
  User as UserIcon, 
  Plus, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  currentRoute: string;
  onNavigate: (route: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onLogout: () => void;
  onOpenCreateTrip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentRoute,
  onNavigate,
  theme,
  toggleTheme,
  onLogout,
  onOpenCreateTrip
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-space-main/80 backdrop-blur-xl border-b border-space-border/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => onNavigate(user ? 'dashboard' : 'home')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="bg-gradient-to-br from-brand-primary to-brand-glow p-2.5 rounded-2xl shadow-lg shadow-brand-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Zap className="text-space-main" size={22} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold tracking-tighter text-typo-primary uppercase leading-none">
                VOYAGE<span className="text-brand-glow">AGENT</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.28em] text-typo-secondary mt-0.5">
                Travel Operating System
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Public / Main) */}
          <div className="hidden md:flex items-center gap-1 bg-space-secondary/60 p-1.5 rounded-2xl border border-space-border/50">
            {user ? (
              <>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentRoute === 'dashboard' 
                      ? 'bg-space-card text-brand-primary shadow-sm border border-space-border' 
                      : 'text-typo-secondary hover:text-typo-primary'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigate('my-trips')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentRoute === 'my-trips' 
                      ? 'bg-space-card text-brand-primary shadow-sm border border-space-border' 
                      : 'text-typo-secondary hover:text-typo-primary'
                  }`}
                >
                  My Trips
                </button>
                <button
                  onClick={() => onNavigate('discover')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentRoute === 'discover' 
                      ? 'bg-space-card text-brand-primary shadow-sm border border-space-border' 
                      : 'text-typo-secondary hover:text-typo-primary'
                  }`}
                >
                  Discover
                </button>
                <button
                  onClick={() => onNavigate('saved-places')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentRoute === 'saved-places' 
                      ? 'bg-space-card text-brand-primary shadow-sm border border-space-border' 
                      : 'text-typo-secondary hover:text-typo-primary'
                  }`}
                >
                  Saved
                </button>
                <button
                  onClick={() => onNavigate('travel-map')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentRoute === 'travel-map' 
                      ? 'bg-space-card text-brand-primary shadow-sm border border-space-border' 
                      : 'text-typo-secondary hover:text-typo-primary'
                  }`}
                >
                  Travel Map
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('home')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentRoute === 'home' 
                      ? 'bg-space-card text-brand-primary shadow-sm border border-space-border' 
                      : 'text-typo-secondary hover:text-typo-primary'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onNavigate('discover')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentRoute === 'discover' 
                      ? 'bg-space-card text-brand-primary shadow-sm border border-space-border' 
                      : 'text-typo-secondary hover:text-typo-primary'
                  }`}
                >
                  Discover
                </button>
              </>
            )}
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={onOpenCreateTrip}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-primary hover:bg-brand-glow text-space-main font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand-primary/20 transition-all transform active:scale-95"
                >
                  <Sparkles size={15} />
                  <span>Plan Trip</span>
                </button>

              </>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-5 py-2.5 rounded-2xl bg-brand-primary text-space-main font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-brand-glow transition-all"
              >
                Sign In
              </button>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-space-secondary border border-space-border text-brand-primary hover:bg-space-card transition-all"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Profile avatar */}
            {user && (
              <div className="flex items-center gap-2 pl-1 border-l border-space-border/60">
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-space-secondary border border-transparent hover:border-space-border transition-all"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-glow text-space-main font-extrabold text-xs flex items-center justify-center shadow-md">
                    {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl text-typo-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-2xl bg-space-secondary border border-space-border text-typo-primary"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-3 pb-6 bg-space-card border-b border-space-border space-y-2 animate-in fade-in duration-200">
          {user ? (
            <>
              <button 
                onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold text-typo-primary hover:bg-space-secondary"
              >
                Dashboard
              </button>
              <button 
                onClick={() => { onNavigate('my-trips'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold text-typo-primary hover:bg-space-secondary"
              >
                My Trips
              </button>
              <button 
                onClick={() => { onNavigate('discover'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold text-typo-primary hover:bg-space-secondary"
              >
                Discover Destinations
              </button>
              <button 
                onClick={() => { onNavigate('saved-places'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold text-typo-primary hover:bg-space-secondary"
              >
                Saved Places
              </button>
              <button 
                onClick={() => { onNavigate('travel-map'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold text-typo-primary hover:bg-space-secondary"
              >
                Personal Travel Map
              </button>
              <button 
                onClick={() => { onNavigate('profile'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold text-typo-primary hover:bg-space-secondary"
              >
                Profile & Stats
              </button>
              <button
                onClick={() => { onOpenCreateTrip(); setMobileMenuOpen(false); }}
                className="w-full mt-2 py-3 rounded-2xl bg-brand-primary text-space-main font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Plan New Trip
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold text-typo-primary hover:bg-space-secondary"
              >
                Home
              </button>
              <button 
                onClick={() => { onNavigate('discover'); setMobileMenuOpen(false); }}
                className="w-full text-left py-2.5 px-4 rounded-xl text-sm font-bold text-typo-primary hover:bg-space-secondary"
              >
                Discover Destinations
              </button>
              <button 
                onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                className="w-full mt-2 py-3 rounded-2xl bg-brand-primary text-space-main font-bold text-xs uppercase tracking-wider text-center"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

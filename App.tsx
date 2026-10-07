import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Trip, 
  SavedPlace, 
  DestinationGuide
} from './types';
import { databaseService } from './services/databaseService';
import { liveDestinationService } from './services/liveDestinationService';
import { Navbar } from './components/Navbar';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { DiscoverPage } from './components/DiscoverPage';
import { DestinationDetailPage } from './components/DestinationDetailPage';
import { DashboardView } from './components/DashboardView';
import { MyTripsView } from './components/MyTripsView';
import { SavedPlacesView } from './components/SavedPlacesView';
import { PersonalTravelMapView } from './components/PersonalTravelMapView';
import { UserProfileView } from './components/UserProfileView';
import { AITripPlannerModal } from './components/AITripPlannerModal';
import { TripWorkspace } from './components/TripWorkspace/TripWorkspace';
import { EmailPreferencesModal } from './components/EmailPreferencesModal';
import { notificationService } from './services/email/notificationService';
import { offerMatchingService } from './services/email/offerMatchingService';

export const App: React.FC = () => {
  // Theme state with smooth transitions
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('voyage-theme');
    if (saved) return saved as 'dark' | 'light';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('voyage-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Authenticated user state
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('voyage_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  // Client Routing state: 'home' | 'discover' | 'destination-detail' | 'dashboard' | 'my-trips' | 'saved-places' | 'travel-map' | 'profile' | 'trip' | 'login'
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return user ? 'dashboard' : 'home';
  });

  // Data states
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);

  // Planner modal states
  const [isAIPlannerOpen, setIsAIPlannerOpen] = useState(false);
  const [plannerPrompt, setPlannerPrompt] = useState<string | undefined>(undefined);
  const [plannerDestination, setPlannerDestination] = useState<string | undefined>(undefined);

  // Email Preferences Modal State
  const [isEmailPreferencesOpen, setIsEmailPreferencesOpen] = useState(false);

  // Automated Personalized Travel Offers Engine (Respects frequency caps and deduplication)
  useEffect(() => {
    if (user && trips.length > 0) {
      offerMatchingService.matchOffersForUser(user, trips).then(({ matchedOffers }) => {
        matchedOffers.forEach(m => {
          notificationService.sendOfferEmail(user, m.offer, m.trip);
          offerMatchingService.recordOfferSent(user.id, m.offer.id, m.trip?.id, m.reason);
        });
      });
    }
  }, [user?.id, trips.length]);

  // Load User Data
  const loadUserData = useCallback(async (u: User) => {
    const userTrips = await databaseService.getUserFullTrips(u.id);
    setTrips(userTrips);
    const userPlaces = await databaseService.getSavedPlaces(u.id);
    setSavedPlaces(userPlaces);
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData(user);
    }
  }, [user, loadUserData]);

  // Auth handlers
  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('voyage_user', JSON.stringify(u));
    setCurrentRoute('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('voyage_user');
    setCurrentRoute('home');
  };

  // Trip handlers
  const handleOpenTrip = (tripId: string) => {
    setActiveTripId(tripId);
    setCurrentRoute('trip');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateTrip = async (newTrip: Trip) => {
    await databaseService.saveFullTrip(newTrip);
    setTrips(prev => [newTrip, ...prev.filter(t => t.id !== newTrip.id)]);
    setActiveTripId(newTrip.id);
    setCurrentRoute('trip');

    if (user) {
      // Automatically send TRIP_CREATED and AI_TRIP_GENERATED emails
      notificationService.sendTripCreated(user, newTrip);
      notificationService.sendAITripGenerated(user, newTrip);
    }
  };

  const handleUpdateTrip = async (updater: (t: Trip) => Trip) => {
    if (!activeTripId || !user) return;
    const updated = await databaseService.updateTrip(activeTripId, user.id, updater);
    if (updated) {
      setTrips(prev => prev.map(t => t.id === updated.id ? updated : t));
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!user) return;
    await databaseService.deleteFullTrip(user.id, tripId);
    setTrips(prev => prev.filter(t => t.id !== tripId));
    if (activeTripId === tripId) {
      setActiveTripId(null);
      setCurrentRoute('my-trips');
    }
  };

  // Saved place toggle
  const handleToggleSavedPlace = async (place: SavedPlace) => {
    if (!user) {
      setCurrentRoute('login');
      return;
    }
    await databaseService.toggleSavedPlace(user.id, place);
    const updated = await databaseService.getSavedPlaces(user.id);
    setSavedPlaces(updated);
  };

  // Planner triggers
  const handleLaunchPlanner = (prompt?: string, dest?: string) => {
    if (!user) {
      setCurrentRoute('login');
      return;
    }
    setPlannerPrompt(prompt);
    setPlannerDestination(dest);
    setIsAIPlannerOpen(true);
  };

  // Active Trip object
  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0] || null;

  // Selected Destination object
  const selectedDestination = selectedDestinationId 
    ? liveDestinationService.getDestinationById(selectedDestinationId)
      ?? databaseService.getDestinationById(selectedDestinationId)
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-space-main text-typo-primary transition-colors duration-300">
      
      {/* Dynamic Background Atmosphere */}
      <div className="fixed top-[-10%] right-[-10%] w-[55%] h-[55%] bg-brand-glow/5 rounded-full blur-[160px] -z-10 animate-pulse pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-brand-primary/5 rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* Global Navigation Bar */}
      {currentRoute !== 'login' && (
        <Navbar 
          user={user}
          currentRoute={currentRoute}
          onNavigate={setCurrentRoute}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={handleLogout}
          onOpenCreateTrip={() => handleLaunchPlanner()}
        />
      )}

      {/* Main View Router */}
      <div className="flex-1">
        
        {/* PUBLIC: Landing Page */}
        {currentRoute === 'home' && (
          <LandingPage 
            onPlanTrip={(prompt) => handleLaunchPlanner(prompt)}
            onExploreDestinations={() => setCurrentRoute('discover')}
            onViewDestination={(destId) => {
              setSelectedDestinationId(destId);
              setCurrentRoute('destination-detail');
            }}
          />
        )}

        {/* PUBLIC/AUTH: Discover Page */}
        {currentRoute === 'discover' && (
          <DiscoverPage 
            onSelectDestination={(destId) => {
              setSelectedDestinationId(destId);
              setCurrentRoute('destination-detail');
            }}
            onPlanTripForDestination={(destName) => handleLaunchPlanner(undefined, destName)}
          />
        )}

        {/* PUBLIC/AUTH: Destination Guide Page */}
        {currentRoute === 'destination-detail' && selectedDestination && (
          <DestinationDetailPage 
            destination={selectedDestination}
            onBack={() => setCurrentRoute('discover')}
            onPlanTrip={(destName) => handleLaunchPlanner(undefined, destName)}
          />
        )}

        {/* AUTHENTICATION: Login / Register */}
        {currentRoute === 'login' && (
          <AuthPage 
            onLogin={handleLogin}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        )}

        {/* AUTHENTICATED: Dashboard */}
        {currentRoute === 'dashboard' && user && (
          <DashboardView 
            user={user}
            trips={trips}
            onOpenTrip={handleOpenTrip}
            onOpenCreateTrip={() => handleLaunchPlanner()}
            onNavigate={setCurrentRoute}
          />
        )}

        {/* AUTHENTICATED: My Trips Portfolio */}
        {currentRoute === 'my-trips' && user && (
          <MyTripsView 
            trips={trips}
            onOpenTrip={handleOpenTrip}
            onOpenCreateTrip={() => handleLaunchPlanner()}
            onDeleteTrip={handleDeleteTrip}
            onNavigate={setCurrentRoute}
          />
        )}

        {/* AUTHENTICATED: Saved Places */}
        {currentRoute === 'saved-places' && (
          <SavedPlacesView 
            savedPlaces={savedPlaces}
            onToggleSavedPlace={handleToggleSavedPlace}
            onNavigateToMap={() => setCurrentRoute('travel-map')}
          />
        )}

        {/* AUTHENTICATED: Personal Travel Map */}
        {currentRoute === 'travel-map' && (
          <PersonalTravelMapView 
            trips={trips}
            savedPlaces={savedPlaces}
            onOpenTrip={handleOpenTrip}
          />
        )}

        {/* AUTHENTICATED: User Profile */}
        {currentRoute === 'profile' && user && (
          <UserProfileView 
            user={user}
            tripsCount={trips.length}
            savedPlacesCount={savedPlaces.length}
            onUpdateUser={(updated) => {
              setUser(updated);
              localStorage.setItem('voyage_user', JSON.stringify(updated));
            }}
            onOpenPreferences={() => setIsEmailPreferencesOpen(true)}
          />
        )}

        {/* TRIP WORKSPACE: /trip/:tripId */}
        {currentRoute === 'trip' && activeTrip && (
          <TripWorkspace 
            trip={activeTrip}
            onBackToDashboard={() => setCurrentRoute(user ? 'dashboard' : 'home')}
            onUpdateTrip={handleUpdateTrip}
          />
        )}

      </div>

      {/* AI Trip Planner Studio Modal */}
      {user && (
        <>
          <AITripPlannerModal 
            isOpen={isAIPlannerOpen}
            onClose={() => setIsAIPlannerOpen(false)}
            onTripGenerated={handleCreateTrip}
            initialPrompt={plannerPrompt}
            initialDestination={plannerDestination}
            userId={user.id}
          />

          <EmailPreferencesModal 
            isOpen={isEmailPreferencesOpen}
            onClose={() => setIsEmailPreferencesOpen(false)}
            user={user}
          />
        </>
      )}

      {/* Global Footer */}
      {currentRoute !== 'trip' && currentRoute !== 'login' && (
        <footer className="border-t border-space-border/60 py-16 bg-space-card/40 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <span className="text-xl font-black uppercase tracking-tighter text-typo-primary">
                VOYAGE<span className="text-brand-glow">AGENT</span>
              </span>
              <span className="text-xs text-typo-muted font-bold">
                • Autonomous Expedition Operating System
              </span>
            </div>
            <p className="text-xs font-semibold text-typo-muted text-center">
              © {new Date().getFullYear()} VoyageAgent Platform. Designed for modern explorers.
            </p>
            <div className="flex gap-6 text-xs font-bold text-typo-secondary">
              <button onClick={() => setCurrentRoute('discover')} className="hover:text-brand-primary">Destinations</button>
              <button onClick={() => setCurrentRoute('home')} className="hover:text-brand-primary">Architecture</button>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
};

export default App;
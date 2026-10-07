import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Itinerary, User, Trip, SavedPlace, CommunityTripTemplate, DestinationGuide, TripMember, NotificationPreference, InAppNotification, EmailLog, OfferMatch } from '../types';
import { INITIAL_COMMUNITY_TEMPLATES, CURATED_DESTINATIONS } from './mockData';

export interface SavedTrip {
  id: string;
  user_id: string;
  destination: string;
  budget: number;
  duration: number;
  grand_total: number;
  itinerary_data: Itinerary;
  created_at?: string;
}

export const databaseService = {
  /**
   * Register a new user account in Supabase (or localStorage fallback).
   */
  async signUpUser(name: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existing) {
          return { success: false, error: 'An account with this email already exists. Please sign in.' };
        }

        const { data, error } = await supabase
          .from('users')
          .insert([{ name, email: cleanEmail, password }])
          .select();

        if (error) {
          console.error('[Supabase SignUp Error]:', error);
          if (error.code === '42P01' || error.message.includes('users') || error.message.includes('relation')) {
            return this.signUpUserLocalStorage(name, cleanEmail, password);
          }
          return { success: false, error: error.message };
        }

        const newUser: User = {
          id: data[0].id,
          name: data[0].name,
          email: data[0].email,
          travelStyle: 'Curious Explorer',
          countriesVisited: 4,
          citiesVisited: 11,
          savedPlacesCount: 8
        };
        return { success: true, user: newUser };
      } catch {
        return this.signUpUserLocalStorage(name, cleanEmail, password);
      }
    }

    return this.signUpUserLocalStorage(name, cleanEmail, password);
  },

  /**
   * Authenticate user credentials in Supabase (or localStorage fallback).
   */
  async signInUser(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .eq('password', password)
          .maybeSingle();

        if (error) {
          console.error('[Supabase SignIn Error]:', error);
          if (error.code === '42P01' || error.message.includes('users') || error.message.includes('relation')) {
            return this.signInUserLocalStorage(cleanEmail, password);
          }
          return { success: false, error: error.message };
        }

        if (!data) {
          return { success: false, error: 'Invalid email or password. Please check your credentials.' };
        }

        const user: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          travelStyle: data.travel_style || 'Curious Explorer',
          countriesVisited: data.countries_visited || 5,
          citiesVisited: data.cities_visited || 14,
          savedPlacesCount: 12
        };
        return { success: true, user };
      } catch {
        return this.signInUserLocalStorage(cleanEmail, password);
      }
    }

    return this.signInUserLocalStorage(cleanEmail, password);
  },

  signUpUserLocalStorage(name: string, email: string, password: string): { success: boolean; user?: User; error?: string } {
    try {
      const savedRaw = localStorage.getItem('voyage_registered_users');
      const users: Array<{ id: string; name: string; email: string; password: string }> = savedRaw ? JSON.parse(savedRaw) : [];
      
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: 'An account with this email already exists. Please sign in.' };
      }

      const newUserObj = { 
        id: `usr_${Date.now()}`, 
        name, 
        email, 
        password,
        travelStyle: 'Curious Explorer',
        countriesVisited: 3,
        citiesVisited: 9,
        savedPlacesCount: 6
      };
      users.push(newUserObj);
      localStorage.setItem('voyage_registered_users', JSON.stringify(users));

      return {
        success: true,
        user: { 
          id: newUserObj.id, 
          name: newUserObj.name, 
          email: newUserObj.email,
          travelStyle: newUserObj.travelStyle,
          countriesVisited: newUserObj.countriesVisited,
          citiesVisited: newUserObj.citiesVisited,
          savedPlacesCount: newUserObj.savedPlacesCount
        }
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  signInUserLocalStorage(email: string, password: string): { success: boolean; user?: User; error?: string } {
    try {
      const savedRaw = localStorage.getItem('voyage_registered_users');
      const users: Array<{ id: string; name: string; email: string; password: string }> = savedRaw ? JSON.parse(savedRaw) : [];
      
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!found) {
        return { success: false, error: 'Invalid email or password. If you do not have an account, please Sign Up first.' };
      }

      return {
        success: true,
        user: { 
          id: found.id, 
          name: found.name, 
          email: found.email,
          travelStyle: 'Curious Explorer',
          countriesVisited: 5,
          citiesVisited: 14,
          savedPlacesCount: 12
        }
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  // ─── UNIFIED TRAVEL OPERATING SYSTEM: FULL TRIPS CRUD ──────────────

  /**
   * Fetch all full trips for a user (persisted in local storage or Supabase).
   */
  async getUserFullTrips(userId: string): Promise<Trip[]> {
    const key = `voyage_full_trips_${userId}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];

      const parsed = JSON.parse(raw) as Trip[];
      // Drop the demo starter trip that older builds seeded into storage
      const trips = parsed.filter(t => t.id !== `trip_starter_${userId}`);
      if (trips.length !== parsed.length) {
        localStorage.setItem(key, JSON.stringify(trips));
      }
      return trips;
    } catch {
      return [];
    }
  },

  /**
   * Get a specific trip by its ID.
   */
  async getTripById(tripId: string, userId: string): Promise<Trip | null> {
    const trips = await this.getUserFullTrips(userId);
    const found = trips.find(t => t.id === tripId);
    if (found) return found;

    // Check community templates as fallback view
    const tmpl = INITIAL_COMMUNITY_TEMPLATES.find(ct => ct.tripData.id === tripId || ct.id === tripId);
    if (tmpl) return tmpl.tripData;

    return null;
  },

  /**
   * Save or create a full trip.
   */
  async saveFullTrip(trip: Trip): Promise<Trip> {
    const key = `voyage_full_trips_${trip.userId}`;
    try {
      const raw = localStorage.getItem(key);
      const trips: Trip[] = raw ? JSON.parse(raw) : [];
      const idx = trips.findIndex(t => t.id === trip.id);
      
      const updatedTrip = { ...trip, updatedAt: new Date().toISOString() };
      if (idx >= 0) {
        trips[idx] = updatedTrip;
      } else {
        trips.unshift(updatedTrip);
      }
      localStorage.setItem(key, JSON.stringify(trips));
      return updatedTrip;
    } catch (err) {
      console.error('Error saving trip:', err);
      return trip;
    }
  },

  /**
   * Update an existing trip using a modifier function.
   */
  async updateTrip(tripId: string, userId: string, updater: (t: Trip) => Trip): Promise<Trip | null> {
    const key = `voyage_full_trips_${userId}`;
    try {
      const raw = localStorage.getItem(key);
      const trips: Trip[] = raw ? JSON.parse(raw) : [];
      const idx = trips.findIndex(t => t.id === tripId);
      if (idx === -1) return null;

      const modified = updater(trips[idx]);
      modified.updatedAt = new Date().toISOString();
      trips[idx] = modified;
      localStorage.setItem(key, JSON.stringify(trips));
      return modified;
    } catch (err) {
      console.error('Error updating trip:', err);
      return null;
    }
  },

  /**
   * Delete a full trip.
   */
  async deleteFullTrip(userId: string, tripId: string): Promise<boolean> {
    const key = `voyage_full_trips_${userId}`;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const trips: Trip[] = JSON.parse(raw);
      const filtered = trips.filter(t => t.id !== tripId);
      localStorage.setItem(key, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Clone a community template trip into a user's private workspace.
   */
  async cloneTemplateToUser(templateId: string, user: User): Promise<Trip> {
    const template = INITIAL_COMMUNITY_TEMPLATES.find(t => t.id === templateId) || INITIAL_COMMUNITY_TEMPLATES[0];
    const newTripId = `trip_${Date.now()}`;
    
    const newTrip: Trip = {
      ...JSON.parse(JSON.stringify(template.tripData)),
      id: newTripId,
      userId: user.id,
      title: `${template.destination} Expedition`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: [
        { id: user.id, name: user.name, email: user.email, role: 'owner' }
      ]
    };

    await this.saveFullTrip(newTrip);
    return newTrip;
  },

  // ─── SAVED PLACES ──────────────────────────────────────────────────

  async getSavedPlaces(userId: string): Promise<SavedPlace[]> {
    const key = `voyage_saved_places_${userId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);

      // Default curated saved places for rich initial state
      const initial: SavedPlace[] = [
        {
          id: 'sp_1',
          name: 'Fushimi Inari Torii Shrine',
          destination: 'Kyoto, Japan',
          category: 'Attraction',
          status: 'want_to_visit',
          notes: 'Best at dusk when lanterns glow. Hike to the top summit.',
          coordinates: { lat: 34.9671, lng: 135.7727 },
          imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
          rating: 4.9,
          savedAt: new Date().toISOString()
        },
        {
          id: 'sp_2',
          name: 'Viva Panjim Heritage Bistro',
          destination: 'Goa, India',
          category: 'Restaurant',
          status: 'loved_it',
          notes: 'Authentic prawn balchao and bebinca. Sit in the vintage backroom.',
          coordinates: { lat: 15.4975, lng: 73.8282 },
          imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
          rating: 4.8,
          savedAt: new Date().toISOString()
        },
        {
          id: 'sp_3',
          name: 'Tegallalang Rice Terrace',
          destination: 'Bali, Indonesia',
          category: 'Viewpoint',
          status: 'recommend',
          notes: 'Rent a scooter early before morning tour buses arrive.',
          coordinates: { lat: -8.4338, lng: 115.2818 },
          imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
          rating: 4.7,
          savedAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    } catch {
      return [];
    }
  },

  async toggleSavedPlace(userId: string, place: SavedPlace): Promise<boolean> {
    const key = `voyage_saved_places_${userId}`;
    try {
      const places = await this.getSavedPlaces(userId);
      const existsIdx = places.findIndex(p => p.id === place.id || (p.name === place.name && p.destination === place.destination));
      if (existsIdx >= 0) {
        places.splice(existsIdx, 1);
      } else {
        places.unshift({ ...place, savedAt: new Date().toISOString() });
      }
      localStorage.setItem(key, JSON.stringify(places));
      return true;
    } catch {
      return false;
    }
  },

  // ─── CURATED DIRECTORY ─────────────────────────────────────────────

  getCuratedDestinations(): DestinationGuide[] {
    return CURATED_DESTINATIONS;
  },

  getDestinationById(id: string): DestinationGuide | undefined {
    return CURATED_DESTINATIONS.find(d => d.id.toLowerCase() === id.toLowerCase() || d.name.toLowerCase().includes(id.toLowerCase()));
  },

  getCommunityTemplates(): CommunityTripTemplate[] {
    return INITIAL_COMMUNITY_TEMPLATES;
  },

  // ─── LEGACY ITINERARY METHODS (Maintained for Backwards Compatibility)

  async saveItinerary(userId: string, itinerary: Itinerary): Promise<{ success: boolean; id?: string; error?: string }> {
    const fullTrip: Trip = {
      id: itinerary.id || `trip_${Date.now()}`,
      userId,
      title: `${itinerary.destination} Expedition`,
      destination: itinerary.destination,
      destinationCoords: itinerary.destinationCoords,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + itinerary.duration * 86400000).toISOString().split('T')[0],
      duration: itinerary.duration,
      travelers: 2,
      travelStyle: 'Autonomous Explorer',
      totalBudget: itinerary.totalBudget,
      currency: itinerary.currency || '₹',
      coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
      itinerary,
      members: [{ id: userId, name: 'You (Owner)', email: 'traveler@voyage.ai', role: 'owner' }],
      bookings: [],
      transports: [],
      expenses: itinerary.actualExpenses || [],
      packingList: [
        { id: `pk_${Date.now()}_1`, tripId: itinerary.id || 'curr', category: 'Documents', name: 'Passport & Identity Verification', isPacked: true },
        { id: `pk_${Date.now()}_2`, tripId: itinerary.id || 'curr', category: 'Electronics', name: 'Universal Travel Adapter & Cables', isPacked: false },
        { id: `pk_${Date.now()}_3`, tripId: itinerary.id || 'curr', category: 'Clothing', name: 'Comfortable Walking Footwear', isPacked: true },
        { id: `pk_${Date.now()}_4`, tripId: itinerary.id || 'curr', category: 'Medicine', name: 'First-aid & Daily Medication', isPacked: false }
      ],
      documents: [],
      journalEntries: [],
      polls: [],
      isPublic: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.saveFullTrip(fullTrip);
    return { success: true, id: fullTrip.id };
  },

  async getUserItineraries(userId: string): Promise<SavedTrip[]> {
    const fullTrips = await this.getUserFullTrips(userId);
    return fullTrips.map(t => ({
      id: t.id,
      user_id: t.userId,
      destination: t.destination,
      budget: t.totalBudget,
      duration: t.duration,
      grand_total: t.itinerary.grandTotal,
      itinerary_data: t.itinerary,
      created_at: t.createdAt
    }));
  },

  async deleteItinerary(userId: string, tripId: string): Promise<boolean> {
    return this.deleteFullTrip(userId, tripId);
  },

  // ─── NOTIFICATION PREFERENCES ─────────────────────────────────────

  async getNotificationPreferences(userId: string): Promise<NotificationPreference> {
    const key = `voyage_notification_prefs_${userId}`;
    const defaultPrefs: NotificationPreference = {
      emailVerified: true,
      emailNotificationsEnabled: true,
      marketingEmailsEnabled: true,
      travelAlertsEnabled: true,
      bookingNotificationsEnabled: true,
      loginAlertsEnabled: true,
      itineraryUpdatesEnabled: true,
      offersEnabled: true,
      digestFrequency: 'instant',
      maxOffersPerWeek: 2
    };

    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return { ...defaultPrefs, ...JSON.parse(raw) };
      }
      return defaultPrefs;
    } catch {
      return defaultPrefs;
    }
  },

  async saveNotificationPreferences(userId: string, prefs: Partial<NotificationPreference>): Promise<NotificationPreference> {
    const current = await this.getNotificationPreferences(userId);
    const updated = { ...current, ...prefs };
    try {
      localStorage.setItem(`voyage_notification_prefs_${userId}`, JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not save notification preferences:', err);
    }
    return updated;
  },

  // ─── IN-APP NOTIFICATIONS ──────────────────────────────────────────

  async getInAppNotifications(userId: string): Promise<InAppNotification[]> {
    const key = `voyage_inapp_notifications_${userId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);

      // Default welcome notification if empty
      const initial: InAppNotification[] = [
        {
          id: `notif_welcome_${userId}`,
          userId,
          eventType: 'USER_REGISTERED' as any,
          title: 'Welcome to VoyageAgent AI 🌍',
          message: 'Your AI travel companion is ready. Plan trips, track budgets, and manage bookings seamlessly.',
          read: false,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    } catch {
      return [];
    }
  },

  async addInAppNotification(notification: InAppNotification): Promise<InAppNotification> {
    const key = `voyage_inapp_notifications_${notification.userId}`;
    try {
      const list = await this.getInAppNotifications(notification.userId);
      list.unshift(notification);
      // Keep up to 50 notifications
      if (list.length > 50) list.length = 50;
      localStorage.setItem(key, JSON.stringify(list));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('voyage_notification_received', { detail: notification }));
      }
    } catch (err) {
      console.warn('Could not save in-app notification:', err);
    }
    return notification;
  },

  async markNotificationRead(id: string, userId: string): Promise<boolean> {
    const key = `voyage_inapp_notifications_${userId}`;
    try {
      const list = await this.getInAppNotifications(userId);
      const found = list.find(n => n.id === id);
      if (found) {
        found.read = true;
        localStorage.setItem(key, JSON.stringify(list));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('voyage_notifications_updated'));
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  async markAllNotificationsRead(userId: string): Promise<boolean> {
    const key = `voyage_inapp_notifications_${userId}`;
    try {
      const list = await this.getInAppNotifications(userId);
      list.forEach(n => { n.read = true; });
      localStorage.setItem(key, JSON.stringify(list));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('voyage_notifications_updated'));
      }
      return true;
    } catch {
      return false;
    }
  },

  // ─── EMAIL LOGS (DELIVERY AUDIT) ───────────────────────────────────

  async getEmailLogs(userId: string): Promise<EmailLog[]> {
    const key = `voyage_email_logs_${userId}`;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async addEmailLog(log: EmailLog): Promise<EmailLog> {
    const key = `voyage_email_logs_${log.userId}`;
    try {
      const logs = await this.getEmailLogs(log.userId);
      logs.unshift(log);
      if (logs.length > 100) logs.length = 100;
      localStorage.setItem(key, JSON.stringify(logs));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('voyage_email_logs_updated', { detail: log }));
      }
    } catch (err) {
      console.warn('Could not save email log:', err);
    }
    return log;
  },

  async updateEmailLog(logId: string, update: Partial<EmailLog>): Promise<boolean> {
    // We look across all stored email logs in localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('voyage_email_logs_')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const logs: EmailLog[] = JSON.parse(raw);
            const idx = logs.findIndex(l => l.id === logId);
            if (idx >= 0) {
              logs[idx] = { ...logs[idx], ...update };
              localStorage.setItem(k, JSON.stringify(logs));
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('voyage_email_logs_updated', { detail: logs[idx] }));
              }
              return true;
            }
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  },

  // ─── TRAVEL OFFERS & MATCHES ───────────────────────────────────────

  async getOfferMatches(userId: string): Promise<OfferMatch[]> {
    const key = `voyage_offer_matches_${userId}`;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async saveOfferMatch(match: OfferMatch): Promise<OfferMatch> {
    const key = `voyage_offer_matches_${match.userId}`;
    try {
      const matches = await this.getOfferMatches(match.userId);
      matches.push(match);
      localStorage.setItem(key, JSON.stringify(matches));
    } catch (err) {
      console.warn('Could not save offer match:', err);
    }
    return match;
  }
};

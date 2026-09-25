import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Itinerary, User } from '../types';

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
        // Check if user already exists in Supabase users table
        const { data: existing } = await supabase
          .from('users')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existing) {
          return { success: false, error: 'An account with this email already exists. Please sign in.' };
        }

        // Insert new user
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
          email: data[0].email
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
          email: data.email
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

      const newUserObj = { id: `usr_${Date.now()}`, name, email, password };
      users.push(newUserObj);
      localStorage.setItem('voyage_registered_users', JSON.stringify(users));

      return {
        success: true,
        user: { id: newUserObj.id, name: newUserObj.name, email: newUserObj.email }
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
        user: { id: found.id, name: found.name, email: found.email }
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  /**
   * Save a newly generated itinerary to Supabase (or localStorage fallback).
   */
  async saveItinerary(userId: string, itinerary: Itinerary): Promise<{ success: boolean; id?: string; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('itineraries')
          .insert([
            {
              user_id: userId,
              destination: itinerary.destination,
              budget: itinerary.totalBudget,
              duration: itinerary.duration,
              grand_total: itinerary.grandTotal,
              itinerary_data: itinerary,
            }
          ])
          .select();

        if (error) {
          console.error('[Supabase Save Error]:', error);
          return { success: false, error: error.message };
        }
        return { success: true, id: data?.[0]?.id };
      } catch (err) {
        return { success: false, error: String(err) };
      }
    }

    // LocalStorage Fallback
    try {
      const existingKey = `voyage_trips_${userId}`;
      const savedRaw = localStorage.getItem(existingKey);
      const trips: SavedTrip[] = savedRaw ? JSON.parse(savedRaw) : [];
      const newTrip: SavedTrip = {
        id: `trip_${Date.now()}`,
        user_id: userId,
        destination: itinerary.destination,
        budget: itinerary.totalBudget,
        duration: itinerary.duration,
        grand_total: itinerary.grandTotal,
        itinerary_data: itinerary,
        created_at: new Date().toISOString()
      };
      trips.unshift(newTrip);
      localStorage.setItem(existingKey, JSON.stringify(trips));
      return { success: true, id: newTrip.id };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },

  /**
   * Fetch all saved itineraries for a given user from Supabase (or localStorage).
   */
  async getUserItineraries(userId: string): Promise<SavedTrip[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('itineraries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[Supabase Fetch Error]:', error);
          return [];
        }
        return data as SavedTrip[];
      } catch (err) {
        console.error('[Supabase Fetch Exception]:', err);
        return [];
      }
    }

    // LocalStorage Fallback
    try {
      const existingKey = `voyage_trips_${userId}`;
      const savedRaw = localStorage.getItem(existingKey);
      return savedRaw ? JSON.parse(savedRaw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Delete an itinerary from the database.
   */
  async deleteItinerary(userId: string, tripId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('itineraries')
          .delete()
          .eq('id', tripId);
        return !error;
      } catch {
        return false;
      }
    }

    // LocalStorage Fallback
    try {
      const existingKey = `voyage_trips_${userId}`;
      const savedRaw = localStorage.getItem(existingKey);
      if (!savedRaw) return false;
      const trips: SavedTrip[] = JSON.parse(savedRaw);
      const filtered = trips.filter(t => t.id !== tripId);
      localStorage.setItem(existingKey, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }
};

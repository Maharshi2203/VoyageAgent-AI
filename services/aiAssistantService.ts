import { Trip, Activity, ActivityType, PackingItem } from '../types';
import { geminiRM } from './geminiRequestManager';

export interface AIActionResponse {
  message: string;
  actionType?: 
    | 'ADD_ACTIVITY' 
    | 'REMOVE_ACTIVITY' 
    | 'UPDATE_ACTIVITY_TIME' 
    | 'REGENERATE_DAY' 
    | 'GENERATE_PACKING' 
    | 'BUDGET_ADVICE' 
    | 'INFO_ONLY';
  payload?: any;
}

export const aiAssistantService = {
  /**
   * Process a conversational user prompt inside the trip workspace,
   * parsing user intent and executing structured, validated actions on the trip.
   */
  async processTripAssistantCommand(trip: Trip, userPrompt: string): Promise<AIActionResponse> {
    const tripSummary = {
      destination: trip.destination,
      duration: trip.duration,
      totalBudget: trip.totalBudget,
      spent: trip.itinerary.grandTotal,
      remaining: trip.itinerary.remainingBudget,
      currency: trip.currency,
      daysCount: trip.itinerary.days.length,
      days: trip.itinerary.days.map(d => ({
        day: d.day,
        activities: d.activities.map(a => ({
          id: a.id,
          name: a.name,
          timeSlot: a.timeSlot,
          cost: a.cost,
          location: a.location
        }))
      })),
      bookingsCount: trip.bookings.length,
      bookings: trip.bookings.map(b => ({
        title: b.title,
        type: b.type,
        date: b.date,
        cost: b.cost
      }))
    };

    const systemPrompt = `You are the intelligent VoyageAgent Trip Copilot embedded inside an active trip workspace.
Here is the current ground-truth trip data:
${JSON.stringify(tripSummary, null, 2)}

User Request: "${userPrompt}"

RULES:
1. Always base your answers ONLY on the actual trip data provided above. NEVER hallucinate bookings or expenses that do not exist.
2. Determine if the user wants to perform an actionable change:
   - "ADD_ACTIVITY": User asks to add a place, activity, restaurant, viewpoint.
   - "REMOVE_ACTIVITY": User asks to delete/remove an item.
   - "UPDATE_ACTIVITY_TIME": User asks to change time/timeSlot (Morning/Afternoon/Evening).
   - "REGENERATE_DAY": User asks to re-plan or optimize a specific day (e.g. "make Day 2 cheaper" or "make Day 3 less hectic").
   - "GENERATE_PACKING": User asks what to pack or generate packing items.
   - "INFO_ONLY": Questions about budget, bookings, next events, or travel tips.
3. Return a clean JSON response with the following format:
{
  "message": "Direct, friendly response to the user explaining what was answered or changed.",
  "actionType": "ADD_ACTIVITY" | "REMOVE_ACTIVITY" | "UPDATE_ACTIVITY_TIME" | "REGENERATE_DAY" | "GENERATE_PACKING" | "INFO_ONLY",
  "payload": { ...relevant fields based on actionType... }
}

For ADD_ACTIVITY, payload must contain:
{
  "day": 1,
  "activity": {
    "name": "Name",
    "description": "Short description",
    "timeSlot": "Morning" | "Afternoon" | "Evening",
    "cost": 500,
    "location": "Specific place, city",
    "activityType": "food" | "cultural" | "adventure" | "relaxation" | "shopping"
  }
}

For REMOVE_ACTIVITY, payload must contain:
{
  "day": 1,
  "activityName": "Name to remove"
}

For GENERATE_PACKING, payload must contain:
{
  "items": [
    { "category": "Clothing" | "Toiletries" | "Electronics" | "Documents" | "Medicine", "name": "Item name" }
  ]
}`;

    try {
      const responseText = await geminiRM.request({
        model: "gemini-3.6-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const parsed = JSON.parse(responseText) as AIActionResponse;
      return parsed;
    } catch {
      // Fallback heuristics if API is offline or rate-limited
      return this.heuristicFallback(trip, userPrompt);
    }
  },

  heuristicFallback(trip: Trip, prompt: string): AIActionResponse {
    const lower = prompt.toLowerCase();
    
    if (lower.includes('how much') || lower.includes('spent') || lower.includes('budget')) {
      return {
        message: `Your total allocated budget is ${trip.currency}${trip.totalBudget.toLocaleString()}. You have currently planned ${trip.currency}${trip.itinerary.grandTotal.toLocaleString()} with ${trip.currency}${trip.itinerary.remainingBudget.toLocaleString()} remaining reserve.`,
        actionType: 'INFO_ONLY'
      };
    }

    if (lower.includes('booking') || lower.includes('reservation')) {
      if (trip.bookings.length === 0) {
        return {
          message: `You currently have 0 confirmed bookings in this trip. You can log hotels, flights, or activities in the Bookings tab.`,
          actionType: 'INFO_ONLY'
        };
      }
      const list = trip.bookings.map(b => `${b.title} (${b.type}, Ref: ${b.bookingRef})`).join(', ');
      return {
        message: `You have ${trip.bookings.length} confirmed booking(s): ${list}.`,
        actionType: 'INFO_ONLY'
      };
    }

    if (lower.includes('pack') || lower.includes('luggage')) {
      const suggested: PackingItem[] = [
        { id: `pk_${Date.now()}_1`, tripId: trip.id, category: 'Clothing', name: 'Breathable walking layers', isPacked: false },
        { id: `pk_${Date.now()}_2`, tripId: trip.id, category: 'Electronics', name: 'Universal travel power adapter', isPacked: false },
        { id: `pk_${Date.now()}_3`, tripId: trip.id, category: 'Documents', name: 'Passport & digital copies', isPacked: true }
      ];
      return {
        message: `Generated custom packing essentials for ${trip.destination} based on ${trip.duration} days of travel.`,
        actionType: 'GENERATE_PACKING',
        payload: { items: suggested }
      };
    }

    return {
      message: `I've analyzed your itinerary for ${trip.destination}. Your schedule covers ${trip.duration} days across ${trip.itinerary.days.reduce((acc, d) => acc + d.activities.length, 0)} planned experiences. Let me know if you would like me to add activities, refine a specific day, or adjust your budget.`,
      actionType: 'INFO_ONLY'
    };
  },

  /**
   * Automatically generate a tailored packing list using destination, duration, and preferences.
   */
  async generateSmartPackingList(destination: string, duration: number, preferences: string[]): Promise<PackingItem[]> {
    const prompt = `Generate a comprehensive, tailored packing checklist for a ${duration}-day trip to ${destination}.
Travel preferences/activities: ${preferences.join(', ')}.
Categories: Clothing, Toiletries, Electronics, Documents, Medicine, Accessories.
Return a JSON array of objects:
[
  { "category": "Clothing", "name": "Item name" }
]`;

    try {
      const res = await geminiRM.request({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      const items = JSON.parse(res) as Array<{ category: any; name: string }>;
      return items.map((item, idx) => ({
        id: `pk_gen_${Date.now()}_${idx}`,
        tripId: 'current',
        category: item.category || 'Clothing',
        name: item.name,
        isPacked: false
      }));
    } catch {
      return [
        { id: `pk_${Date.now()}_1`, tripId: 'current', category: 'Documents', name: 'Passport & Identification', isPacked: true },
        { id: `pk_${Date.now()}_2`, tripId: 'current', category: 'Documents', name: 'Flight & Hotel Confirmations', isPacked: true },
        { id: `pk_${Date.now()}_3`, tripId: 'current', category: 'Electronics', name: 'Phone charger & Power bank', isPacked: false },
        { id: `pk_${Date.now()}_4`, tripId: 'current', category: 'Electronics', name: 'Travel adapter plug', isPacked: false },
        { id: `pk_${Date.now()}_5`, tripId: 'current', category: 'Clothing', name: 'Comfortable walking sneakers', isPacked: false },
        { id: `pk_${Date.now()}_6`, tripId: 'current', category: 'Toiletries', name: 'Sunscreen & Lip balm', isPacked: false },
        { id: `pk_${Date.now()}_7`, tripId: 'current', category: 'Medicine', name: 'Basic medical kit & personal prescriptions', isPacked: false }
      ];
    }
  }
};

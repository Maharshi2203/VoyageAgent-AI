/**
 * geminiService.ts
 * ================
 * All Gemini API calls are routed through GeminiRequestManager which
 * provides: serial queue, response caching, in-flight deduplication,
 * exponential-backoff retry on 429, and AbortController support.
 */

import { Type } from "@google/genai";
import { TripParams, Itinerary } from "../types";
import { geminiRM } from "./geminiRequestManager";

const MODEL = "gemini-3.6-flash";

const ITINERARY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    destinationCoords: {
      type: Type.OBJECT,
      properties: {
        lat: { type: Type.NUMBER },
        lng: { type: Type.NUMBER }
      },
      required: ["lat", "lng"]
    },
    totalBudget: { type: Type.NUMBER },
    duration: { type: Type.NUMBER },
    currency: { type: Type.STRING },
    weather: {
      type: Type.OBJECT,
      properties: {
        temperature: { type: Type.STRING },
        condition: { type: Type.STRING },
        forecast: { type: Type.STRING }
      },
      required: ["temperature", "condition", "forecast"]
    },
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          accommodationCost: { type: Type.NUMBER },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                timeSlot: { type: Type.STRING },
                cost: { type: Type.NUMBER },
                location: { type: Type.STRING },
                activityType: { type: Type.STRING },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                  },
                  required: ["lat", "lng"]
                }
              },
              required: ["id", "name", "description", "timeSlot", "cost", "location", "activityType", "coordinates"]
            }
          }
        },
        required: ["day", "accommodationCost", "activities"]
      }
    }
  },
  required: ["destination", "destinationCoords", "totalBudget", "duration", "currency", "days", "weather"]
};

export const travelAgentService = {
  /**
   * Step 1: Draft initial plan
   */
  async draftPlan(
    params: TripParams,
    signal?: AbortSignal,
  ): Promise<{ data: Itinerary; reasoning: string }> {
    const prompt = `Act as an expert travel planner. Create an initial draft itinerary for a ${params.days}-day trip to ${params.destination} with a total budget of ₹${params.budget} (Indian Rupees).
    The user prefers: ${params.preferences.join(", ")}.

      IMPORTANT REQUIREMENTS:
      1. Include at least 3-4 activities per day to ensure a full experience.
      2. Include realistic estimated costs in Indian Rupees (INR) for accommodation and activities.
      3. Ensure the costs reflect local prices or realistic travel expenses for an Indian traveler.
      4. Provide precise Latitude and Longitude for the destination and EACH activity.
      5. Include expected weather information (temperature, condition, forecast) for the location.
      6. Explain your initial reasoning for selecting these locations and activities.`;

    const text = await geminiRM.request({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itinerary: ITINERARY_SCHEMA,
            reasoning: { type: Type.STRING },
          },
        },
      },
      cacheKey: `draftPlan::${params.destination}::${params.days}::${params.budget}::${params.preferences.sort().join(",")}`,
      signal,
    });

    const parsed = JSON.parse(text);
    return { data: parsed.itinerary, reasoning: parsed.reasoning };
  },

  /**
   * Step 2: Validate and Optimize Plan
   */
  async optimizePlan(
    params: TripParams,
    currentItinerary: Itinerary,
    signal?: AbortSignal,
  ): Promise<{ data: Itinerary; adjustments: string[]; status: "perfect" | "adjusted" }> {
    const prompt = `Review this travel itinerary for a ${params.days}-day trip to ${params.destination} with a budget of ₹${params.budget} (INR).
    Current plan: ${JSON.stringify(currentItinerary)}

    CRITICAL CONSTRAINTS:
    1. Total cost (Activities + Accommodation) MUST be within the budget of ₹${params.budget} INR.
    2. Maintain 3-4 activities per day unless budget constraints make it impossible.
    3. Ensure activities are logically sequenced by location to save travel time.
    4. If budget is exceeded, replace expensive items with cheaper or free alternatives while maintaining quality.
    5. Ensure all items have Latitude and Longitude coordinates.
    6. Ensure weather information is present.
    7. Provide a list of adjustments made.`;

    const text = await geminiRM.request({
      model: MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itinerary: ITINERARY_SCHEMA,
            adjustments: { type: Type.ARRAY, items: { type: Type.STRING } },
            status: { type: Type.STRING },
          },
        },
      },
      signal,
    });

    const parsed = JSON.parse(text);
    return {
      data: parsed.itinerary,
      adjustments: parsed.adjustments || [],
      status: parsed.status as "perfect" | "adjusted",
    };
  },

  /**
   * Get location suggestions based on input.
   * Results are cached for 10 min — identical queries never re-hit the API.
   */
  async getLocationSuggestions(
    input: string,
    signal?: AbortSignal,
  ): Promise<string[]> {
    if (!input || input.length < 2) return [];

    const prompt = `Provide a list of 5 popular travel destination suggestions starting with or matching: "${input}".
    Format names as "City, Country". Respond with a JSON array of strings.`;

    try {
      const text = await geminiRM.request({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        // Use the raw input as cache key so "Par" and "Paris" are different
        cacheKey: `suggestions::${input.toLowerCase().trim()}`,
        signal,
      });

      return JSON.parse(text);
    } catch (error) {
      // Silently swallow cancelled/debounced requests
      const msg = error instanceof Error ? error.message : String(error);
      if (!msg.includes("cancelled")) {
        console.error("Suggestion Error:", error);
      }
      return [];
    }
  },
};
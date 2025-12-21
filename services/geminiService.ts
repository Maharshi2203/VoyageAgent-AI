import { GoogleGenAI, Type } from "@google/genai";
import { TripParams, Itinerary, ActivityType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const ITINERARY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    totalBudget: { type: Type.NUMBER },
    duration: { type: Type.NUMBER },
    currency: { type: Type.STRING },
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
              },
              required: ["id", "name", "description", "timeSlot", "cost", "location", "activityType"]
            }
          }
        },
        required: ["day", "accommodationCost", "activities"]
      }
    }
  },
  required: ["destination", "totalBudget", "duration", "currency", "days"]
};

export const travelAgentService = {
  /**
   * Step 1: Draft initial plan
   */
    async draftPlan(params: TripParams): Promise<{ data: Itinerary, reasoning: string }> {
    const prompt = `Act as an expert travel planner. Create an initial draft itinerary for a ${params.days}-day trip to ${params.destination} with a total budget of ₹${params.budget} (Indian Rupees).
    The user prefers: ${params.preferences.join(", ")}. 
    
    IMPORTANT REQUIREMENTS:
    1. Include at least 3-4 activities (Node Targets) per day to ensure a full experience.
    2. Include realistic estimated costs in Indian Rupees (INR) for accommodation and activities. 
    3. Ensure the costs reflect local prices or realistic travel expenses for an Indian traveler.
    4. Explain your initial reasoning for selecting these locations and activities.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itinerary: ITINERARY_SCHEMA,
            reasoning: { type: Type.STRING }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return { data: parsed.itinerary, reasoning: parsed.reasoning };
  },

  /**
   * Step 2: Validate and Optimize Plan
   */
    async optimizePlan(params: TripParams, currentItinerary: Itinerary): Promise<{ data: Itinerary, adjustments: string[], status: 'perfect' | 'adjusted' }> {
    const prompt = `Review this travel itinerary for a ${params.days}-day trip to ${params.destination} with a budget of ₹${params.budget} (INR). 
    Current plan: ${JSON.stringify(currentItinerary)}
    
    CRITICAL CONSTRAINTS:
    1. Total cost (Activities + Accommodation) MUST be within the budget of ₹${params.budget} INR.
    2. Maintain 3-4 activities per day unless budget constraints make it impossible.
    3. Ensure activities are logically sequenced by location to save travel time.
    4. If budget is exceeded, replace expensive items with cheaper or free alternatives while maintaining quality.
    5. Provide a list of adjustments made.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itinerary: ITINERARY_SCHEMA,
            adjustments: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            status: { type: Type.STRING }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return { 
      data: parsed.itinerary, 
      adjustments: parsed.adjustments || [], 
      status: parsed.status as 'perfect' | 'adjusted' 
    };
  }
};
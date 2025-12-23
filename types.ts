
export enum ActivityType {
  ADVENTURE = 'adventure',
  CULTURAL = 'cultural',
  RELAXATION = 'relaxation',
  FOOD = 'food',
  NIGHTLIFE = 'nightlife',
  SHOPPING = 'shopping'
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  cost: number;
  location: string;
  activityType: ActivityType;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface WeatherInfo {
  temperature: string;
  condition: string;
  forecast: string;
}

export interface DayPlan {
  day: number;
  activities: Activity[];
  dailyTotal: number;
  accommodationCost: number;
}

export interface Itinerary {
  id?: string;
  destination: string;
  destinationCoords?: {
    lat: number;
    lng: number;
  };
  totalBudget: number;
  duration: number;
  days: DayPlan[];
  grandTotal: number;
  remainingBudget: number;
  currency: string;
  weather?: WeatherInfo;
  actualExpenses?: {
    id: string;
    amount: number;
    description: string;
    date: Date;
  }[];
}

export interface AgentLog {
  id: string;
  timestamp: Date;
  step: 'Research' | 'Drafting' | 'Validation' | 'Optimization' | 'Finalizing';
  message: string;
  status: 'info' | 'success' | 'warning' | 'error';
  reasoning?: string;
}

export interface TripParams {
  destination: string;
  budget: number;
  days: number;
  preferences: ActivityType[];
}

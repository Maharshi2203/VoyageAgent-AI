
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
}

export interface DayPlan {
  day: number;
  activities: Activity[];
  dailyTotal: number;
  accommodationCost: number;
}

export interface Itinerary {
  destination: string;
  totalBudget: number;
  duration: number;
  days: DayPlan[];
  grandTotal: number;
  remainingBudget: number;
  currency: string;
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

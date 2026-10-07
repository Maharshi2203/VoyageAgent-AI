export interface NotificationPreference {
  emailVerified: boolean;
  emailNotificationsEnabled: boolean;
  marketingEmailsEnabled: boolean;
  travelAlertsEnabled: boolean;
  bookingNotificationsEnabled: boolean;
  loginAlertsEnabled: boolean;
  itineraryUpdatesEnabled: boolean;
  offersEnabled: boolean;
  digestFrequency: 'instant' | 'daily' | 'weekly';
  maxOffersPerWeek: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  travelStyle?: string;
  homeCity?: string;
  countriesVisited?: number;
  citiesVisited?: number;
  savedPlacesCount?: number;
  emailVerified?: boolean;
  notificationPreferences?: NotificationPreference;
}

export enum ActivityType {
  ADVENTURE = 'adventure',
  CULTURAL = 'cultural',
  RELAXATION = 'relaxation',
  FOOD = 'food',
  NIGHTLIFE = 'nightlife',
  SHOPPING = 'shopping',
  NATURE = 'nature',
  HISTORIC = 'historic',
  BEACH = 'beach'
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
  estimatedDuration?: string;
  aiInsights?: string;
  bestVisitingTime?: string;
  localTips?: string[];
  bookingId?: string;
  isCompleted?: boolean;
  notes?: string;
  votes?: number;
  rating?: number;
}

export interface WeatherInfo {
  temperature: string;
  condition: string;
  forecast: string;
  humidity?: string;
  wind?: string;
  icon?: string;
}

export interface DayPlan {
  day: number;
  date?: string;
  title?: string;
  activities: Activity[];
  dailyTotal: number;
  accommodationCost: number;
  notes?: string;
  weather?: WeatherInfo;
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
  actualExpenses?: ExpenseItem[];
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
  travelers?: number;
  preferences: ActivityType[];
  startDate?: string;
  travelStyle?: string;
  foodPreferences?: string;
  accommodationType?: string;
}

// ─── TRAVEL OPERATING SYSTEM DOMAIN ENTITIES ──────────────────────────

export type TripRole = 'owner' | 'editor' | 'viewer';

export interface TripMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: TripRole;
}

export type BookingType = 'hotel' | 'flight' | 'train' | 'bus' | 'activity' | 'restaurant' | 'car_rental';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';

export interface BookingItem {
  id: string;
  tripId: string;
  type: BookingType;
  title: string;
  provider: string;
  bookingRef: string;
  confirmationCode?: string;
  date: string;
  endDate?: string;
  time?: string;
  location: string;
  cost: number;
  currency: string;
  status: BookingStatus;
  notes?: string;
  attachmentName?: string;
  dayIndex?: number;
}

export interface AccommodationOption {
  id: string;
  name: string;
  destination: string;
  type: 'Hotel' | 'Hostel' | 'Apartment' | 'Resort' | 'Villa';
  pricePerNight: number;
  currency: string;
  rating: number;
  reviewsCount: number;
  location: string;
  coordinates?: { lat: number; lng: number };
  imageUrl: string;
  amenities: string[];
  cancellation: string;
  isBooked?: boolean;
}

export type TransportType = 'flight' | 'train' | 'bus' | 'car' | 'taxi' | 'ferry';

export interface TransportItem {
  id: string;
  tripId: string;
  type: TransportType;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  carrier: string;
  carrierNumber?: string;
  seatOrClass?: string;
  cost: number;
  currency: string;
  bookingRef?: string;
  notes?: string;
  dayIndex?: number;
}

export type ExpenseCategory = 
  | 'Accommodation' 
  | 'Transport' 
  | 'Food' 
  | 'Activities' 
  | 'Shopping' 
  | 'Visa' 
  | 'Insurance' 
  | 'Miscellaneous';

export interface ExpenseItem {
  id: string;
  tripId?: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  description: string;
  date: string | Date;
  paidBy: string; // Member name or ID
  splitBetween: string[]; // Member names or IDs
  isSettled?: boolean;
}

export interface PackingItem {
  id: string;
  tripId: string;
  category: 'Clothing' | 'Toiletries' | 'Electronics' | 'Documents' | 'Medicine' | 'Accessories' | 'Custom';
  name: string;
  isPacked: boolean;
  assignedTo?: string;
}

export interface TravelDocument {
  id: string;
  tripId: string;
  title: string;
  type: 'Passport' | 'Visa' | 'Flight Ticket' | 'Hotel Voucher' | 'Insurance' | 'Driver License' | 'Other';
  fileUrl?: string;
  fileName: string;
  uploadedAt: string;
  expiryDate?: string;
  linkedDay?: number;
  notes?: string;
}

export interface ActivityVoteOption {
  id: string;
  name: string;
  description: string;
  location: string;
  cost: number;
  votes: string[]; // member names who voted
}

export interface TripPoll {
  id: string;
  tripId: string;
  day: number;
  question: string;
  options: ActivityVoteOption[];
  isClosed?: boolean;
  selectedOptionId?: string;
}

export interface SavedPlace {
  id: string;
  name: string;
  destination: string;
  category: 'Hotel' | 'Restaurant' | 'Activity' | 'Attraction' | 'Viewpoint';
  status: 'want_to_visit' | 'loved_it' | 'recommend' | 'avoid';
  notes?: string;
  coordinates?: { lat: number; lng: number };
  imageUrl?: string;
  rating?: number;
  savedAt: string;
}

export interface JournalEntry {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  title: string;
  content: string;
  location: string;
  photos: string[];
  isPublic: boolean;
  createdAt: string;
}

export interface DestinationGuide {
  id: string;
  name: string;
  country: string;
  tagline: string;
  overview: string;
  bestTimeToVisit: string;
  avgBudgetMin: number;
  avgBudgetMax: number;
  currency: string;
  howToReach: string;
  category: 'Trending' | 'Beach' | 'Mountains' | 'Culture' | 'Food' | 'Adventure' | 'Luxury' | 'Budget' | 'Solo' | 'Couples';
  imageUrl: string;
  popularAreas: string[];
  topExperiences: string[];
  coordinates: { lat: number; lng: number };
  /** Kind of place ("City", "Country", …) for results that come from live place search. */
  placeType?: string;
  /** True while budget, season and experiences still have to be generated for this place. */
  needsDetails?: boolean;
}

export interface Trip {
  id: string;
  userId: string;
  title: string;
  destination: string;
  destinationCoords?: { lat: number; lng: number };
  startDate: string;
  endDate: string;
  duration: number;
  travelers: number;
  travelStyle: string;
  totalBudget: number;
  currency: string;
  coverImage?: string;
  itinerary: Itinerary;
  members: TripMember[];
  bookings: BookingItem[];
  transports: TransportItem[];
  expenses: ExpenseItem[];
  packingList: PackingItem[];
  documents: TravelDocument[];
  journalEntries: JournalEntry[];
  polls: TripPoll[];
  isPublic: boolean;
  likesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityTripTemplate {
  id: string;
  title: string;
  destination: string;
  country: string;
  duration: number;
  citiesCount: number;
  estimatedBudget: number;
  currency: string;
  activitiesCount: number;
  coverImage: string;
  author: {
    name: string;
    avatarUrl?: string;
  };
  likes: number;
  tags: string[];
  tripData: Trip;
}

// ─── REAL-TIME EMAIL & NOTIFICATION SYSTEM TYPES ───────────────────────

export enum EmailEventType {
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGIN = 'USER_LOGIN',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  TRIP_CREATED = 'TRIP_CREATED',
  AI_TRIP_GENERATED = 'AI_TRIP_GENERATED',
  TRIP_UPDATED = 'TRIP_UPDATED',
  TRIP_SUMMARY_REQUESTED = 'TRIP_SUMMARY_REQUESTED',
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_UPDATED = 'BOOKING_UPDATED',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',
  ITINERARY_UPDATED = 'ITINERARY_UPDATED',
  EXPENSE_ADDED = 'EXPENSE_ADDED',
  TRIP_REMINDER = 'TRIP_REMINDER',
  FLIGHT_REMINDER = 'FLIGHT_REMINDER',
  HOTEL_CHECKIN_REMINDER = 'HOTEL_CHECKIN_REMINDER',
  ACTIVITY_REMINDER = 'ACTIVITY_REMINDER',
  OFFER_MATCHED = 'OFFER_MATCHED',
  OFFER_EXPIRED = 'OFFER_EXPIRED',
  DOCUMENT_ADDED = 'DOCUMENT_ADDED',
  SECURITY_ALERT = 'SECURITY_ALERT',
  DAILY_DIGEST = 'DAILY_DIGEST'
}

export type EmailDeliveryStatus = 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED';

export interface EmailLog {
  id: string;
  userId: string;
  recipientEmail: string;
  recipientName: string;
  eventType: EmailEventType;
  subject: string;
  htmlBody: string;
  textBody?: string;
  relatedTripId?: string;
  relatedBookingId?: string;
  status: EmailDeliveryStatus;
  providerMessageId?: string;
  attempts: number;
  maxAttempts: number;
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
  createdAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  eventType: EmailEventType;
  title: string;
  message: string;
  read: boolean;
  relatedTripId?: string;
  relatedBookingId?: string;
  actionUrl?: string;
  createdAt: string;
}

export interface TravelOffer {
  id: string;
  provider: string;
  title: string;
  destination: string;
  category: 'Hotel' | 'Flight' | 'Activity' | 'Package' | 'Train';
  discountPercentage: number;
  originalPrice: number;
  offerPrice: number;
  currency: string;
  validUntil: string;
  imageUrl: string;
  terms: string;
  url?: string;
  targetTravelStyles?: string[];
  maxBudget?: number;
  isExpired?: boolean;
}

export interface OfferMatch {
  id: string;
  userId: string;
  offerId: string;
  tripId?: string;
  matchedReason: string;
  emailedAt?: string;
  createdAt: string;
}

export interface EmailPayload {
  user: User;
  trip?: Trip;
  booking?: BookingItem;
  previousBooking?: Partial<BookingItem>;
  offer?: TravelOffer;
  customData?: Record<string, any>;
}

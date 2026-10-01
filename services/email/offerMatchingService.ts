import { TravelOffer, OfferMatch, User, Trip, NotificationPreference } from '../../types';
import { databaseService } from '../databaseService';

// Curated active travel offers in real-world travel hotspots
export const ACTIVE_TRAVEL_OFFERS: TravelOffer[] = [
  {
    id: 'off_tokyo_edition',
    provider: 'Marriott Bonvoy',
    title: 'The Tokyo Edition Toranomon — 20% Exclusive Stay Discount',
    destination: 'Tokyo',
    category: 'Hotel',
    discountPercentage: 20,
    originalPrice: 55000,
    offerPrice: 44000,
    currency: '₹',
    validUntil: '2026-10-31',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
    terms: 'Valid on deluxe rooms. High floor Tokyo Tower view included. Subject to availability.',
    targetTravelStyles: ['Luxury', 'Curious Explorer', 'Couples', 'Culture'],
    maxBudget: 200000,
    isExpired: false
  },
  {
    id: 'off_bali_villa',
    provider: 'Ubud Eco Retreats',
    title: 'Private Infinity Pool Villa in Ubud — 25% Off Weekday Stays',
    destination: 'Bali',
    category: 'Hotel',
    discountPercentage: 25,
    originalPrice: 28000,
    offerPrice: 21000,
    currency: '₹',
    validUntil: '2026-11-15',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
    terms: 'Includes daily gourmet floating breakfast and 60-min Balinese spa session.',
    targetTravelStyles: ['Relaxation', 'Nature', 'Couples', 'Solo'],
    maxBudget: 120000,
    isExpired: false
  },
  {
    id: 'off_goa_scuba',
    provider: 'Goa Aqua Adventures',
    title: 'Grand Island Scuba Diving & Dolphin Safari Expedition',
    destination: 'Goa',
    category: 'Activity',
    discountPercentage: 30,
    originalPrice: 5500,
    offerPrice: 3850,
    currency: '₹',
    validUntil: '2026-12-01',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    terms: 'PADI certified instructors, all equipment & underwater video footage included.',
    targetTravelStyles: ['Adventure', 'Nature', 'Beach', 'Food'],
    maxBudget: 60000,
    isExpired: false
  },
  {
    id: 'off_japan_shinkansen',
    provider: 'JR Pass Network',
    title: 'JR 7-Day Hokuriku Arch Shinkansen Pass — Tokyo to Kyoto Express',
    destination: 'Kyoto',
    category: 'Train',
    discountPercentage: 15,
    originalPrice: 24000,
    offerPrice: 20400,
    currency: '₹',
    validUntil: '2026-11-30',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    terms: 'Unlimited travel on Hokuriku Shinkansen bullet trains between Tokyo, Kanazawa, and Kyoto.',
    targetTravelStyles: ['Curious Explorer', 'Culture', 'Solo', 'Budget'],
    maxBudget: 150000,
    isExpired: false
  },
  {
    id: 'off_swiss_alps_pass',
    provider: 'Swiss Travel System',
    title: 'Jungfrau Region Alpine Cableways & Scenic Rail Special',
    destination: 'Swiss Alps',
    category: 'Activity',
    discountPercentage: 20,
    originalPrice: 32000,
    offerPrice: 25600,
    currency: '₹',
    validUntil: '2026-12-31',
    imageUrl: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=600&q=80',
    terms: 'Access to Top of Europe Jungfraujoch, Grindelwald-First cliff walk, and Lake Brienz cruises.',
    targetTravelStyles: ['Mountains', 'Adventure', 'Nature', 'Luxury'],
    maxBudget: 250000,
    isExpired: false
  }
];

export class OfferMatchingService {
  /**
   * Evaluates active offers against a user's upcoming trips, style, and budget.
   * Respects user notification preferences, frequency caps, expiration, and deduplication.
   */
  async matchOffersForUser(user: User, trips: Trip[]): Promise<{
    matchedOffers: Array<{ offer: TravelOffer; trip?: Trip; reason: string }>;
    skippedReasons: string[];
  }> {
    const preferences: NotificationPreference = await databaseService.getNotificationPreferences(user.id);
    const skippedReasons: string[] = [];

    // 1. Check preferences: User must have email notifications, marketing emails, and offers enabled
    if (!preferences.emailNotificationsEnabled) {
      skippedReasons.push('User has disabled all email notifications');
      return { matchedOffers: [], skippedReasons };
    }
    if (!preferences.marketingEmailsEnabled) {
      skippedReasons.push('User has disabled marketing and promotional emails');
      return { matchedOffers: [], skippedReasons };
    }
    if (!preferences.offersEnabled) {
      skippedReasons.push('User has disabled travel offers');
      return { matchedOffers: [], skippedReasons };
    }

    // 2. Frequency Control: Check how many offer emails user received in the past 7 days
    const pastMatches = await databaseService.getOfferMatches(user.id);
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentOfferCount = pastMatches.filter(m => m.emailedAt && new Date(m.emailedAt).getTime() > oneWeekAgo).length;

    const maxWeekly = preferences.maxOffersPerWeek || 2;
    if (recentOfferCount >= maxWeekly) {
      skippedReasons.push(`User reached maximum weekly offer limit (${recentOfferCount}/${maxWeekly})`);
      return { matchedOffers: [], skippedReasons };
    }

    const availableSlots = maxWeekly - recentOfferCount;
    const matchedOffers: Array<{ offer: TravelOffer; trip?: Trip; reason: string }> = [];

    const nowIso = new Date().toISOString().split('T')[0];

    // 3. Evaluate each active offer
    for (const offer of ACTIVE_TRAVEL_OFFERS) {
      if (matchedOffers.length >= availableSlots) break;

      // Check offer expiration
      if (offer.isExpired || offer.validUntil < nowIso) {
        continue;
      }

      // Check deduplication: Did we already email this offer to this user?
      const alreadyEmailed = pastMatches.some(m => m.offerId === offer.id && m.emailedAt);
      if (alreadyEmailed) {
        continue;
      }

      // Check if user has an upcoming trip matching the offer destination
      const matchingTrip = trips.find(t => {
        const destLower = t.destination.toLowerCase();
        const offerDestLower = offer.destination.toLowerCase();
        return destLower.includes(offerDestLower) || offerDestLower.includes(destLower);
      });

      if (matchingTrip) {
        // High confidence match: Direct destination alignment!
        const reason = `Matches your upcoming ${matchingTrip.destination} trip! Save ${offer.discountPercentage}% on ${offer.category.toLowerCase()} reservations.`;
        matchedOffers.push({ offer, trip: matchingTrip, reason });
        continue;
      }

      // Check if travel style or budget aligns
      if (offer.targetTravelStyles && user.travelStyle) {
        const styleMatch = offer.targetTravelStyles.some(s => 
          s.toLowerCase().includes(user.travelStyle!.toLowerCase()) || 
          user.travelStyle!.toLowerCase().includes(s.toLowerCase())
        );
        if (styleMatch) {
          const reason = `Handpicked for your '${user.travelStyle}' travel taste — save ${offer.discountPercentage}% in ${offer.destination}.`;
          matchedOffers.push({ offer, reason });
        }
      }
    }

    return { matchedOffers, skippedReasons };
  }

  /**
   * Records that an offer was sent to the user to prevent duplicate spamming.
   */
  async recordOfferSent(userId: string, offerId: string, tripId?: string, reason?: string) {
    const match: OfferMatch = {
      id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      offerId,
      tripId,
      matchedReason: reason || 'Personalized offer recommendation',
      emailedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    await databaseService.saveOfferMatch(match);
  }
}

export const offerMatchingService = new OfferMatchingService();

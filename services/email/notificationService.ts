import { 
  EmailEventType, 
  EmailPayload, 
  InAppNotification, 
  User, 
  Trip, 
  BookingItem, 
  TravelOffer 
} from '../../types';
import { databaseService } from '../databaseService';
import { emailQueue } from './emailQueue';
import { emailTemplates } from './emailTemplates';

class NotificationService {
  private itineraryDebounceTimers: Map<string, any> = new Map();

  /**
   * Central Event Processor.
   * Dispatches both In-App Notifications and queued transactional/marketing emails.
   */
  async emitEvent(
    eventType: EmailEventType, 
    payload: EmailPayload
  ): Promise<{ inAppId?: string; emailLogId?: string; skippedReason?: string }> {
    const { user, trip, booking, previousBooking, offer, customData } = payload;
    if (!user || !user.email) {
      return { skippedReason: 'User or recipient email missing' };
    }

    const preferences = await databaseService.getNotificationPreferences(user.id);

    // ─── 1. CREATE IN-APP NOTIFICATION ──────────────────────────────
    const inAppTitle = this.resolveInAppTitle(eventType, payload);
    const inAppMessage = this.resolveInAppMessage(eventType, payload);
    const actionUrl = this.resolveDeepLink(eventType, payload);

    let createdInApp: InAppNotification | undefined;
    try {
      createdInApp = await databaseService.addInAppNotification({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId: user.id,
        eventType,
        title: inAppTitle,
        message: inAppMessage,
        read: false,
        relatedTripId: trip?.id,
        relatedBookingId: booking?.id,
        actionUrl,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('[NotificationService] In-app notification creation error:', e);
    }

    // ─── 2. CHECK EMAIL PREFERENCES & THROTTLES ──────────────────────
    const checkResult = this.shouldSendEmail(eventType, preferences);
    if (!checkResult.shouldSend) {
      return { inAppId: createdInApp?.id, skippedReason: checkResult.reason };
    }

    // ─── 3. RENDER EMAIL TEMPLATE ────────────────────────────────────
    const rendered = this.renderEmail(eventType, payload);
    if (!rendered) {
      return { inAppId: createdInApp?.id, skippedReason: `No template found for event ${eventType}` };
    }

    // ─── 4. ASYNC QUEUE DISPATCH ─────────────────────────────────────
    const emailLogId = await emailQueue.enqueue({
      userId: user.id,
      recipientEmail: user.email,
      recipientName: user.name || 'Traveler',
      eventType,
      subject: rendered.subject,
      htmlBody: rendered.html,
      textBody: rendered.text,
      relatedTripId: trip?.id,
      relatedBookingId: booking?.id
    });

    return {
      inAppId: createdInApp?.id,
      emailLogId
    };
  }

  /**
   * Validates whether an email should be sent according to user preferences,
   * and verification status.
   */
  private shouldSendEmail(
    eventType: EmailEventType,
    prefs: any
  ): { shouldSend: boolean; reason?: string } {
    // Master switch for non-security emails
    if (eventType !== EmailEventType.SECURITY_ALERT && eventType !== EmailEventType.PASSWORD_CHANGED) {
      if (!prefs.emailNotificationsEnabled) {
        return { shouldSend: false, reason: 'User disabled email notifications' };
      }
    }

    // Event-specific switches
    switch (eventType) {
      case EmailEventType.USER_LOGIN: {
        if (!prefs.loginAlertsEnabled) {
          return { shouldSend: false, reason: 'Login alerts disabled in preferences' };
        }
        break;
      }

      case EmailEventType.BOOKING_CREATED:
      case EmailEventType.BOOKING_CONFIRMED:
      case EmailEventType.BOOKING_UPDATED:
      case EmailEventType.BOOKING_CANCELLED: {
        if (!prefs.bookingNotificationsEnabled) {
          return { shouldSend: false, reason: 'Booking notifications disabled' };
        }
        break;
      }

      case EmailEventType.ITINERARY_UPDATED: {
        if (!prefs.itineraryUpdatesEnabled) {
          return { shouldSend: false, reason: 'Itinerary update notifications disabled' };
        }
        break;
      }

      case EmailEventType.TRIP_REMINDER:
      case EmailEventType.FLIGHT_REMINDER:
      case EmailEventType.HOTEL_CHECKIN_REMINDER:
      case EmailEventType.ACTIVITY_REMINDER: {
        if (!prefs.travelAlertsEnabled) {
          return { shouldSend: false, reason: 'Travel reminder alerts disabled' };
        }
        break;
      }

      case EmailEventType.OFFER_MATCHED: {
        if (!prefs.marketingEmailsEnabled || !prefs.offersEnabled) {
          return { shouldSend: false, reason: 'Marketing & travel offers disabled' };
        }
        if (!prefs.emailVerified) {
          return { shouldSend: false, reason: 'Email not verified for promotional offers' };
        }
        break;
      }

      default:
        break;
    }

    return { shouldSend: true };
  }

  /**
   * Matches the event type to the appropriate HTML and plain text email template.
   */
  private renderEmail(eventType: EmailEventType, payload: EmailPayload): { subject: string; html: string; text?: string } | null {
    const { user, trip, booking, previousBooking, offer, customData } = payload;

    switch (eventType) {
      case EmailEventType.USER_REGISTERED:
        return emailTemplates.welcome(user);

      case EmailEventType.USER_LOGIN:
        return emailTemplates.loginAlert(user, customData?.loginTime, customData?.device);

      case EmailEventType.TRIP_CREATED:
        if (!trip) return null;
        return emailTemplates.tripCreated(user, trip);

      case EmailEventType.AI_TRIP_GENERATED:
        if (!trip) return null;
        return emailTemplates.aiItineraryGenerated(user, trip);

      case EmailEventType.TRIP_SUMMARY_REQUESTED:
        if (!trip) return null;
        return emailTemplates.tripSummary(user, trip);

      case EmailEventType.BOOKING_CONFIRMED:
      case EmailEventType.BOOKING_CREATED:
        if (!trip || !booking) return null;
        return emailTemplates.bookingConfirmation(user, trip, booking);

      case EmailEventType.BOOKING_UPDATED: {
        if (!trip || !booking) return null;
        const changedField = customData?.changedField || 'Schedule / Reservation Details';
        const oldValue = customData?.oldValue || (previousBooking?.date || 'Previous details');
        const newValue = customData?.newValue || (booking.date || 'Updated details');
        return emailTemplates.bookingUpdated(user, trip, booking, changedField, oldValue, newValue);
      }

      case EmailEventType.BOOKING_CANCELLED:
        if (!trip || !booking) return null;
        return emailTemplates.bookingCancelled(user, trip, booking, customData?.refundInfo);

      case EmailEventType.ITINERARY_UPDATED: {
        if (!trip) return null;
        const changeSummary = customData?.changeSummary || 'Updated activity timeline';
        const updatedBy = customData?.updatedBy || 'AI Travel Assistant';
        return emailTemplates.itineraryUpdated(user, trip, changeSummary, updatedBy);
      }

      case EmailEventType.TRIP_REMINDER:
      case EmailEventType.FLIGHT_REMINDER:
      case EmailEventType.HOTEL_CHECKIN_REMINDER: {
        if (!trip) return null;
        const reminderType = eventType === EmailEventType.HOTEL_CHECKIN_REMINDER ? 'hotel' : (eventType === EmailEventType.FLIGHT_REMINDER ? 'flight' : 'upcoming');
        const daysLeft = customData?.daysBefore || 1;
        return emailTemplates.travelReminder(user, trip, reminderType, daysLeft);
      }

      case EmailEventType.OFFER_MATCHED: {
        if (!offer) return null;
        const reason = customData?.matchedReason || (trip ? `Special offer for your trip to ${trip.destination}` : `Curated for your travel style`);
        return emailTemplates.travelOffer(user, offer, reason);
      }

      case EmailEventType.SECURITY_ALERT:
      case EmailEventType.PASSWORD_CHANGED: {
        const desc = customData?.actionDescription || customData?.actionTitle || 'A security event was recorded on your account.';
        return emailTemplates.securityAlert(user, desc);
      }

      default:
        return null;
    }
  }

  /**
   * Generates a concise in-app notification title.
   */
  private resolveInAppTitle(eventType: EmailEventType, payload: EmailPayload): string {
    const { trip, booking, offer } = payload;
    switch (eventType) {
      case EmailEventType.USER_REGISTERED:
        return 'Welcome to VoyageAgent AI 🌍';
      case EmailEventType.USER_LOGIN:
        return 'New Login Detected ✈️';
      case EmailEventType.TRIP_CREATED:
        return `Trip Created: ${trip?.destination || 'New Journey'}`;
      case EmailEventType.AI_TRIP_GENERATED:
        return `AI Itinerary Ready for ${trip?.destination || 'your trip'} ✨`;
      case EmailEventType.TRIP_SUMMARY_REQUESTED:
        return `Trip Summary Sent: ${trip?.destination || 'Your Journey'}`;
      case EmailEventType.BOOKING_CONFIRMED:
        return `Booking Confirmed: ${booking?.title || 'Reservation'}`;
      case EmailEventType.BOOKING_UPDATED:
        return `Booking Updated: ${booking?.title || 'Reservation'}`;
      case EmailEventType.BOOKING_CANCELLED:
        return `Booking Cancelled: ${booking?.title || 'Reservation'}`;
      case EmailEventType.ITINERARY_UPDATED:
        return `Itinerary Updated: ${trip?.destination || 'Trip'}`;
      case EmailEventType.TRIP_REMINDER:
        return `Upcoming Journey: ${trip?.destination || 'Trip'} approaches!`;
      case EmailEventType.FLIGHT_REMINDER:
        return `Flight Reminder: ${booking?.title || 'Your upcoming flight'}`;
      case EmailEventType.HOTEL_CHECKIN_REMINDER:
        return `Hotel Check-in Tomorrow: ${booking?.title || 'Your stay'}`;
      case EmailEventType.OFFER_MATCHED:
        return `Special Travel Offer: ${offer?.destination || 'Special Deal'}`;
      case EmailEventType.SECURITY_ALERT:
      case EmailEventType.PASSWORD_CHANGED:
        return 'Security Alert 🔒';
      default:
        return 'Travel Notification';
    }
  }

  /**
   * Generates a descriptive in-app notification message.
   */
  private resolveInAppMessage(eventType: EmailEventType, payload: EmailPayload): string {
    const { trip, booking, offer, customData } = payload;
    switch (eventType) {
      case EmailEventType.USER_REGISTERED:
        return 'Start planning your next adventure with intelligent AI routes, booking tracking, and budget management.';
      case EmailEventType.USER_LOGIN:
        return `Logged in at ${customData?.loginTime || new Date().toLocaleTimeString()}. Review security if this wasn't you.`;
      case EmailEventType.TRIP_CREATED:
        return `${trip?.destination} (${trip?.duration} days, ${trip?.travelers} travelers) has been created.`;
      case EmailEventType.AI_TRIP_GENERATED:
        return `Your complete AI-curated itinerary for ${trip?.destination} has been generated and dispatched to your email.`;
      case EmailEventType.BOOKING_CONFIRMED:
        return `${booking?.type}: ${booking?.title} confirmed (Ref: ${booking?.bookingRef || 'N/A'}). Details sent to your email.`;
      case EmailEventType.BOOKING_UPDATED:
        return `Schedule or details for ${booking?.title} have been updated.`;
      case EmailEventType.BOOKING_CANCELLED:
        return `Your reservation for ${booking?.title} was cancelled.`;
      case EmailEventType.ITINERARY_UPDATED:
        return customData?.changeSummary || `Activities or timings were updated for ${trip?.destination}.`;
      case EmailEventType.TRIP_REMINDER:
        return `Your trip to ${trip?.destination} is coming up soon! Review your packing list and bookings.`;
      case EmailEventType.OFFER_MATCHED:
        return `${offer?.provider} is offering ${offer?.discountPercentage}% off in ${offer?.destination}. Valid until ${offer?.validUntil}.`;
      default:
        return 'You have a new travel update.';
    }
  }

  /**
   * Resolves safe deep link destination inside the single-page application.
   */
  private resolveDeepLink(eventType: EmailEventType, payload: EmailPayload): string {
    const { trip, booking } = payload;
    if (booking && trip) {
      return `trip:${trip.id}:bookings`;
    }
    if (trip) {
      return `trip:${trip.id}`;
    }
    return 'dashboard';
  }

  // ─── HIGH-LEVEL ACTION HELPERS ──────────────────────────────────────

  async sendWelcomeEmail(user: User) {
    return this.emitEvent(EmailEventType.USER_REGISTERED, { user });
  }

  async sendLoginAlert(user: User, details?: { loginTime?: string; device?: string }) {
    return this.emitEvent(EmailEventType.USER_LOGIN, { 
      user, 
      customData: {
        loginTime: details?.loginTime || new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        device: details?.device || (typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser')
      } 
    });
  }

  async sendTripCreated(user: User, trip: Trip) {
    return this.emitEvent(EmailEventType.TRIP_CREATED, { user, trip });
  }

  async sendAITripGenerated(user: User, trip: Trip) {
    return this.emitEvent(EmailEventType.AI_TRIP_GENERATED, { user, trip });
  }

  async sendTripSummary(user: User, trip: Trip) {
    return this.emitEvent(EmailEventType.TRIP_SUMMARY_REQUESTED, { user, trip });
  }

  async sendBookingConfirmation(user: User, trip: Trip, booking: BookingItem) {
    return this.emitEvent(EmailEventType.BOOKING_CONFIRMED, { user, trip, booking });
  }

  async sendBookingUpdate(user: User, trip: Trip, booking: BookingItem, previousBooking?: Partial<BookingItem>) {
    return this.emitEvent(EmailEventType.BOOKING_UPDATED, { user, trip, booking, previousBooking });
  }

  async sendBookingCancellation(user: User, trip: Trip, booking: BookingItem) {
    return this.emitEvent(EmailEventType.BOOKING_CANCELLED, { user, trip, booking });
  }

  /**
   * Debounced itinerary change helper so rapid drag-and-drops do not trigger 20 emails.
   */
  sendItineraryUpdateDebounced(user: User, trip: Trip, changeSummary: string, debounceMs = 4000) {
    if (this.itineraryDebounceTimers.has(trip.id)) {
      clearTimeout(this.itineraryDebounceTimers.get(trip.id));
    }

    const timer = setTimeout(() => {
      this.itineraryDebounceTimers.delete(trip.id);
      this.emitEvent(EmailEventType.ITINERARY_UPDATED, {
        user,
        trip,
        customData: { changeSummary }
      });
    }, debounceMs);

    this.itineraryDebounceTimers.set(trip.id, timer);
  }

  async sendTravelReminder(user: User, trip: Trip, daysBefore = 3) {
    return this.emitEvent(EmailEventType.TRIP_REMINDER, { 
      user, 
      trip, 
      customData: { daysBefore } 
    });
  }

  async sendOfferEmail(user: User, offer: TravelOffer, trip?: Trip) {
    return this.emitEvent(EmailEventType.OFFER_MATCHED, { user, offer, trip });
  }

  async sendSecurityAlert(user: User, title: string, description: string) {
    return this.emitEvent(EmailEventType.SECURITY_ALERT, {
      user,
      customData: { actionTitle: title, actionDescription: description }
    });
  }
}

export const notificationService = new NotificationService();

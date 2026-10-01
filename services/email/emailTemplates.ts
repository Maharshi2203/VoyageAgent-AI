import { User, Trip, BookingItem, TravelOffer, EmailEventType } from '../../types';

export interface EmailRenderResult {
  subject: string;
  html: string;
  text: string;
}

// ─── BRAND STYLING TOKENS FOR EMAIL ──────────────────────────────────
const BRAND_PRIMARY = '#97A87A';
const BRAND_GLOW = '#B9C99F';
const BG_DARK = '#0B0F14';
const BG_CARD = '#161E2E';
const BORDER_COLOR = '#2D4438';
const TEXT_LIGHT = '#F3F4F6';
const TEXT_MUTED = '#9CA3AF';
const APP_URL = (import.meta as any).env?.VITE_APP_URL || 'https://voyageagent.ai';

const emailHeader = (title: string, subtitle?: string): string => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${BG_DARK}; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <tr>
      <td align="center" style="padding: 30px 15px;">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: ${BG_CARD}; border: 1px solid ${BORDER_COLOR}; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Top Brand Banner -->
          <tr>
            <td style="padding: 28px 36px; border-bottom: 1px solid ${BORDER_COLOR}; background: linear-gradient(135deg, rgba(151,168,122,0.15) 0%, rgba(11,15,20,0.8) 100%);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: ${BRAND_PRIMARY}; padding: 8px 12px; border-radius: 12px; font-weight: 900; font-size: 16px; color: ${BG_DARK}; letter-spacing: 1px;">
                      ✈ VOYAGEAGENT
                    </div>
                  </td>
                  <td align="right">
                    <span style="font-size: 10px; font-weight: 800; color: ${BRAND_GLOW}; text-transform: uppercase; letter-spacing: 2px;">
                      Autonomous Trip OS
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="color: ${TEXT_LIGHT}; font-size: 24px; font-weight: 900; margin: 20px 0 6px 0; letter-spacing: -0.5px; line-height: 1.2;">
                ${title}
              </h1>
              ${subtitle ? `<p style="color: ${TEXT_MUTED}; font-size: 13px; margin: 0; font-weight: 500;">${subtitle}</p>` : ''}
            </td>
          </tr>

          <!-- Main Email Content Area -->
          <tr>
            <td style="padding: 36px 36px 28px 36px; color: ${TEXT_LIGHT}; font-size: 14px; line-height: 1.6;">
`;

const emailFooter = (user: User): string => `
            </td>
          </tr>

          <!-- Footer Area -->
          <tr>
            <td style="padding: 24px 36px 32px 36px; background-color: ${BG_DARK}; border-top: 1px solid ${BORDER_COLOR}; text-align: center;">
              <p style="color: ${TEXT_MUTED}; font-size: 11px; margin: 0 0 10px 0; font-weight: 500;">
                Sent to <strong>${user.email}</strong> • Verified Travel Account
              </p>
              <p style="color: ${TEXT_MUTED}; font-size: 11px; margin: 0 0 14px 0;">
                VoyageAgent AI • Autonomous Expedition Architecture Platform
              </p>
              <div style="font-size: 11px; font-weight: 700;">
                <a href="${APP_URL}?tab=settings" style="color: ${BRAND_GLOW}; text-decoration: none; margin: 0 10px;">Notification Preferences</a>
                <span style="color: ${BORDER_COLOR};">•</span>
                <a href="${APP_URL}" style="color: ${BRAND_GLOW}; text-decoration: none; margin: 0 10px;">Security Center</a>
                <span style="color: ${BORDER_COLOR};">•</span>
                <a href="${APP_URL}" style="color: ${BRAND_GLOW}; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
`;

const ctaButton = (text: string, url: string): string => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0 10px 0;">
    <tr>
      <td style="border-radius: 16px; background-color: ${BRAND_PRIMARY}; text-align: center;">
        <a href="${url}" style="background-color: ${BRAND_PRIMARY}; border: 1px solid ${BRAND_GLOW}; font-family: inherit; font-size: 13px; font-weight: 900; color: ${BG_DARK}; text-decoration: none; padding: 14px 28px; border-radius: 16px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
          ${text} →
        </a>
      </td>
    </tr>
  </table>
`;

// ─── TEMPLATE IMPLEMENTATIONS ─────────────────────────────────────────

export const emailTemplates = {

  // 1. Welcome Email
  welcome(user: User): EmailRenderResult {
    const subject = `Welcome to VoyageAgent AI, ${user.name.split(' ')[0]} 🌍`;
    const html = `
      ${emailHeader('Welcome to Your Travel Operating System', 'Your autonomous travel assistant is now online')}
        <p style="font-size: 16px; font-weight: 700; color: ${TEXT_LIGHT};">Hi ${user.name},</p>
        <p style="color: ${TEXT_MUTED};">
          Welcome to <strong>VoyageAgent AI</strong>. Your account has been registered and verified. You now have access to an intelligent, all-in-one travel operating system where every part of your trip stays connected.
        </p>

        <div style="background-color: rgba(151,168,122,0.08); border: 1px solid ${BORDER_COLOR}; border-radius: 16px; padding: 20px; margin: 24px 0;">
          <h3 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 800; color: ${BRAND_GLOW}; text-transform: uppercase; letter-spacing: 1px;">
            What you can do with VoyageAgent:
          </h3>
          <ul style="margin: 0; padding-left: 20px; color: ${TEXT_LIGHT}; font-size: 13px; line-height: 1.8;">
            <li><strong>Autonomous Trip Architecture:</strong> Plan multi-day itineraries with exact geographic pacing.</li>
            <li><strong>Live Route Mapping:</strong> Visualize transit routes, walking times, and optimal sequencing.</li>
            <li><strong>Stays & Transit Management:</strong> Track hotel reservations, bullet trains, and flight tickets.</li>
            <li><strong>Fiscal Intelligence:</strong> Track budget utilization and auto-split expenses between friends.</li>
            <li><strong>Weather-Smart Packing:</strong> Dynamic checklists adapted to climate and planned activities.</li>
            <li><strong>Encrypted Vault:</strong> Keep passports, visas, and vouchers accessible offline.</li>
          </ul>
        </div>

        ${ctaButton('Plan My First Expedition', `${APP_URL}?action=new-trip`)}
      ${emailFooter(user)}
    `;

    const text = `Hi ${user.name},\n\nWelcome to VoyageAgent AI!\nYour autonomous travel companion is ready.\n\nPlan your first trip at ${APP_URL}`;
    return { subject, html, text };
  },

  // 2. Login Alert Email (Throttled)
  loginAlert(user: User, loginTime: string, ipAddress?: string): EmailRenderResult {
    const subject = `Welcome back to VoyageAgent AI ✈️`;
    const html = `
      ${emailHeader('Account Security Notification', 'New login detected on your registered account')}
        <p style="font-size: 15px; font-weight: 700; color: ${TEXT_LIGHT};">Hi ${user.name},</p>
        <p style="color: ${TEXT_MUTED};">
          You successfully signed into your VoyageAgent account.
        </p>

        <table width="100%" cellspacing="0" cellpadding="10" border="0" style="background-color: rgba(255,255,255,0.03); border: 1px solid ${BORDER_COLOR}; border-radius: 16px; margin: 20px 0;">
          <tr>
            <td style="color: ${TEXT_MUTED}; font-size: 12px; font-weight: 600; width: 35%;">Login Timestamp:</td>
            <td style="color: ${TEXT_LIGHT}; font-size: 13px; font-weight: 800;">${loginTime}</td>
          </tr>
          <tr>
            <td style="color: ${TEXT_MUTED}; font-size: 12px; font-weight: 600;">Registered Email:</td>
            <td style="color: ${BRAND_GLOW}; font-size: 13px; font-weight: 800;">${user.email}</td>
          </tr>
          ${ipAddress ? `
          <tr>
            <td style="color: ${TEXT_MUTED}; font-size: 12px; font-weight: 600;">Approximate Location:</td>
            <td style="color: ${TEXT_LIGHT}; font-size: 13px; font-weight: 600;">${ipAddress}</td>
          </tr>` : ''}
        </table>

        <p style="color: ${TEXT_MUTED}; font-size: 12px;">
          If this was you, no action is required. If you did not initiate this login, please secure your account immediately.
        </p>

        ${ctaButton('Review Account Activity', `${APP_URL}?tab=profile`)}
      ${emailFooter(user)}
    `;

    const text = `Hi ${user.name},\n\nYou logged into VoyageAgent at ${loginTime}.\nIf this wasn't you, review your account: ${APP_URL}`;
    return { subject, html, text };
  },

  // 3. Trip Created Email
  tripCreated(user: User, trip: Trip): EmailRenderResult {
    const subject = `Your ${trip.destination} trip is ready 🗺️`;
    const html = `
      ${emailHeader(`Your ${trip.title} is Created`, `${trip.destination} • ${trip.duration} Days`)}
        <p style="font-size: 15px; font-weight: 700; color: ${TEXT_LIGHT};">Hi ${user.name},</p>
        <p style="color: ${TEXT_MUTED};">
          Your new expedition has been initialized in your travel workspace.
        </p>

        <!-- Trip Overview Card -->
        <table width="100%" cellspacing="0" cellpadding="14" border="0" style="background-color: rgba(151,168,122,0.06); border: 1px solid ${BORDER_COLOR}; border-radius: 18px; margin: 20px 0;">
          <tr>
            <td>
              <span style="font-size: 10px; font-weight: 900; color: ${BRAND_GLOW}; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 6px;">
                TRIP OVERVIEW
              </span>
              <h2 style="font-size: 20px; font-weight: 900; color: ${TEXT_LIGHT}; margin: 0 0 10px 0;">
                ${trip.title}
              </h2>
              <table width="100%" cellspacing="0" cellpadding="4" border="0" style="font-size: 12px; color: ${TEXT_MUTED};">
                <tr>
                  <td width="30%"><strong>Dates:</strong></td>
                  <td style="color: ${TEXT_LIGHT};">${trip.startDate} → ${trip.endDate}</td>
                </tr>
                <tr>
                  <td><strong>Duration:</strong></td>
                  <td style="color: ${TEXT_LIGHT};">${trip.duration} Days</td>
                </tr>
                <tr>
                  <td><strong>Travelers:</strong></td>
                  <td style="color: ${TEXT_LIGHT};">${trip.travelers} Guests</td>
                </tr>
                <tr>
                  <td><strong>Allocated Budget:</strong></td>
                  <td style="color: ${BRAND_PRIMARY}; font-weight: 800; font-size: 14px;">₹${trip.totalBudget.toLocaleString()}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${ctaButton('View My Trip Workspace', `${APP_URL}?trip=${trip.id}`)}
      ${emailFooter(user)}
    `;

    const text = `Hi ${user.name},\n\nYour trip "${trip.title}" to ${trip.destination} has been created.\nView trip: ${APP_URL}?trip=${trip.id}`;
    return { subject, html, text };
  },

  // 4. AI Itinerary Generated Email
  aiItineraryGenerated(user: User, trip: Trip): EmailRenderResult {
    const subject = `Your AI-powered ${trip.destination} itinerary is ready ✨`;
    const firstTwoDays = trip.itinerary.days.slice(0, 2);

    const html = `
      ${emailHeader(`AI Expedition Protocol Synthesized`, `${trip.destination} • Optimized Pacing`)}
        <p style="font-size: 15px; font-weight: 700; color: ${TEXT_LIGHT};">Hi ${user.name},</p>
        <p style="color: ${TEXT_MUTED};">
          Our autonomous travel engine has researched, structured, and validated your ${trip.duration}-day journey to <strong>${trip.destination}</strong> within your budget cap of <strong>₹${trip.totalBudget.toLocaleString()}</strong>.
        </p>

        <!-- Itinerary Snapshot -->
        <div style="margin: 24px 0;">
          <span style="font-size: 11px; font-weight: 900; color: ${BRAND_GLOW}; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 12px;">
            ITINERARY HIGHLIGHTS PREVIEW
          </span>

          ${firstTwoDays.map(day => `
            <div style="background-color: rgba(255,255,255,0.03); border: 1px solid ${BORDER_COLOR}; border-radius: 14px; padding: 14px 18px; margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="font-weight: 900; font-size: 12px; color: ${BRAND_PRIMARY}; text-transform: uppercase;">
                  DAY ${day.day}: ${day.title || 'Curated Exploration'}
                </span>
                <span style="font-size: 11px; color: ${TEXT_MUTED}; font-weight: 700;">
                  ₹${day.dailyTotal.toLocaleString()}
                </span>
              </div>
              <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: ${TEXT_LIGHT}; line-height: 1.6;">
                ${day.activities.slice(0, 3).map(a => `
                  <li>[${a.timeSlot}] <strong>${a.name}</strong> — ${a.location}</li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <p style="color: ${TEXT_MUTED}; font-size: 12px;">
          All activities have been sequenced with precise latitude/longitude coordinates to eliminate redundant transit time.
        </p>

        ${ctaButton('Explore Full Interactive Plan', `${APP_URL}?trip=${trip.id}&tab=itinerary`)}
      ${emailFooter(user)}
    `;

    const text = `Hi ${user.name},\n\nYour AI itinerary for ${trip.destination} (${trip.duration} days) is ready.\nExplore: ${APP_URL}?trip=${trip.id}&tab=itinerary`;
    return { subject, html, text };
  },

  // 5. Complete Trip Summary Email
  tripSummary(user: User, trip: Trip): EmailRenderResult {
    const subject = `Your complete ${trip.destination} trip plan ✈️`;
    const hotels = trip.bookings.filter(b => b.type === 'hotel');
    const flights = trip.bookings.filter(b => b.type === 'flight');
    const totalActs = trip.itinerary.days.reduce((s, d) => s + d.activities.length, 0);

    const html = `
      ${emailHeader(`Complete Expedition Manifest`, `${trip.title}`)}
        <p style="font-size: 15px; font-weight: 700; color: ${TEXT_LIGHT};">Hi ${user.name},</p>
        <p style="color: ${TEXT_MUTED};">
          Here is the complete consolidated travel manifest for your upcoming journey to <strong>${trip.destination}</strong>.
        </p>

        <!-- Overview stats -->
        <table width="100%" cellspacing="0" cellpadding="8" border="0" style="background-color: rgba(255,255,255,0.03); border: 1px solid ${BORDER_COLOR}; border-radius: 16px; margin: 16px 0; font-size: 12px;">
          <tr>
            <td width="25%" align="center" style="border-right: 1px solid ${BORDER_COLOR};">
              <span style="color: ${TEXT_MUTED}; font-size: 10px; text-transform: uppercase;">Duration</span><br>
              <strong style="color: ${TEXT_LIGHT}; font-size: 16px;">${trip.duration} Days</strong>
            </td>
            <td width="25%" align="center" style="border-right: 1px solid ${BORDER_COLOR};">
              <span style="color: ${TEXT_MUTED}; font-size: 10px; text-transform: uppercase;">Activities</span><br>
              <strong style="color: ${BRAND_PRIMARY}; font-size: 16px;">${totalActs}</strong>
            </td>
            <td width="25%" align="center" style="border-right: 1px solid ${BORDER_COLOR};">
              <span style="color: ${TEXT_MUTED}; font-size: 10px; text-transform: uppercase;">Stays</span><br>
              <strong style="color: ${BRAND_GLOW}; font-size: 16px;">${hotels.length || 1}</strong>
            </td>
            <td width="25%" align="center">
              <span style="color: ${TEXT_MUTED}; font-size: 10px; text-transform: uppercase;">Est. Total</span><br>
              <strong style="color: ${TEXT_LIGHT}; font-size: 16px;">₹${trip.itinerary.grandTotal.toLocaleString()}</strong>
            </td>
          </tr>
        </table>

        <!-- Stays & Flights -->
        ${hotels.length > 0 ? `
          <h4 style="color: ${BRAND_GLOW}; font-size: 12px; font-weight: 900; text-transform: uppercase; margin: 20px 0 8px 0; letter-spacing: 1px;">
            🏨 Confirmed Stays
          </h4>
          ${hotels.map(h => `
            <div style="background-color: rgba(151,168,122,0.06); border: 1px solid ${BORDER_COLOR}; border-radius: 12px; padding: 12px 16px; margin-bottom: 8px; font-size: 12px;">
              <strong style="color: ${TEXT_LIGHT}; font-size: 13px;">${h.title}</strong> (${h.provider})<br>
              <span style="color: ${TEXT_MUTED};">Ref: ${h.bookingRef} • ₹${h.cost.toLocaleString()}</span>
            </div>
          `).join('')}
        ` : ''}

        ${flights.length > 0 ? `
          <h4 style="color: ${BRAND_GLOW}; font-size: 12px; font-weight: 900; text-transform: uppercase; margin: 20px 0 8px 0; letter-spacing: 1px;">
            ✈ Confirmed Flights
          </h4>
          ${flights.map(f => `
            <div style="background-color: rgba(151,168,122,0.06); border: 1px solid ${BORDER_COLOR}; border-radius: 12px; padding: 12px 16px; margin-bottom: 8px; font-size: 12px;">
              <strong style="color: ${TEXT_LIGHT}; font-size: 13px;">${f.title}</strong> (${f.location})<br>
              <span style="color: ${TEXT_MUTED};">Ref: ${f.bookingRef} • ₹${f.cost.toLocaleString()}</span>
            </div>
          `).join('')}
        ` : ''}

        <!-- Fiscal Allocation -->
        <table width="100%" cellspacing="0" cellpadding="8" border="0" style="background-color: rgba(255,255,255,0.02); border: 1px solid ${BORDER_COLOR}; border-radius: 14px; margin: 20px 0; font-size: 12px;">
          <tr>
            <td style="color: ${TEXT_MUTED};">Budget Limit:</td>
            <td align="right" style="color: ${TEXT_LIGHT}; font-weight: 700;">₹${trip.totalBudget.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="color: ${TEXT_MUTED};">Planned Spend:</td>
            <td align="right" style="color: ${BRAND_PRIMARY}; font-weight: 700;">₹${trip.itinerary.grandTotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="color: ${TEXT_MUTED};">Reserve Available:</td>
            <td align="right" style="color: ${BRAND_GLOW}; font-weight: 800;">₹${trip.itinerary.remainingBudget.toLocaleString()}</td>
          </tr>
        </table>

        ${ctaButton('Open Trip Workspace', `${APP_URL}?trip=${trip.id}`)}
      ${emailFooter(user)}
    `;

    const text = `Hi ${user.name},\n\nHere is your trip summary for ${trip.title}.\nEstimated spend: ₹${trip.itinerary.grandTotal.toLocaleString()}.\nOpen: ${APP_URL}?trip=${trip.id}`;
    return { subject, html, text };
  },

  // 6. Booking Confirmation Email (Hotel, Flight, Train, Activity, Car Rental)
  bookingConfirmation(user: User, trip: Trip, booking: BookingItem): EmailRenderResult {
    const typeLabel = booking.type.toUpperCase().replace('_', ' ');
    const subject = `${typeLabel} Booking Confirmed — ${booking.title} 🎟️`;

    const html = `
      ${emailHeader(`${typeLabel} Booking Confirmed`, `Trip: ${trip.title}`)}
        <p style="font-size: 15px; font-weight: 700; color: ${TEXT_LIGHT};">Hi ${user.name},</p>
        <p style="color: ${TEXT_MUTED};">
          Your reservation for <strong>${booking.title}</strong> has been logged and confirmed in your trip plan.
        </p>

        <!-- Visual Booking Card Matching UI Design -->
        <table width="100%" cellspacing="0" cellpadding="18" border="0" style="background-color: rgba(151,168,122,0.08); border: 2px solid ${BORDER_COLOR}; border-radius: 20px; margin: 22px 0;">
          <tr>
            <td>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="font-size: 10px; font-weight: 900; background-color: ${BRAND_PRIMARY}; color: ${BG_DARK}; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; letter-spacing: 1px;">
                  ${typeLabel}
                </span>
                <span style="font-size: 11px; font-weight: 800; color: #34D399; text-transform: uppercase;">
                  ✓ CONFIRMED
                </span>
              </div>

              <h2 style="font-size: 20px; font-weight: 900; color: ${TEXT_LIGHT}; margin: 8px 0 4px 0;">
                ${booking.title}
              </h2>
              <p style="color: ${TEXT_MUTED}; font-size: 12px; margin: 0 0 16px 0; font-weight: 600;">
                Provider: ${booking.provider}
              </p>

              <table width="100%" cellspacing="0" cellpadding="6" border="0" style="font-size: 12px; border-top: 1px solid ${BORDER_COLOR}; padding-top: 12px;">
                <tr>
                  <td width="35%" style="color: ${TEXT_MUTED}; font-weight: 600;">Booking Reference:</td>
                  <td style="color: ${BRAND_GLOW}; font-weight: 900; font-size: 14px;">${booking.bookingRef}</td>
                </tr>
                <tr>
                  <td style="color: ${TEXT_MUTED}; font-weight: 600;">Date:</td>
                  <td style="color: ${TEXT_LIGHT}; font-weight: 700;">${booking.date}</td>
                </tr>
                <tr>
                  <td style="color: ${TEXT_MUTED}; font-weight: 600;">Location / Route:</td>
                  <td style="color: ${TEXT_LIGHT}; font-weight: 600;">${booking.location}</td>
                </tr>
                <tr>
                  <td style="color: ${TEXT_MUTED}; font-weight: 600;">Total Cost:</td>
                  <td style="color: ${BRAND_PRIMARY}; font-weight: 900; font-size: 16px;">₹${booking.cost.toLocaleString()}</td>
                </tr>
                ${booking.notes ? `
                <tr>
                  <td style="color: ${TEXT_MUTED}; font-weight: 600;">Notes:</td>
                  <td style="color: ${TEXT_LIGHT}; font-style: italic;">"${booking.notes}"</td>
                </tr>` : ''}
              </table>
            </td>
          </tr>
        </table>

        ${ctaButton('View Booking in Workspace', `${APP_URL}?trip=${trip.id}&tab=bookings`)}
      ${emailFooter(user)}
    `;

    const text = `Hi ${user.name},\n\nYour ${typeLabel} "${booking.title}" is confirmed!\nRef: ${booking.bookingRef}\nPrice: ₹${booking.cost}\nDetails: ${APP_URL}?trip=${trip.id}&tab=bookings`;
    return { subject, html, text };
  },

  // 7. Booking Updated Email
  bookingUpdated(user: User, trip: Trip, booking: BookingItem, changedField: string, oldValue: string, newValue: string): EmailRenderResult {
    const subject = `Booking Updated — ${booking.title}`;
    const html = `
      ${emailHeader('Booking Details Updated', `Trip: ${trip.title}`)}
        <p style="font-size: 15px; font-weight: 700; color: ${TEXT_LIGHT};">Hi ${user.name},</p>
        <p style="color: ${TEXT_MUTED};">
          A detail on your booking <strong>${booking.title}</strong> has been revised.
        </p>

        <div style="background-color: rgba(255,255,255,0.03); border: 1px solid ${BORDER_COLOR}; border-radius: 16px; padding: 18px; margin: 20px 0; font-size: 13px;">
          <p style="color: ${TEXT_MUTED}; margin: 0 0 6px 0;"><strong>Field Changed:</strong> ${changedField}</p>
          <p style="color: #F87171; text-decoration: line-through; margin: 0 0 4px 0;">Previous: ${oldValue}</p>
          <p style="color: #34D399; font-weight: 800; margin: 0;">Updated: ${newValue}</p>
        </div>

        <p style="color: ${TEXT_MUTED}; font-size: 12px;">Booking Reference: <strong>${booking.bookingRef}</strong></p>

        ${ctaButton('View Updated Booking', `${APP_URL}?trip=${trip.id}&tab=bookings`)}
      ${emailFooter(user)}
    `;

    const text = `Hi ${user.name},\n\nYour booking "${booking.title}" was updated.\n${changedField}: ${oldValue} -> ${newValue}`;
    return { subject, html, text };
  },

  // 8. Booking Cancelled Email
  bookingCancelled(user: User, trip: Trip, booking: BookingItem, refundInfo?: string): EmailRenderResult {
    const subject = `Booking Cancelled — ${booking.title}`;
    const html = `
      ${emailHeader('Booking Cancellation Notice', `Trip: ${trip.title}`)}
        <p style="font-size: 15px; font-weight: 700; color: ${TEXT_LIGHT};">Hi ${user.name},</p>
        <p style="color: ${TEXT_MUTED};">
          Your booking for <strong>${booking.title}</strong> (Ref: ${booking.bookingRef}) has been removed or cancelled.
        </p>

        ${refundInfo ? `
          <div style="background-color: rgba(151,168,122,0.1); border: 1px solid ${BORDER_COLOR}; border-radius: 14px; padding: 14px; margin: 18px 0; font-size: 12px; color: ${BRAND_GLOW};">
            <strong>Refund Status:</strong> ${refundInfo}
          </div>
        ` : ''}

        <p style="color: ${TEXT_MUTED}; font-size: 12px;">
          Your trip itinerary and budget have been automatically updated to reflect this cancellation.
        </p>

        ${ctaButton('Open Trip Workspace', `${APP_URL}?trip=${trip.id}`)}
      ${emailFooter(user)}
    `;

    const text = `Hi ${user.name},\n\nYour booking ${booking.title} (${booking.bookingRef}) was cancelled.`;
    return { subject, html, text };
  },

  // 9. Itinerary Updated Email
  itineraryUpdated(user: User, trip: Trip, changeSummary: string, updatedBy: string): EmailRenderResult {
    const subject = `Your ${trip.destination} itinerary was updated 🗺️`;
    const html = `
      ${emailHeader(`Itinerary Schedule Revision`, `${trip.title}`)}
        <p style="font-size: 15px; font-weight: 700; color: ${TEXT_LIGHT};">Hi ${user.name},</p>
        <p style="color: ${TEXT_MUTED};">
          Your itinerary for <strong>${trip.destination}</strong> was recently updated by <strong>${updatedBy}</strong>.
        </p>

        <div style="background-color: rgba(151,168,122,0.06); border: 1px solid ${BORDER_COLOR}; border-radius: 14px; padding: 16px 20px; margin: 20px 0; font-size: 13px;">
          <span style="font-size: 10px; font-weight: 900; color: ${BRAND_GLOW}; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">
            WHAT CHANGED
          </span>
          <p style="color: ${TEXT_LIGHT}; margin: 0; font-weight: 600;">${changeSummary}</p>
        </div>

        ${ctaButton('View Updated Itinerary', `${APP_URL}?trip=${trip.id}&tab=itinerary`)}
      ${emailFooter(user)}
    `;

    const text = `Hi ${user.name},\n\nYour itinerary for ${trip.title} was updated by ${updatedBy}: ${changeSummary}`;
    return { subject, html, text };
  },

  // 10. Travel Reminder Email (Countdown / Hotel Check-in / Flight)
  travelReminder(user: User, trip: Trip, reminderType: 'upcoming' | 'hotel' | 'flight', daysLeft?: number): EmailRenderResult {
    let subject = `Upcoming travel reminder for ${trip.destination} ✈️`;
    let title = `Expedition Approaching!`;
    let detail = `Your trip to ${trip.destination} is ${daysLeft} day(s) away. Ensure all packing and documents are ready.`;

    if (reminderType === 'hotel') {
      subject = `Your hotel check-in is tomorrow 🏨`;
      title = `Hotel Check-in Tomorrow`;
      detail = `Your upcoming stay in ${trip.destination} begins tomorrow. Have your booking confirmation code ready.`;
    } else if (reminderType === 'flight') {
      subject = `Your flight departs tomorrow ✈️`;
      title = `Flight Departure Tomorrow`;
      detail = `Flight check-in is open. Review terminals and ensure your passport is packed.`;
    }

    const html = `
      ${emailHeader(title, `Trip: ${trip.title}`)}
        <p style="font-size: 15px; font-weight: 700; color: ${TEXT_LIGHT};">Hi ${user.name},</p>
        <p style="color: ${TEXT_MUTED}; font-size: 14px; line-height: 1.6;">
          ${detail}
        </p>

        <table width="100%" cellspacing="0" cellpadding="10" border="0" style="background-color: rgba(255,255,255,0.03); border: 1px solid ${BORDER_COLOR}; border-radius: 16px; margin: 20px 0; font-size: 12px;">
          <tr>
            <td style="color: ${TEXT_MUTED}; font-weight: 600;">Destination:</td>
            <td style="color: ${TEXT_LIGHT}; font-weight: 800;">${trip.destination}</td>
          </tr>
          <tr>
            <td style="color: ${TEXT_MUTED}; font-weight: 600;">Dates:</td>
            <td style="color: ${TEXT_LIGHT}; font-weight: 800;">${trip.startDate} → ${trip.endDate}</td>
          </tr>
          <tr>
            <td style="color: ${TEXT_MUTED}; font-weight: 600;">Packing Status:</td>
            <td style="color: ${BRAND_GLOW}; font-weight: 800;">
              ${trip.packingList.filter(p => p.isPacked).length} of ${trip.packingList.length} packed
            </td>
          </tr>
        </table>

        ${ctaButton('Review Trip Preparation', `${APP_URL}?trip=${trip.id}`)}
      ${emailFooter(user)}
    `;

    const text = `Hi ${user.name},\n\n${detail}\nOpen trip: ${APP_URL}?trip=${trip.id}`;
    return { subject, html, text };
  },

  // 11. Relevant Travel Offer Email (Personalized)
  travelOffer(user: User, offer: TravelOffer, matchedReason: string): EmailRenderResult {
    const subject = `${offer.destination} stay offer — save ${offer.discountPercentage}% 🏷️`;
    const html = `
      ${emailHeader(`${offer.destination} Travel Opportunity`, `${offer.discountPercentage}% Discount Verified`)}
        <p style="font-size: 15px; font-weight: 700; color: ${TEXT_LIGHT};">Hi ${user.name},</p>
        <p style="color: ${TEXT_MUTED};">
          We matched a relevant discount that aligns with your travel profile and upcoming plans: <em>"${matchedReason}"</em>.
        </p>

        <!-- Offer Card -->
        <table width="100%" cellspacing="0" cellpadding="16" border="0" style="background-color: rgba(151,168,122,0.08); border: 1px solid ${BRAND_PRIMARY}; border-radius: 20px; margin: 20px 0;">
          <tr>
            <td>
              <span style="font-size: 10px; font-weight: 900; background-color: #FACC15; color: ${BG_DARK}; padding: 4px 8px; border-radius: 6px; text-transform: uppercase;">
                ${offer.discountPercentage}% SAVINGS
              </span>
              <h2 style="font-size: 20px; font-weight: 900; color: ${TEXT_LIGHT}; margin: 10px 0 4px 0;">
                ${offer.title}
              </h2>
              <p style="color: ${TEXT_MUTED}; font-size: 12px; margin: 0 0 12px 0;">
                Provider: ${offer.provider} • ${offer.destination}
              </p>

              <div style="font-size: 14px; margin-bottom: 12px;">
                <span style="color: #F87171; text-decoration: line-through; margin-right: 10px;">
                  ₹${offer.originalPrice.toLocaleString()}
                </span>
                <span style="color: ${BRAND_PRIMARY}; font-weight: 900; font-size: 18px;">
                  ₹${offer.offerPrice.toLocaleString()}
                </span>
              </div>

              <p style="color: ${TEXT_MUTED}; font-size: 11px; margin: 0;">
                Valid until: <strong>${offer.validUntil}</strong> • <em>${offer.terms}</em>
              </p>
            </td>
          </tr>
        </table>

        <p style="color: ${TEXT_MUTED}; font-size: 11px;">
          Note: Prices and availability are subject to provider confirmation.
        </p>

        ${ctaButton('View Matched Offer', `${APP_URL}?tab=discover&dest=${encodeURIComponent(offer.destination)}`)}
      ${emailFooter(user)}
    `;

    const text = `Hi ${user.name},\n\nWe found a ${offer.discountPercentage}% discount in ${offer.destination}: ${offer.title} for ₹${offer.offerPrice}.\nCheck offer: ${APP_URL}`;
    return { subject, html, text };
  },

  // 12. Security Alert Email
  securityAlert(user: User, eventDescription: string): EmailRenderResult {
    const subject = `Security Alert: Your VoyageAgent Account`;
    const html = `
      ${emailHeader('Account Security Update', 'Immediate Verification Notice')}
        <p style="font-size: 15px; font-weight: 700; color: ${TEXT_LIGHT};">Hi ${user.name},</p>
        <p style="color: ${TEXT_MUTED};">
          A security-sensitive event occurred on your account:
        </p>

        <div style="background-color: rgba(248,113,113,0.1); border: 1px solid #F87171; border-radius: 14px; padding: 16px; margin: 20px 0; color: #FCA5A5; font-size: 13px; font-weight: 700;">
          ⚠ ${eventDescription}
        </div>

        <p style="color: ${TEXT_MUTED}; font-size: 12px;">
          Timestamp: ${new Date().toUTCString()}
        </p>
        <p style="color: ${TEXT_MUTED}; font-size: 12px;">
          If you did not authorize this action, please update your credentials immediately.
        </p>

        ${ctaButton('Secure My Account', `${APP_URL}?tab=profile`)}
      ${emailFooter(user)}
    `;

    const text = `Security alert for ${user.email}: ${eventDescription}. Review at ${APP_URL}`;
    return { subject, html, text };
  }
};

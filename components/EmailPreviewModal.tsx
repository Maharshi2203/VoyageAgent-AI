import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  X, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Code, 
  ListFilter, 
  Search, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Shield,
  Trash2
} from 'lucide-react';
import { EmailLog, User, Trip, EmailEventType } from '../types';
import { databaseService } from '../services/databaseService';
import { notificationService } from '../services/email/notificationService';
import { ACTIVE_TRAVEL_OFFERS } from '../services/email/offerMatchingService';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  activeTrip?: Trip | null;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  user,
  activeTrip
}) => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'text' | 'meta'>('preview');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  const fetchLogs = async () => {
    if (!user?.id) return;
    const items = await databaseService.getEmailLogs(user.id);
    setLogs(items);
    if (items.length > 0 && !selectedLog) {
      setSelectedLog(items[0]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, user?.id]);

  useEffect(() => {
    const handleLogUpdate = (e: any) => {
      fetchLogs();
      if (e?.detail && selectedLog?.id === e.detail.id) {
        setSelectedLog(e.detail);
      }
    };

    window.addEventListener('voyage_email_logs_updated', handleLogUpdate);
    window.addEventListener('voyage_email_sent', handleLogUpdate);

    return () => {
      window.removeEventListener('voyage_email_logs_updated', handleLogUpdate);
      window.removeEventListener('voyage_email_sent', handleLogUpdate);
    };
  }, [selectedLog?.id, user?.id]);

  if (!isOpen) return null;

  const handleSendTestEmail = async (type: EmailEventType) => {
    setTestSending(true);
    setTestSuccessMessage(null);
    try {
      const fallbackTrip: Trip = activeTrip || {
        id: `trip_demo_${Date.now()}`,
        userId: user.id,
        title: 'Tokyo & Kyoto Cherry Blossom Journey',
        destination: 'Tokyo, Japan',
        startDate: '2026-10-12',
        endDate: '2026-10-20',
        duration: 8,
        travelers: 2,
        travelStyle: 'Curious Explorer',
        totalBudget: 150000,
        currency: '₹',
        itinerary: {
          id: 'itin_demo',
          destination: 'Tokyo, Japan',
          duration: 8,
          totalBudget: 150000,
          currency: '₹',
          grandTotal: 125000,
          remainingBudget: 25000,
          days: [
            {
              day: 1,
              date: '2026-10-12',
              title: 'Shinjuku & Shibuya Neon Pulse',
              dailyTotal: 1400,
              accommodationCost: 11000,
              activities: [
                { id: 'a1', name: 'Senso-ji Asakusa Heritage Shrine', description: 'Ancient Buddhist temple & Nakamise street', timeSlot: 'Morning', cost: 0, location: 'Asakusa, Tokyo', activityType: 'cultural' as any },
                { id: 'a2', name: 'Shibuya Crossing & Sky Observatory', description: 'Panoramic views of Shibuya intersection', timeSlot: 'Afternoon', cost: 1400, location: 'Shibuya, Tokyo', activityType: 'adventure' as any }
              ]
            }
          ]
        },
        members: [{ id: user.id, name: user.name, email: user.email, role: 'owner' }],
        bookings: [
          {
            id: 'bk_hotel_tokyo',
            tripId: 'trip_demo',
            type: 'hotel',
            title: 'The Tokyo Edition Toranomon',
            provider: 'Marriott Bonvoy',
            bookingRef: 'TYO-8841-MB',
            date: '2026-10-12',
            location: 'Toranomon, Tokyo',
            cost: 44000,
            currency: '₹',
            status: 'confirmed',
            notes: 'High floor Tokyo Tower view requested. Includes breakfast.'
          },
          {
            id: 'bk_flight_hnd',
            tripId: 'trip_demo',
            type: 'flight',
            title: 'Air India AI306 (DEL → HND)',
            provider: 'Air India',
            bookingRef: 'AI-DELHND-748',
            date: '2026-10-12',
            location: 'New Delhi (DEL) → Tokyo Haneda (HND)',
            cost: 38500,
            currency: '₹',
            status: 'confirmed'
          }
        ],
        transports: [],
        expenses: [],
        packingList: [
          { id: 'p1', tripId: 'trip_demo', category: 'Documents', name: 'Passport & Japan Rail Pass', isPacked: true },
          { id: 'p2', tripId: 'trip_demo', category: 'Clothing', name: 'Autumn layer jackets', isPacked: false }
        ],
        documents: [],
        journalEntries: [],
        polls: [],
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const demoBooking = fallbackTrip.bookings[0];
      const demoFlight = fallbackTrip.bookings[1];

      switch (type) {
        case EmailEventType.USER_REGISTERED:
          await notificationService.sendWelcomeEmail(user);
          break;
        case EmailEventType.USER_LOGIN:
          await notificationService.sendLoginAlert(user);
          break;
        case EmailEventType.TRIP_CREATED:
          await notificationService.sendTripCreated(user, fallbackTrip);
          break;
        case EmailEventType.AI_TRIP_GENERATED:
          await notificationService.sendAITripGenerated(user, fallbackTrip);
          break;
        case EmailEventType.TRIP_SUMMARY_REQUESTED:
          await notificationService.sendTripSummary(user, fallbackTrip);
          break;
        case EmailEventType.BOOKING_CONFIRMED:
          await notificationService.sendBookingConfirmation(user, fallbackTrip, demoBooking);
          break;
        case EmailEventType.BOOKING_CANCELLED:
          await notificationService.sendBookingCancellation(user, fallbackTrip, demoBooking);
          break;
        case EmailEventType.ITINERARY_UPDATED:
          await notificationService.sendItineraryUpdateDebounced(user, fallbackTrip, 'Day 2 itinerary revised: Added Meiji Jingu & Harajuku walk', 0);
          break;
        case EmailEventType.TRIP_REMINDER:
          await notificationService.sendTravelReminder(user, fallbackTrip, 3);
          break;
        case EmailEventType.OFFER_MATCHED:
          await notificationService.sendOfferEmail(user, ACTIVE_TRAVEL_OFFERS[0], fallbackTrip);
          break;
        default:
          break;
      }

      await fetchLogs();
      setTestSuccessMessage(`Test email for ${type.replace(/_/g, ' ')} queued!`);
      setTimeout(() => setTestSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Error sending test: ${err.message}`);
    } finally {
      setTestSending(false);
    }
  };

  const handleClearLogs = async () => {
    if (confirm('Clear all local email delivery logs?')) {
      localStorage.removeItem(`voyage_email_logs_${user.id}`);
      setLogs([]);
      setSelectedLog(null);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (filterType !== 'all' && l.eventType !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.subject.toLowerCase().includes(q) ||
        l.recipientEmail.toLowerCase().includes(q) ||
        l.eventType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
      case 'DELIVERED':
        return (
          <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {status}
          </span>
        );
      case 'QUEUED':
      case 'SENDING':
        return (
          <span className="px-2 py-0.5 text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3 animate-spin" />
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-6xl h-[92vh] bg-[#0E1522] border border-[#2D4438] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#2D4438] bg-gradient-to-r from-[#16222F] via-[#111C24] to-[#0E1522] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#97A87A]/20 text-[#B9C99F] border border-[#97A87A]/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">Email System Center & Live Preview</h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black bg-[#97A87A]/15 text-[#B9C99F] border border-[#97A87A]/30 rounded-full">
                  Verified Destination: {user.email}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Audited transactional and marketing email logs with zero fake data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              className="p-2 text-gray-400 hover:text-white transition rounded-xl hover:bg-white/5"
              title="Refresh logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {logs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="p-2 text-rose-400/70 hover:text-rose-400 transition rounded-xl hover:bg-rose-500/10"
                title="Clear logs"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition rounded-xl hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Test Send Ribbon */}
        <div className="px-6 py-2.5 bg-[#0B0F17] border-b border-[#1F2937] flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#B9C99F]" />
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-300">
              Test Triggers:
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto shrink-0 py-1">
            {[
              { type: EmailEventType.USER_REGISTERED, label: 'Welcome' },
              { type: EmailEventType.USER_LOGIN, label: 'Login Alert' },
              { type: EmailEventType.TRIP_CREATED, label: 'Trip Created' },
              { type: EmailEventType.AI_TRIP_GENERATED, label: 'AI Itinerary' },
              { type: EmailEventType.BOOKING_CONFIRMED, label: 'Hotel Booking' },
              { type: EmailEventType.TRIP_SUMMARY_REQUESTED, label: 'Trip Summary' },
              { type: EmailEventType.ITINERARY_UPDATED, label: 'Itinerary Change' },
              { type: EmailEventType.OFFER_MATCHED, label: 'Tokyo Offer' }
            ].map(item => (
              <button
                key={item.type}
                disabled={testSending}
                onClick={() => handleSendTestEmail(item.type)}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#97A87A]/20 hover:text-[#B9C99F] hover:border-[#97A87A]/40 text-gray-300 text-[11px] font-bold border border-white/5 transition flex items-center gap-1 whitespace-nowrap disabled:opacity-50"
              >
                <Send className="w-2.5 h-2.5 text-[#97A87A]" />
                {item.label}
              </button>
            ))}
          </div>

          {testSuccessMessage && (
            <div className="text-[11px] font-bold text-emerald-400 shrink-0 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              ✓ {testSuccessMessage}
            </div>
          )}
        </div>

        {/* Main Body: Left sidebar list & Right preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Log List */}
          <div className="w-80 md:w-96 border-r border-[#2D4438] flex flex-col bg-[#0D131F]">
            {/* Search & Filter */}
            <div className="p-3 border-b border-[#1F2937] space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search subject or event..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#16202E] border border-[#2D4438] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#97A87A]"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-bold text-gray-400">
                {['all', 'BOOKING_CONFIRMED', 'AI_TRIP_GENERATED', 'TRIP_CREATED', 'USER_LOGIN'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-2 py-1 rounded-lg transition shrink-0 ${
                      filterType === f 
                        ? 'bg-[#97A87A] text-[#0B0F14]' 
                        : 'hover:text-white bg-white/5'
                    }`}
                  >
                    {f === 'all' ? 'All Events' : f.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#1F2937]/50 p-2">
              {filteredLogs.length === 0 ? (
                <div className="py-16 text-center text-gray-500 text-xs px-4">
                  <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="font-bold">No emails recorded yet</p>
                  <p className="text-[11px] mt-1 text-gray-600">
                    Trigger any event above or plan a trip to inspect real generated emails.
                  </p>
                </div>
              ) : (
                filteredLogs.map(log => {
                  const isSelected = selectedLog?.id === log.id;
                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`p-3 rounded-2xl cursor-pointer transition my-1 ${
                        isSelected 
                          ? 'bg-[#1E293B] border border-[#97A87A]/50 shadow-md' 
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-[#97A87A] truncate">
                          {log.eventType.replace(/_/g, ' ')}
                        </span>
                        {getStatusBadge(log.status)}
                      </div>

                      <h4 className="text-xs font-bold text-white truncate mb-1">
                        {log.subject}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-gray-500">
                        <span className="truncate max-w-[150px]">{log.recipientEmail}</span>
                        <span>{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Email Inspector */}
          <div className="flex-1 flex flex-col bg-[#0B0F17] overflow-hidden">
            {selectedLog ? (
              <>
                {/* Email Viewer Header */}
                <div className="p-4 border-b border-[#2D4438] bg-[#111A27] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-white">{selectedLog.subject}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span>To: <strong className="text-gray-200">{selectedLog.recipientName}</strong> &lt;{selectedLog.recipientEmail}&gt;</span>
                      <span>•</span>
                      <span>{new Date(selectedLog.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center gap-1 bg-[#0A0E17] p-1 rounded-xl border border-[#2D4438]">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        activeTab === 'preview' 
                          ? 'bg-[#97A87A] text-[#0B0F14]' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Visual HTML
                    </button>
                    <button
                      onClick={() => setActiveTab('text')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        activeTab === 'text' 
                          ? 'bg-[#97A87A] text-[#0B0F14]' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      Plain Text
                    </button>
                    <button
                      onClick={() => setActiveTab('meta')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        activeTab === 'meta' 
                          ? 'bg-[#97A87A] text-[#0B0F14]' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Audit
                    </button>
                  </div>
                </div>

                {/* Content Panel */}
                <div className="flex-1 overflow-y-auto bg-[#070A0F]">
                  {activeTab === 'preview' && (
                    <div className="p-4 flex justify-center">
                      <div className="w-full max-w-2xl bg-[#0B0F14] border border-[#2D4438] rounded-2xl overflow-hidden shadow-2xl">
                        <div 
                          dangerouslySetInnerHTML={{ __html: selectedLog.htmlBody }} 
                          className="email-render-container"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'text' && (
                    <div className="p-6">
                      <pre className="p-4 bg-[#111827] border border-[#1F2937] rounded-2xl text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                        {selectedLog.textBody || 'No plain text fallback provided.'}
                      </pre>
                    </div>
                  )}

                  {activeTab === 'meta' && (
                    <div className="p-6 max-w-xl mx-auto space-y-4">
                      <div className="p-4 rounded-2xl bg-[#111827] border border-[#1F2937] space-y-3 text-xs">
                        <h4 className="font-black text-white text-sm">Delivery Metadata</h4>
                        <div className="grid grid-cols-2 gap-2 text-gray-400">
                          <div>Log ID:</div>
                          <div className="text-white font-mono">{selectedLog.id}</div>

                          <div>Event:</div>
                          <div className="text-[#97A87A] font-bold">{selectedLog.eventType}</div>

                          <div>Status:</div>
                          <div>{getStatusBadge(selectedLog.status)}</div>

                          <div>Attempts:</div>
                          <div className="text-white">{selectedLog.attempts} of {selectedLog.maxAttempts}</div>

                          <div>Provider Msg ID:</div>
                          <div className="text-white font-mono">{selectedLog.providerMessageId || 'N/A'}</div>

                          <div>Created:</div>
                          <div className="text-white">{selectedLog.createdAt}</div>

                          <div>Delivered:</div>
                          <div className="text-white">{selectedLog.deliveredAt || 'Pending / In Queue'}</div>

                          {selectedLog.error && (
                            <>
                              <div className="text-rose-400">Error:</div>
                              <div className="text-rose-400 font-mono">{selectedLog.error}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <Mail className="w-12 h-12 mb-3 opacity-30 text-[#97A87A]" />
                <h4 className="text-base font-bold text-gray-300">Select an email to preview</h4>
                <p className="text-xs text-gray-500 max-w-xs mt-1">
                  Choose from the audit log on the left or trigger an instant test email above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

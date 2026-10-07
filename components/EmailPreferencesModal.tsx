import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  X, 
  ShieldCheck, 
  Mail, 
  Bell, 
  Check, 
  Clock, 
  Sparkles, 
  Tag, 
  Hotel, 
  Plane, 
  Lock 
} from 'lucide-react';
import { User, NotificationPreference } from '../types';
import { databaseService } from '../services/databaseService';

interface EmailPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const EmailPreferencesModal: React.FC<EmailPreferencesModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [preferences, setPreferences] = useState<NotificationPreference>({
    emailVerified: true,
    emailNotificationsEnabled: true,
    marketingEmailsEnabled: true,
    travelAlertsEnabled: true,
    bookingNotificationsEnabled: true,
    loginAlertsEnabled: true,
    itineraryUpdatesEnabled: true,
    offersEnabled: true,
    digestFrequency: 'instant',
    maxOffersPerWeek: 2
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      databaseService.getNotificationPreferences(user.id).then(prefs => {
        setPreferences(prefs);
      });
    }
  }, [isOpen, user?.id]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof NotificationPreference) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await databaseService.saveNotificationPreferences(user.id, preferences);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#0F172A] border border-[#2D4438] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#2D4438] bg-gradient-to-r from-[#16222F] via-[#111C24] to-[#0F172A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#97A87A]/20 text-[#B9C99F] border border-[#97A87A]/30">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Email & Notification Preferences</h2>
              <p className="text-xs text-gray-400">Control automated alerts sent to your registered address</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition rounded-xl hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* User Email & Verification Badge */}
          <div className="p-4 rounded-2xl bg-[#1E293B]/70 border border-[#334155] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#97A87A]/15 border border-[#97A87A]/30 flex items-center justify-center text-[#97A87A] font-black text-base">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{user.email}</span>
                  <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Recipient for authenticated travel confirmations, bookings, and alerts.
                </p>
              </div>
            </div>
          </div>

          {/* Master Email Switch */}
          <div className="p-4 rounded-2xl bg-[#1E293B]/40 border border-[#2D4438] flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Enable Email Notifications</h4>
              <p className="text-xs text-gray-400">Master switch for all travel and trip update emails</p>
            </div>
            <button
              onClick={() => handleToggle('emailNotificationsEnabled')}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                preferences.emailNotificationsEnabled ? 'bg-[#97A87A]' : 'bg-gray-700'
              }`}
            >
              <span 
                className={`block w-4 h-4 rounded-full bg-black absolute top-1 transition-transform ${
                  preferences.emailNotificationsEnabled ? 'right-1' : 'left-1'
                }`} 
              />
            </button>
          </div>

          {/* Granular Notification Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#97A87A]">
              Transactional & Journey Alerts
            </h4>

            {/* Login Alerts */}
            <div className="p-3.5 rounded-2xl bg-[#1E293B]/30 border border-[#334155]/60 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Login Security Alerts</h5>
                  <p className="text-[11px] text-gray-400">
                    Get an email whenever a login occurs
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.loginAlertsEnabled}
                onChange={() => handleToggle('loginAlertsEnabled')}
                className="w-4 h-4 rounded text-[#97A87A] accent-[#97A87A] cursor-pointer"
              />
            </div>

            {/* Booking Confirmations */}
            <div className="p-3.5 rounded-2xl bg-[#1E293B]/30 border border-[#334155]/60 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <Hotel className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Booking Confirmations & Updates</h5>
                  <p className="text-[11px] text-gray-400">
                    Immediate confirmation tickets, schedule changes, and cancellations
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.bookingNotificationsEnabled}
                onChange={() => handleToggle('bookingNotificationsEnabled')}
                className="w-4 h-4 rounded text-[#97A87A] accent-[#97A87A] cursor-pointer"
              />
            </div>

            {/* Travel Reminders */}
            <div className="p-3.5 rounded-2xl bg-[#1E293B]/30 border border-[#334155]/60 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                  <Plane className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Travel & Flight Reminders</h5>
                  <p className="text-[11px] text-gray-400">
                    Reminders 7 days, 3 days, and 24h prior to departure and hotel check-in
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.travelAlertsEnabled}
                onChange={() => handleToggle('travelAlertsEnabled')}
                className="w-4 h-4 rounded text-[#97A87A] accent-[#97A87A] cursor-pointer"
              />
            </div>

            {/* Itinerary Updates */}
            <div className="p-3.5 rounded-2xl bg-[#1E293B]/30 border border-[#334155]/60 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Itinerary & AI Generation Updates</h5>
                  <p className="text-[11px] text-gray-400">
                    Summaries when AI finishes building itineraries or schedules change
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.itineraryUpdatesEnabled}
                onChange={() => handleToggle('itineraryUpdatesEnabled')}
                className="w-4 h-4 rounded text-[#97A87A] accent-[#97A87A] cursor-pointer"
              />
            </div>
          </div>

          {/* Marketing & Personalized Offers */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#97A87A]">
              Personalized Travel Offers & Recommendations
            </h4>

            {/* Offers Toggle */}
            <div className="p-3.5 rounded-2xl bg-[#1E293B]/30 border border-[#334155]/60 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 shrink-0 mt-0.5">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Destination Deals & Stay Discounts</h5>
                  <p className="text-[11px] text-gray-400">
                    Offers specifically matched to your upcoming destination, dates, and budget
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.offersEnabled}
                onChange={() => handleToggle('offersEnabled')}
                className="w-4 h-4 rounded text-[#97A87A] accent-[#97A87A] cursor-pointer"
              />
            </div>

            {/* Marketing Switch */}
            <div className="p-3.5 rounded-2xl bg-[#1E293B]/30 border border-[#334155]/60 flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Promotional Marketing Newsletters</h5>
                  <p className="text-[11px] text-gray-400">
                    Seasonal expedition releases and community curated trip highlights
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.marketingEmailsEnabled}
                onChange={() => handleToggle('marketingEmailsEnabled')}
                className="w-4 h-4 rounded text-[#97A87A] accent-[#97A87A] cursor-pointer"
              />
            </div>

            {/* Max Offers Frequency Cap */}
            {preferences.offersEnabled && (
              <div className="p-3.5 rounded-2xl bg-[#1E293B]/30 border border-[#334155]/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">Maximum Offers Per Week:</span>
                  <span className="text-xs font-black text-[#97A87A]">
                    {preferences.maxOffersPerWeek || 2} offers / week
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={preferences.maxOffersPerWeek || 2}
                  onChange={(e) => setPreferences(prev => ({ ...prev, maxOffersPerWeek: Number(e.target.value) }))}
                  className="w-full accent-[#97A87A] cursor-pointer"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Protects your inbox from spam. We never send unverified or repetitive deals.
                </p>
              </div>
            )}
          </div>

          {/* Delivery Frequency Option */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#97A87A]">
              Delivery Frequency
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'instant', label: 'Instant', desc: 'Real-time triggers' },
                { id: 'daily', label: 'Daily Digest', desc: '1 morning summary' },
                { id: 'weekly', label: 'Weekly', desc: 'Weekend roundup' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setPreferences(prev => ({ ...prev, digestFrequency: f.id as any }))}
                  className={`p-3 rounded-2xl border text-left transition ${
                    preferences.digestFrequency === f.id
                      ? 'bg-[#97A87A]/15 border-[#97A87A] text-white'
                      : 'bg-[#1E293B]/40 border-[#334155] text-gray-400 hover:text-white'
                  }`}
                >
                  <p className="text-xs font-bold">{f.label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{f.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2D4438] bg-[#0E1522] flex items-center justify-between">
          <p className="text-[11px] text-gray-500">
            Changes apply immediately across all automated queues.
          </p>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#97A87A] hover:bg-[#A8BA8B] text-[#0B0F14] font-black text-xs uppercase tracking-wider transition shadow-lg shadow-[#97A87A]/20 disabled:opacity-50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : saving ? (
              <span>Saving...</span>
            ) : (
              <span>Save Preferences</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

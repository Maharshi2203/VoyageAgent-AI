import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  X, 
  ExternalLink, 
  Sparkles, 
  Compass, 
  Hotel, 
  Plane, 
  ShieldCheck, 
  Tag, 
  Settings, 
  Mail, 
  Calendar 
} from 'lucide-react';
import { InAppNotification, EmailEventType } from '../types';
import { databaseService } from '../services/databaseService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onNavigateToTrip?: (tripId: string, tab?: string) => void;
  onOpenPreferences?: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  userId,
  onNavigateToTrip,
  onOpenPreferences
}) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'bookings' | 'trips' | 'offers'>('all');
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await databaseService.getInAppNotifications(userId);
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    const handleNotificationEvent = () => {
      fetchNotifications();
    };

    window.addEventListener('voyage_notification_received', handleNotificationEvent);
    window.addEventListener('voyage_notifications_updated', handleNotificationEvent);

    return () => {
      window.removeEventListener('voyage_notification_received', handleNotificationEvent);
      window.removeEventListener('voyage_notifications_updated', handleNotificationEvent);
    };
  }, [userId]);

  if (!isOpen) return null;

  const handleMarkAsRead = async (id: string) => {
    await databaseService.markNotificationRead(id, userId);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    await databaseService.markAllNotificationsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = async (notif: InAppNotification) => {
    if (!notif.read) {
      await handleMarkAsRead(notif.id);
    }

    if (notif.relatedTripId && onNavigateToTrip) {
      const tab = notif.relatedBookingId ? 'bookings' : 'overview';
      onNavigateToTrip(notif.relatedTripId, tab);
      onClose();
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'bookings') {
      return [
        EmailEventType.BOOKING_CREATED,
        EmailEventType.BOOKING_CONFIRMED,
        EmailEventType.BOOKING_UPDATED,
        EmailEventType.BOOKING_CANCELLED,
        EmailEventType.FLIGHT_REMINDER,
        EmailEventType.HOTEL_CHECKIN_REMINDER
      ].includes(n.eventType);
    }
    if (filter === 'trips') {
      return [
        EmailEventType.TRIP_CREATED,
        EmailEventType.AI_TRIP_GENERATED,
        EmailEventType.ITINERARY_UPDATED,
        EmailEventType.TRIP_REMINDER,
        EmailEventType.TRIP_SUMMARY_REQUESTED
      ].includes(n.eventType);
    }
    if (filter === 'offers') {
      return n.eventType === EmailEventType.OFFER_MATCHED;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (eventType: EmailEventType) => {
    switch (eventType) {
      case EmailEventType.AI_TRIP_GENERATED:
        return <Sparkles className="w-4 h-4 text-[#B9C99F]" />;
      case EmailEventType.BOOKING_CONFIRMED:
      case EmailEventType.HOTEL_CHECKIN_REMINDER:
        return <Hotel className="w-4 h-4 text-[#34D399]" />;
      case EmailEventType.FLIGHT_REMINDER:
        return <Plane className="w-4 h-4 text-[#60A5FA]" />;
      case EmailEventType.TRIP_CREATED:
      case EmailEventType.ITINERARY_UPDATED:
        return <Compass className="w-4 h-4 text-[#FBBF24]" />;
      case EmailEventType.OFFER_MATCHED:
        return <Tag className="w-4 h-4 text-[#F472B6]" />;
      case EmailEventType.SECURITY_ALERT:
      case EmailEventType.USER_LOGIN:
        return <ShieldCheck className="w-4 h-4 text-[#A78BFA]" />;
      default:
        return <Bell className="w-4 h-4 text-[#97A87A]" />;
    }
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-8 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#111827] border border-[#2D4438] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slideDown"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#2D4438] bg-gradient-to-r from-[#16222F] to-[#111827] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#97A87A]/15 text-[#B9C99F] border border-[#97A87A]/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base tracking-tight">Notification Center</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[11px] font-black bg-[#97A87A] text-[#0B0F14] rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">Real-time travel updates & email triggers</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="p-2 text-gray-400 hover:text-white transition rounded-xl hover:bg-white/5"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition rounded-xl hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-3 border-b border-[#1F2937] bg-[#0E1522] overflow-x-auto text-xs font-semibold">
          {(['all', 'unread', 'bookings', 'trips', 'offers'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-all shrink-0 ${
                filter === tab 
                  ? 'bg-[#97A87A] text-[#0B0F14] font-black' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#1F2937]/60 p-2">
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-xs">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-gray-500">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-300">No notifications found</p>
              <p className="text-xs text-gray-500 mt-1 max-w-[240px] mx-auto">
                {filter === 'unread' ? 'You have caught up with all updates.' : 'Important updates about your trips and bookings will appear here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 rounded-2xl transition cursor-pointer flex items-start gap-3 my-1 ${
                  notif.read ? 'bg-transparent hover:bg-white/5' : 'bg-[#1E293B]/60 hover:bg-[#1E293B] border border-[#2D4438]/60'
                }`}
              >
                <div className="p-2 rounded-xl bg-black/40 border border-white/10 shrink-0 mt-0.5">
                  {getNotificationIcon(notif.eventType)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`text-xs font-bold truncate ${notif.read ? 'text-gray-300' : 'text-white'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-gray-500 shrink-0">
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1">
                    <span className="text-[10px] text-[#97A87A] font-bold flex items-center gap-1">
                      {notif.relatedTripId ? 'View in trip' : 'Travel update'}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#97A87A]" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Quick Actions */}
        <div className="p-3.5 border-t border-[#2D4438] bg-[#0E1522] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-medium">
            <Mail className="w-3.5 h-3.5 text-[#97A87A]" />
            <span>Alerts dispatched directly to your Gmail</span>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onOpenPreferences) onOpenPreferences();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 font-semibold transition border border-white/5"
          >
            <Settings className="w-3.5 h-3.5 text-gray-400" />
            <span>Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};

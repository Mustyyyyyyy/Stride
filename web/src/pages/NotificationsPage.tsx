import React, { useEffect, useState } from 'react';
import { useAppStore, AppNotification, NotificationType } from '../store/useAppStore';
import {
  Bell, BellOff, CheckCheck, Trash2, Activity, Target, Trophy,
  Info, Clock, ChevronRight, BellRing,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const TYPE_META: Record<NotificationType, { color: string; bg: string; border: string; icon: React.ReactNode }> = {
  activity: {
    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30',
    icon: <Activity className="w-4 h-4" />,
  },
  achievement: {
    color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30',
    icon: <Trophy className="w-4 h-4" />,
  },
  goal: {
    color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30',
    icon: <Target className="w-4 h-4" />,
  },
  reminder: {
    color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30',
    icon: <Clock className="w-4 h-4" />,
  },
  system: {
    color: 'text-slate-400', bg: 'bg-slate-800/60', border: 'border-slate-700/60',
    icon: <Info className="w-4 h-4" />,
  },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const NotificationsPage: React.FC = () => {
  const {
    notifications, markNotificationRead, markAllNotificationsRead,
    clearNotifications, setActivePage, pushNotification,
  } = useAppStore();

  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');

  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPushPermission(result);
      if (result === 'granted') {
        pushNotification({
          type: 'system',
          title: 'Push Notifications Enabled ✅',
          message: 'You\'ll now receive real-time alerts for your runs, walks, achievements and goals.',
          icon: '🔔',
        });
      }
    }
  };

  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);
  const unread = notifications.filter((n) => !n.read).length;

  const filterTabs: Array<{ id: NotificationType | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'activity', label: 'Activity' },
    { id: 'achievement', label: 'Badges' },
    { id: 'goal', label: 'Goals' },
    { id: 'reminder', label: 'Reminders' },
    { id: 'system', label: 'System' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">

      {/* ─── Header ─── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black font-display text-white">Notifications</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {unread > 0 ? <><span className="text-emerald-400 font-bold">{unread} unread</span> notification{unread !== 1 ? 's' : ''}</> : 'All caught up 🎉'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ─── Push Permission Banner ─── */}
      {pushPermission !== 'granted' && (
        <div className="glass-card p-4 flex items-start gap-4 border-emerald-500/20 bg-gradient-to-r from-emerald-950/30 to-teal-950/20">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5 text-emerald-400 animate-bounce" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-white">Enable Push Notifications</h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Get real-time alerts for your runs, milestone completions, and goal achievements even when the app is in the background.
            </p>
            {pushPermission === 'denied' ? (
              <p className="text-xs text-rose-400 font-semibold mt-2">
                Notifications are blocked. Enable them in your browser settings to receive alerts.
              </p>
            ) : (
              <button
                onClick={requestPushPermission}
                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <Bell className="w-3.5 h-3.5" />
                Enable Notifications
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Filter Tabs ─── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {tab.label}
            {tab.id === 'all' && notifications.length > 0 && (
              <span className="ml-1.5 opacity-70">({notifications.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Notifications List ─── */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center">
            <BellOff className="w-8 h-8 text-slate-600" />
          </div>
          <div>
            <h3 className="font-bold text-white">No notifications yet</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
              {filter === 'all'
                ? 'Start a workout or set a goal and your notifications will appear here.'
                : `No ${filter} notifications. They'll appear here when triggered.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => (
            <NotificationCard
              key={notif.id}
              notif={notif}
              onRead={() => markNotificationRead(notif.id)}
              onNavigate={notif.actionPage ? () => setActivePage(notif.actionPage!) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Notification Card ────────────────────────────────────────────────────────

const NotificationCard: React.FC<{
  notif: AppNotification;
  onRead: () => void;
  onNavigate?: () => void;
}> = ({ notif, onRead, onNavigate }) => {
  const meta = TYPE_META[notif.type];

  const handleClick = () => {
    if (!notif.read) onRead();
    if (onNavigate) onNavigate();
  };

  return (
    <div
      onClick={handleClick}
      className={`relative flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
        notif.read
          ? 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
          : 'bg-slate-900/80 border-slate-700 hover:border-slate-600 shadow-lg'
      }`}
    >
      {/* Unread indicator */}
      {!notif.read && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/40" />
      )}

      {/* Icon */}
      <div className={`w-9 h-9 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center shrink-0 text-lg`}>
        {notif.icon ? (
          <span>{notif.icon}</span>
        ) : (
          <span className={meta.color}>{meta.icon}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className={`font-bold text-sm ${notif.read ? 'text-slate-300' : 'text-white'}`}>{notif.title}</h3>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color} border ${meta.border}`}>
            {notif.type}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{notif.message}</p>
        <span className="text-[11px] text-slate-600 font-medium mt-1 block">{timeAgo(notif.timestamp)}</span>
      </div>

      {/* Chevron if navigable */}
      {onNavigate && (
        <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
      )}
    </div>
  );
};

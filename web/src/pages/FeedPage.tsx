import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Heart, MessageCircle, Share2, MapPin, Clock, Flame, Navigation, Footprints, Zap, Bike, Mountain, Bookmark, MoreHorizontal } from 'lucide-react';

interface FeedItem {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  activity: {
    type: string;
    title: string;
    distance: number;
    duration: number;
    calories: number;
    pace: number;
    steps: number;
    startTime: string;
    polyline?: string;
  };
  likes: number;
  liked: boolean;
  comments: number;
  bookmarked: boolean;
}

const DEMO_FEED: FeedItem[] = [
  {
    id: 'feed_1',
    user: { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    activity: {
      type: 'RUNNING',
      title: 'Morning Golden Gate Run',
      distance: 8540,
      duration: 3420,
      calories: 620,
      pace: 4.2,
      steps: 11200,
      startTime: '2026-08-09T06:30:00Z',
      polyline: '',
    },
    likes: 24,
    liked: false,
    comments: 3,
    bookmarked: false,
  },
  {
    id: 'feed_2',
    user: { name: 'Marcus Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    activity: {
      type: 'CYCLING',
      title: 'Weekend Century Ride',
      distance: 102500,
      duration: 12600,
      calories: 1850,
      pace: 0,
      steps: 0,
      startTime: '2026-08-08T08:00:00Z',
      polyline: '',
    },
    likes: 47,
    liked: true,
    comments: 8,
    bookmarked: true,
  },
  {
    id: 'feed_3',
    user: { name: 'Aisha Patel', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
    activity: {
      type: 'HIKING',
      title: 'Muir Woods Trail Adventure',
      distance: 12500,
      duration: 7200,
      calories: 980,
      pace: 9.6,
      steps: 18500,
      startTime: '2026-08-07T10:15:00Z',
      polyline: '',
    },
    likes: 31,
    liked: false,
    comments: 5,
    bookmarked: false,
  },
  {
    id: 'feed_4',
    user: { name: 'James Wilson', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
    activity: {
      type: 'WALKING',
      title: 'Sunset Beach Stroll',
      distance: 3200,
      duration: 1800,
      calories: 210,
      pace: 9.4,
      steps: 4200,
      startTime: '2026-08-06T19:00:00Z',
      polyline: '',
    },
    likes: 12,
    liked: false,
    comments: 1,
    bookmarked: false,
  },
  {
    id: 'feed_5',
    user: { name: 'Elena Rodriguez', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
    activity: {
      type: 'RUNNING',
      title: 'Half Marathon Training Run',
      distance: 21000,
      duration: 6300,
      calories: 1450,
      pace: 5.0,
      steps: 28500,
      startTime: '2026-08-05T06:00:00Z',
      polyline: '',
    },
    likes: 89,
    liked: true,
    comments: 15,
    bookmarked: false,
  },
];

export const FeedPage: React.FC = () => {
  const [feed, setFeed] = useState<FeedItem[]>(DEMO_FEED);
  const unitSystem = useAppStore((s) => s.unitSystem);

  const toggleLike = (id: string) => {
    setFeed((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              liked: !item.liked,
              likes: item.liked ? item.likes - 1 : item.likes + 1,
            }
          : item,
      ),
    );
  };

  const toggleBookmark = (id: string) => {
    setFeed((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item,
      ),
    );
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} min`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'RUNNING':
        return <Zap className="w-6 h-6 text-emerald-400" />;
      case 'WALKING':
        return <Footprints className="w-6 h-6 text-cyan-400" />;
      case 'CYCLING':
        return <Bike className="w-6 h-6 text-amber-400" />;
      case 'HIKING':
        return <Mountain className="w-6 h-6 text-purple-400" />;
      default:
        return <Activity className="w-6 h-6 text-slate-400" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'RUNNING':
        return 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30';
      case 'WALKING':
        return 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30';
      case 'CYCLING':
        return 'from-amber-500/10 to-orange-500/10 border-amber-500/30';
      case 'HIKING':
        return 'from-purple-500/10 to-pink-500/10 border-purple-500/30';
      default:
        return 'from-slate-500/10 to-slate-500/10 border-slate-500/30';
    }
  };

  const distKm = (m: number) => (m / 1000).toFixed(1);
  const distMiles = (m: number) => (m / 1609.34).toFixed(1);

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-black font-display text-white">Activity Feed</h1>
        <p className="text-xs text-slate-400 font-medium mt-1">See what the community is up to</p>
      </div>

      <div className="space-y-4">
        {feed.map((item) => {
          const displayDist = unitSystem === 'IMPERIAL' ? distMiles(item.activity.distance) : distKm(item.activity.distance);
          const distUnit = unitSystem === 'IMPERIAL' ? 'mi' : 'km';

          return (
            <div
              key={item.id}
              className="glass-card overflow-hidden"
            >
              <div className={`p-6 border-b border-white/[0.04]`}>
                <div className="flex items-center gap-3">
                  <img
                    src={item.user.avatar}
                    alt={item.user.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-900"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.user.name}</h3>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(item.activity.startTime).toLocaleString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(item.activity.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-extrabold text-white font-display">{item.activity.title}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-white/[0.06]">
                      {item.activity.type}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-white/[0.04] text-center">
                    <Navigation className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                    <span className="text-sm font-black text-white font-display block">{displayDist}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{distUnit}</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-white/[0.04] text-center">
                    <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-sm font-black text-white font-display block">{formatDuration(item.activity.duration)}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Time</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-white/[0.04] text-center">
                    <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                    <span className="text-sm font-black text-orange-400 font-display block">{item.activity.calories}</span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">kcal</span>
                  </div>
                  {item.activity.steps > 0 && (
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-white/[0.04] text-center">
                      <Footprints className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <span className="text-sm font-black text-white font-display block">{item.activity.steps.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">steps</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleLike(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        item.liked
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-900 text-slate-400 border border-white/[0.06] hover:text-rose-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${item.liked ? 'fill-rose-400' : ''}`} />
                      <span>{item.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 border border-white/[0.06] hover:text-cyan-400 text-xs font-bold transition-all">
                      <MessageCircle className="w-4 h-4" />
                      <span>{item.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 border border-white/[0.06] hover:text-emerald-400 text-xs font-bold transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleBookmark(item.id)}
                    className={`p-2 rounded-xl transition-all ${
                      item.bookmarked
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-900 text-slate-400 border border-white/[0.06] hover:text-amber-400'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${item.bookmarked ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import { Activity } from 'lucide-react';

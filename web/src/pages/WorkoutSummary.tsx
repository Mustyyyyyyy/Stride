import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ShareCard } from '../components/ShareCard';
import {
  ArrowLeft, Share2, Download, Trash2, Timer, Navigation, Gauge, Activity,
  Flame, Footprints, Mountain, Bike, Zap, MapPin, Check, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ActivityType } from '../types';

const ACTIVITY_META: Record<ActivityType, { icon: React.ReactNode; color: string; label: string }> = {
  RUNNING: { icon: <Zap size={28} color="#10b981" />, color: '#10b981', label: 'Running' },
  WALKING: { icon: <Footprints size={28} color="#06b6d4" />, color: '#06b6d4', label: 'Walking' },
  CYCLING: { icon: <Bike size={28} color="#f97316" />, color: '#f97316', label: 'Cycling' },
  HIKING: { icon: <Mountain size={28} color="#a855f7" />, color: '#a855f7', label: 'Hiking' },
};

function buildRoutePath(points: any[] = [], width: number = 340, height: number = 160): string | null {
  if (!points || points.length < 2) return null;

  const lats = points.map((p) => p.latitude);
  const lons = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const latRange = maxLat - minLat || 0.001;
  const lonRange = maxLon - minLon || 0.001;
  const padding = 16;

  const toX = (lon: number) => padding + ((lon - minLon) / lonRange) * (width - padding * 2);
  const toY = (lat: number) => padding + ((maxLat - lat) / latRange) * (height - padding * 2);

  const step = Math.max(1, Math.floor(points.length / 80));
  const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1);

  return sampled.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.longitude)} ${toY(p.latitude)}`).join(' ');
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  return `${m}m ${s}s`;
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export const WorkoutSummary: React.FC = () => {
  const { activities, selectedWorkoutId, setActivePage, discardTracking, user, unitSystem } = useAppStore();
  const [isSharing, setIsSharing] = useState(false);

  const workout = activities.find((a) => a.id === selectedWorkoutId);

  useEffect(() => {
    if (!workout && activities.length > 0) {
      setActivePage('dashboard');
    }
  }, [workout, activities, setActivePage]);

  useEffect(() => {
    if (workout) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#f59e0b', '#f97316'],
      });
    }
  }, [workout]);

  if (!workout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
          <Activity className="w-8 h-8 text-slate-600" />
        </div>
        <p className="text-slate-400 font-semibold">No workout data found</p>
        <button
          onClick={() => setActivePage('dashboard')}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const meta = ACTIVITY_META[workout.type] || ACTIVITY_META['RUNNING'];
  const startInfo = formatDateTime(workout.startTime);
  const endInfo = formatDateTime(workout.endTime);
  const durationSecs = Math.round((new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / 1000);
  const distKm = (workout.distance / 1000).toFixed(2);
  const distMiles = (workout.distance / 1609.34).toFixed(2);
  const displayDist = unitSystem === 'IMPERIAL' ? distMiles : distKm;
  const distUnit = unitSystem === 'IMPERIAL' ? 'mi' : 'km';
  const pace = workout.distance > 0 && workout.duration > 0 ? ((workout.duration / 60) / (workout.distance / 1000)).toFixed(2) : '0.00';
  const routePath = buildRoutePath(workout.gpsPoints);
  const gpsPointsCount = workout.gpsPoints?.length || 0;

  const startLocation = workout.gpsPoints?.[0];
  const endLocation = workout.gpsPoints?.[workout.gpsPoints.length - 1];

  const handleDiscard = async () => {
    if (confirm('Discard this workout? This cannot be undone.')) {
      await discardTracking();
      setActivePage('dashboard');
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareData = {
        title: 'My Stride Workout',
        text: [
          `${workout.title || 'Workout'} 🏃`,
          `📅 ${startInfo.date}`,
          `📏 ${displayDist} ${distUnit}`,
          `⏱ ${formatDuration(durationSecs > 0 ? durationSecs : workout.duration)}`,
          `⚡ ${pace} min/km`,
          `🔥 ${Math.round(workout.calories)} kcal`,
          `👟 ${(workout.steps || 0).toLocaleString()} steps`,
          `📍 ${gpsPointsCount} GPS points`,
          ``,
          `Proudly tracked with Stride`,
          `https://stride-phi-one.vercel.app/`,
        ].join('\n'),
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        alert('Workout details copied to clipboard!');
      }
    } catch {
      // User cancelled or share failed
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActivePage('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold text-sm">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button
            onClick={handleDiscard}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-rose-400 hover:border-rose-500/40 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Workout Header Card */}
      <div className="glass-card p-6 md:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800" style={{ borderColor: meta.color + '40' }}>
            {meta.icon}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-black font-display text-white">{workout.title || `${meta.label} Workout`}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {startInfo.date} • {startInfo.time} → {endInfo.time}
            </p>
          </div>
        </div>

        {/* Time Details */}
        <div className="bg-slate-900/50 rounded-2xl p-4 md:p-6 border border-slate-800 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Started</p>
              <p className="text-sm font-bold text-white">{startInfo.date}</p>
              <p className="text-xs text-slate-400">{startInfo.time}</p>
            </div>
            <div className="hidden md:block w-px h-12 bg-slate-800" />
            <div className="flex-1 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Finished</p>
              <p className="text-sm font-bold text-white">{endInfo.date}</p>
              <p className="text-xs text-slate-400">{endInfo.time}</p>
            </div>
            <div className="hidden md:block w-px h-12 bg-slate-800" />
            <div className="flex-1 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration</p>
              <div className="flex items-center justify-center gap-2">
                <Timer className="w-4 h-4 text-amber-400" />
                <p className="text-lg font-black text-white">{formatDuration(durationSecs > 0 ? durationSecs : workout.duration)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Navigation className="w-4 h-4 text-cyan-400" />
              <span>Distance</span>
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-2xl font-black font-display text-white">{displayDist}</span>
              <span className="text-xs font-bold text-slate-400 uppercase">{distUnit}</span>
            </div>
          </div>

          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>Avg Pace</span>
            </div>
            <span className="text-2xl font-black font-display text-white">{pace}</span>
            <span className="text-xs font-bold text-slate-400 uppercase ml-1">min/km</span>
          </div>

          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Calories</span>
            </div>
            <span className="text-2xl font-black font-display text-white">{Math.round(workout.calories)}</span>
            <span className="text-xs font-bold text-slate-400 uppercase ml-1">kcal</span>
          </div>

          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Avg Speed</span>
            </div>
            <span className="text-2xl font-black font-display text-white">{(workout.averageSpeed * 3.6).toFixed(1)}</span>
            <span className="text-xs font-bold text-slate-400 uppercase ml-1">km/h</span>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4">
          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Footprints className="w-4 h-4 text-cyan-400" />
              <span>Steps</span>
            </div>
            <span className="text-xl font-black font-display text-white">{(workout.steps || 0).toLocaleString()}</span>
          </div>

          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>Max Speed</span>
            </div>
            <span className="text-xl font-black font-display text-white">{(workout.maxSpeed * 3.6).toFixed(1)}</span>
            <span className="text-xs font-bold text-slate-400 uppercase ml-1">km/h</span>
          </div>

          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>GPS Points</span>
            </div>
            <span className="text-xl font-black font-display text-white">{gpsPointsCount}</span>
          </div>

          <div className="glass-card p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Type</span>
            </div>
            <span className="text-xl font-black font-display text-white">{meta.label}</span>
          </div>
        </div>
      </div>

      {/* Route Map */}
      {routePath && (
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Navigation className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-extrabold font-display text-white">Route Map</h2>
            {gpsPointsCount > 0 && (
              <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                {gpsPointsCount} points
              </span>
            )}
          </div>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden" style={{ height: '320px' }}>
            <svg width="100%" height="100%" viewBox="0 0 900 320" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor={meta.color} stopOpacity="0.9" />
                  <stop offset="1" stopColor={meta.color} stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <path d={routePath.replace(/340/g, '900').replace(/160/g, '320')} fill="none" stroke="url(#routeGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {startLocation && (() => {
                const parts = routePath.split(' ');
                const startX = parseFloat(parts[1]) * (900 / 340);
                const startY = parseFloat(parts[2]) * (320 / 160);
                return <circle cx={startX} cy={startY} r="6" fill={meta.color} />;
              })()}
              {endLocation && (() => {
                const lastMove = routePath.lastIndexOf('M');
                const endPath = routePath.substring(lastMove);
                const parts = endPath.split(' ');
                const endX = parseFloat(parts[1]) * (900 / 340);
                const endY = parseFloat(parts[2]) * (320 / 160);
                return <circle cx={endX} cy={endY} r="6" fill="#ef4444" />;
              })()}
            </svg>
          </div>
        </div>
      )}

      {/* Location Info */}
      {(startLocation || endLocation) && (
        <div className="glass-card p-5">
          <h2 className="text-lg font-extrabold font-display text-white mb-4">Location Details</h2>
          <div className="space-y-3">
            {startLocation && (
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Start</p>
                  <p className="text-sm font-bold text-white">{startLocation.latitude.toFixed(5)}, {startLocation.longitude.toFixed(5)}</p>
                  {startLocation.altitude && <p className="text-xs text-slate-400">Altitude: {Math.round(startLocation.altitude)}m</p>}
                </div>
              </div>
            )}
            {endLocation && (
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 mt-1" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">End</p>
                  <p className="text-sm font-bold text-white">{endLocation.latitude.toFixed(5)}, {endLocation.longitude.toFixed(5)}</p>
                  {endLocation.altitude && <p className="text-xs text-slate-400">Altitude: {Math.round(endLocation.altitude)}m</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Card Preview */}
      <div className="glass-card p-5">
        <h2 className="text-lg font-extrabold font-display text-white mb-4">Share Card</h2>
        <ShareCard
          workout={{
            title: workout.title || `${meta.label} Workout`,
            type: workout.type,
            startTime: workout.startTime,
            endTime: workout.endTime,
            distance: workout.distance,
            duration: durationSecs > 0 ? durationSecs : workout.duration,
            calories: workout.calories,
            steps: workout.steps || 0,
            gpsPoints: workout.gpsPoints,
            averagePace: parseFloat(pace),
            maxSpeed: workout.maxSpeed,
          }}
          userName={user.fullName}
        />
      </div>
    </div>
  );
};

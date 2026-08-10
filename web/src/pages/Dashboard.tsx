import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { MetricCard } from '../components/MetricCard';
import { ActivityType } from '../types';
import {
  Footprints, Navigation, Flame, Timer, ChevronRight,
  Zap, Bike, Mountain, ArrowRight, TrendingUp, Activity,
} from 'lucide-react';

// Apple Fitness-style activity ring
const HealthRing: React.FC<{
  label: string; value: number; max: number; color: string; unit: string; size?: number;
}> = ({ label, value, max, color, unit, size = 120 }) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - progress);
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black font-display text-white">{Math.round(value)}</span>
          <span className="text-[9px] text-slate-400 font-semibold uppercase">{unit}</span>
        </div>
      </div>
      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{label}</span>
    </div>
  );
};

// Activity type icon helper
const activityIcon = (type: ActivityType) => {
  if (type === 'RUNNING') return <Zap className="w-4 h-4" />;
  if (type === 'CYCLING') return <Bike className="w-4 h-4 text-amber-400" />;
  if (type === 'HIKING') return <Mountain className="w-4 h-4 text-purple-400" />;
  return <Footprints className="w-4 h-4 text-cyan-400" />;
};

export const Dashboard: React.FC = () => {
  const { user, activities, setActivePage, unitSystem, streakDays } = useAppStore();

  const totalDistanceMeters = activities.reduce((a, x) => a + x.distance, 0);
  const totalCalories = activities.reduce((a, x) => a + x.calories, 0);
  const totalSteps = activities.reduce((a, x) => a + x.steps, 0);
  const totalDurationSecs = activities.reduce((a, x) => a + x.duration, 0);

  const distKm = (totalDistanceMeters / 1000).toFixed(1);
  const distMiles = (totalDistanceMeters / 1609.34).toFixed(1);
  const displayDist = unitSystem === 'IMPERIAL' ? distMiles : distKm;
  const distUnit = unitSystem === 'IMPERIAL' ? 'mi' : 'km';
  const durationMins = Math.round(totalDurationSecs / 60);

  const moveTarget = 500;
  const exerciseTarget = 60;
  const standTarget = 10000;

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ─── Hero / Welcome Banner ─────────────────────────────────────────────── */}
      <div className="glass-card p-5 md:p-7 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/30 border-emerald-500/15">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-black font-display text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{user.fullName || 'Athlete'}</span>!
            </h1>
            <p className="text-slate-300 mt-1.5 text-sm leading-relaxed max-w-md">
              {streakDays > 0
                ? <>You're on a <strong className="text-orange-400">{streakDays}-day streak</strong> 🔥 — keep the momentum going!</>
                : <>Start a workout today to begin your streak. Every great athlete started with day one. 💪</>}
            </p>
            <button
              onClick={() => setActivePage('live-activity')}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.03] transition-all active:scale-[0.98]"
            >
              <Activity className="w-4 h-4" />
              Start a Workout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Apple Fitness-style rings */}
          <div className="flex items-center gap-4 sm:gap-6 justify-center">
            <HealthRing label="Move" value={totalCalories} max={moveTarget} color="#f43f5e" unit="kcal" />
            <HealthRing label="Exercise" value={durationMins} max={exerciseTarget} color="#10b981" unit="mins" />
            <HealthRing label="Steps" value={totalSteps} max={standTarget} color="#06b6d4" unit="steps" />
          </div>
        </div>
      </div>

      {/* ─── Stats Overview ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard title="Today's Steps" value={totalSteps.toLocaleString()} unit="steps"
          icon={<Footprints className="w-5 h-5" />} progressPercent={(totalSteps / 10000) * 100} accentColor="emerald" />
        <MetricCard title="Distance" value={displayDist} unit={distUnit}
          icon={<Navigation className="w-5 h-5" />} progressPercent={(parseFloat(displayDist) / 5) * 100} accentColor="cyan" />
        <MetricCard title="Calories" value={totalCalories} unit="kcal"
          icon={<Flame className="w-5 h-5" />} progressPercent={(totalCalories / 500) * 100} accentColor="orange" />
        <MetricCard title="Active Time" value={durationMins} unit="mins"
          icon={<Timer className="w-5 h-5" />} progressPercent={(durationMins / 60) * 100} accentColor="purple" />
      </div>

      {/* ─── Recent Workouts ───────────────────────────────────────────────────── */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold font-display text-white">Recent Workouts</h2>
            <p className="text-xs text-slate-400 font-medium">Your recorded GPS fitness activities</p>
          </div>
          <button
            onClick={() => setActivePage('history')}
            className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {activities.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 mx-auto flex items-center justify-center">
              <Activity className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-sm text-slate-400 font-semibold">No workouts yet</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">Tap <strong className="text-emerald-400">Record</strong> to start your first activity and it will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {activities.slice(0, 5).map((act) => {
              const dist = unitSystem === 'IMPERIAL'
                ? (act.distance / 1609.34).toFixed(2)
                : (act.distance / 1000).toFixed(2);
              const unitStr = unitSystem === 'IMPERIAL' ? 'mi' : 'km';
              const mins = Math.floor(act.duration / 60);
              return (
                <div
                  key={act.id}
                  onClick={() => setActivePage('workout-detail', act.id)}
                  className="py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 px-2 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 transition-colors shrink-0">
                      {activityIcon(act.type)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors truncate">{act.title}</h3>
                      <p className="text-xs text-slate-400 truncate">
                        {new Date(act.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        {act.startLocation ? ` • ${act.startLocation}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-sm font-display text-white block">{dist} <span className="text-xs text-slate-400 font-bold uppercase">{unitStr}</span></span>
                    <span className="text-xs text-slate-400">{mins} min · {act.calories} kcal</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Weekly Progress Teaser ────────────────────────────────────────────── */}
      <button
        onClick={() => setActivePage('stats')}
        className="w-full glass-card p-4 flex items-center justify-between hover:border-emerald-500/30 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-sm text-white">View Full Statistics</h3>
            <p className="text-xs text-slate-400">Weekly, monthly trends & personal records</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
      </button>

    </div>
  );
};

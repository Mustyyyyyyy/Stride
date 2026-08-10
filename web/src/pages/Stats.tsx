import React, { useMemo, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Navigation, Flame, Footprints, Timer, TrendingUp } from 'lucide-react';

export const Stats: React.FC = () => {
  const { activities, unitSystem } = useAppStore();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');

  const periodOptions: Array<{ id: 'daily' | 'weekly' | 'monthly' | 'yearly'; label: string }> = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'yearly', label: 'Yearly' },
  ];

  const chartData = useMemo(() => {
    const now = new Date();
    const labels: string[] = [];
    const dists: number[] = [];
    const steps: number[] = [];
    const cals: number[] = [];

    if (period === 'weekly') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const dayEnd = new Date(dayStart.getTime() + 86400000);
        const dayActivities = activities.filter((a) => new Date(a.startTime) >= dayStart && new Date(a.startTime) < dayEnd);
        const dayDist = dayActivities.reduce((acc, a) => acc + a.distance, 0) / 1000;
        const daySteps = dayActivities.reduce((acc, a) => acc + a.steps, 0);
        const dayCal = dayActivities.reduce((acc, a) => acc + a.calories, 0);
        labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
        dists.push(parseFloat(dayDist.toFixed(1)));
        steps.push(daySteps);
        cals.push(Math.round(dayCal));
      }
    } else if (period === 'monthly') {
      for (let i = 3; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        const monthActivities = activities.filter((a) => new Date(a.startTime) >= monthStart && new Date(a.startTime) < monthEnd);
        const monthDist = monthActivities.reduce((acc, a) => acc + a.distance, 0) / 1000;
        const monthSteps = monthActivities.reduce((acc, a) => acc + a.steps, 0);
        const monthCal = monthActivities.reduce((acc, a) => acc + a.calories, 0);
        labels.push(d.toLocaleDateString(undefined, { month: 'short' }));
        dists.push(parseFloat(monthDist.toFixed(1)));
        steps.push(monthSteps);
        cals.push(Math.round(monthCal));
      }
    } else if (period === 'yearly') {
      for (let i = 3; i >= 0; i--) {
        const y = now.getFullYear() - i;
        const yearActivities = activities.filter((a) => new Date(a.startTime).getFullYear() === y);
        const yearDist = yearActivities.reduce((acc, a) => acc + a.distance, 0) / 1000;
        const yearSteps = yearActivities.reduce((acc, a) => acc + a.steps, 0);
        const yearCal = yearActivities.reduce((acc, a) => acc + a.calories, 0);
        labels.push(String(y));
        dists.push(parseFloat(yearDist.toFixed(1)));
        steps.push(yearSteps);
        cals.push(Math.round(yearCal));
      }
    } else {
      const hours = ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'];
      for (let i = 0; i < hours.length; i++) {
        labels.push(hours[i]);
        dists.push(0);
        steps.push(0);
        cals.push(0);
      }
    }

    return { labels, dists, steps, cals };
  }, [activities, period]);

  const { totalDistanceKm, totalSteps, totalCalories, totalDurationSec, avgSpeedKmh, avgPaceMinKm } = useMemo(() => {
    const totalDist = activities.reduce((acc, a) => acc + a.distance, 0) / 1000;
    const totalSteps = activities.reduce((acc, a) => acc + a.steps, 0);
    const totalCals = activities.reduce((acc, a) => acc + a.calories, 0);
    const totalDur = activities.reduce((acc, a) => acc + a.duration, 0);
    const avgSpeed = totalDur > 0 ? (totalDist / (totalDur / 3600)) : 0;
    const avgPace = totalDist > 0 ? (totalDur / 60) / totalDist : 0;
    return {
      totalDistanceKm: parseFloat(totalDist.toFixed(1)),
      totalSteps,
      totalCalories: Math.round(totalCals),
      totalDurationSec: totalDur,
      avgSpeedKmh: parseFloat(avgSpeed.toFixed(1)),
      avgPaceMinKm: parseFloat(avgPace.toFixed(2)),
    };
  }, [activities]);

  const maxDist = Math.max(...chartData.dists, 1);
  const prevPeriodDist = period === 'weekly' ? 28.4 : period === 'monthly' ? 12 : period === 'yearly' ? 10 : 3;
  const changePercent = prevPeriodDist > 0 ? ((totalDistanceKm - prevPeriodDist) / prevPeriodDist) * 100 : 0;

  if (activities.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-black font-display text-white">Fitness Analytics</h1>
          <p className="text-xs text-slate-400 font-medium">Visual breakdown of your activity performance</p>
        </div>
        <div className="glass-card p-12 text-center">
          <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">No activities recorded yet.</p>
          <p className="text-slate-500 text-xs mt-1">Start a workout to see your analytics here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-display text-white">Fitness Analytics</h1>
          <p className="text-xs text-slate-400 font-medium">Visual breakdown of your activity performance</p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          {periodOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === opt.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Distance Chart */}
      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold font-display text-white">Distance Trend</h2>
            <p className="text-xs text-slate-400">Kilometers covered per period interval</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}% vs last {period}
          </span>
        </div>

        {/* SVG Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
          {chartData.dists.map((dist, idx) => {
            const heightPercent = (dist / maxDist) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {dist} km
                </span>
                <div
                  className={`w-full max-w-[40px] rounded-xl bg-gradient-to-t from-emerald-600 via-teal-500 to-cyan-400 group-hover:brightness-125 transition-all shadow-lg shadow-emerald-500/10 ${dist === 0 ? 'opacity-30' : ''}`}
                  style={{ height: `${Math.max(4, heightPercent)}%` }}
                />
                <span className="text-xs font-bold text-slate-400 mt-1">{chartData.labels[idx]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <Navigation className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Distance</span>
          </div>
          <span className="text-3xl font-black font-display text-white">{totalDistanceKm} <span className="text-lg text-slate-400">km</span></span>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-orange-400">
            <Flame className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Calories</span>
          </div>
          <span className="text-3xl font-black font-display text-orange-400">{totalCalories.toLocaleString()} <span className="text-lg text-slate-400">kcal</span></span>
        </div>

        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Footprints className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Steps</span>
          </div>
          <span className="text-3xl font-black font-display text-white">{totalSteps.toLocaleString()}</span>
        </div>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Active Time</span>
            <span className="text-lg font-black font-display text-white">{Math.round(totalDurationSec / 60)} <span className="text-xs text-slate-400">mins</span></span>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Avg Speed</span>
            <span className="text-lg font-black font-display text-white">{avgSpeedKmh} <span className="text-xs text-slate-400">km/h</span></span>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Avg Pace</span>
            <span className="text-lg font-black font-display text-white">{avgPaceMinKm} <span className="text-xs text-slate-400">min/km</span></span>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Calories / Activity</span>
            <span className="text-lg font-black font-display text-white">{activities.length > 0 ? Math.round(totalCalories / activities.length) : 0} <span className="text-xs text-slate-400">kcal</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

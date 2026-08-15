import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ActivityType } from '../types';
import { Search, Filter, Zap, Bike, Footprints, Mountain, Calendar, MapPin, ArrowUpRight } from 'lucide-react';

export const History: React.FC = () => {
  const { activities, setActivePage, unitSystem } = useAppStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterOptions: Array<{ id: string; label: string }> = [
    { id: 'ALL', label: 'All Activities' },
    { id: 'RUNNING', label: 'Running' },
    { id: 'WALKING', label: 'Walking' },
    { id: 'CYCLING', label: 'Cycling' },
    { id: 'HIKING', label: 'Hiking' },
  ];

  const filteredActivities = activities.filter((act) => {
    if (selectedFilter !== 'ALL' && act.type !== selectedFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return act.title.toLowerCase().includes(q) || (act.startLocation && act.startLocation.toLowerCase().includes(q));
    }
    return true;
  });

  if (activities.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-black font-display text-white">Activity History</h1>
          <p className="text-xs text-slate-400 font-medium">All your recorded GPS workouts and statistics</p>
        </div>
        <div className="glass-card p-12 text-center">
          <p className="text-slate-400 text-sm font-medium">No activities recorded yet.</p>
          <p className="text-slate-500 text-xs mt-1">Start your first workout to see it here.</p>
        </div>
      </div>
    );
  }

  if (filteredActivities.length === 0) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-black font-display text-white">Activity History</h1>
          <p className="text-xs text-slate-400 font-medium">All your recorded GPS workouts and statistics</p>
        </div>
        <div className="glass-card p-12 text-center">
          <p className="text-slate-400 text-sm font-medium">No activities match your search.</p>
          <p className="text-slate-500 text-xs mt-1">Try adjusting your filters or search query.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-display text-white">Activity History</h1>
          <p className="text-xs text-slate-400 font-medium">All your recorded GPS workouts and statistics</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/[0.06] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/[0.04]">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedFilter(opt.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedFilter === opt.id
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900/80 text-slate-300 hover:text-white border border-white/[0.06]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActivities.map((act) => {
          const dist = unitSystem === 'IMPERIAL' ? (act.distance / 1609.34).toFixed(2) : (act.distance / 1000).toFixed(2);
          const unitStr = unitSystem === 'IMPERIAL' ? 'mi' : 'km';
          const mins = Math.floor(act.duration / 60);

          return (
            <div
              key={act.id}
              onClick={() => setActivePage('workout-summary', act.id)}
              className="glass-card p-5 space-y-4 cursor-pointer hover:border-emerald-500/40 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/[0.06] flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/40 transition-colors">
                    {act.type === 'RUNNING' && <Zap className="w-6 h-6" />}
                    {act.type === 'WALKING' && <Footprints className="w-6 h-6" />}
                    {act.type === 'CYCLING' && <Bike className="w-6 h-6 text-amber-400" />}
                    {act.type === 'HIKING' && <Mountain className="w-6 h-6 text-purple-400" />}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-white group-hover:text-emerald-400 transition-colors">{act.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(act.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              {/* Metrics Summary Row */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/[0.04] text-center">
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/[0.04]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Distance</span>
                  <span className="text-sm font-extrabold text-white font-display">
                    {dist} <span className="text-[10px] text-slate-400 font-bold">{unitStr}</span>
                  </span>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/[0.04]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Duration</span>
                  <span className="text-sm font-extrabold text-white font-display">{mins} mins</span>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/[0.04]">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Calories</span>
                  <span className="text-sm font-extrabold text-orange-400 font-display">{act.calories} kcal</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


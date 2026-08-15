import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Settings, ChevronRight, Trophy, Flame, Footprints, Zap, Bike, Mountain, Target, Award, Activity, Navigation } from 'lucide-react';

type YouTab = 'progress' | 'workouts' | 'activities';

export const ProfileSettings: React.FC = () => {
  const { user, updateUser, setActivePage, activities, unitSystem } = useAppStore();
  const [tab, setTab] = useState<YouTab>('progress');
  const [fullName, setFullName] = useState(user.fullName);
  const [weight, setWeight] = useState(user.weight || 70);
  const [height, setHeight] = useState(user.height || 175);

  useEffect(() => {
    setFullName(user.fullName);
    setWeight(user.weight || 70);
    setHeight(user.height || 175);
  }, [user.fullName, user.weight, user.height]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      fullName,
      weight,
      height,
    });
  };

  const totalDistance = activities.reduce((acc, a) => acc + a.distance, 0) / 1000;
  const totalSteps = activities.reduce((acc, a) => acc + a.steps, 0);
  const totalCalories = activities.reduce((acc, a) => acc + a.calories, 0);
  const totalWorkouts = activities.length;

  const distKm = (m: number) => (m / 1000).toFixed(1);
  const distMiles = (m: number) => (m / 1609.34).toFixed(1);
  const displayDist = unitSystem === 'IMPERIAL' ? distMiles(totalDistance * 1000) : distKm(totalDistance * 1000);
  const distUnit = unitSystem === 'IMPERIAL' ? 'mi' : 'km';

  const tabs: { id: YouTab; label: string }[] = [
    { id: 'progress', label: 'Progress' },
    { id: 'workouts', label: 'Workouts' },
    { id: 'activities', label: 'Activities' },
  ];

  const renderProgress = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Profile Header */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <img
          src={user.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
          alt={user.fullName}
          className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-500/40 shadow-xl"
        />
        <div className="space-y-1">
          <h1 className="text-3xl font-black font-display text-white">{user.fullName}</h1>
          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 text-center">
          <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <span className="text-2xl font-black font-display text-white">{Math.round(totalCalories)}</span>
          <span className="text-xs text-slate-400 font-semibold block">kcal</span>
        </div>
        <div className="glass-card p-5 text-center">
          <Footprints className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
          <span className="text-2xl font-black font-display text-white">{totalSteps.toLocaleString()}</span>
          <span className="text-xs text-slate-400 font-semibold block">steps</span>
        </div>
        <div className="glass-card p-5 text-center">
          <Zap className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <span className="text-2xl font-black font-display text-white">{totalWorkouts}</span>
          <span className="text-xs text-slate-400 font-semibold block">workouts</span>
        </div>
        <div className="glass-card p-5 text-center">
          <Bike className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <span className="text-2xl font-black font-display text-white">{displayDist}</span>
          <span className="text-xs text-slate-400 font-semibold block">{distUnit}</span>
        </div>
      </div>

      {/* Edit Profile */}
      <form onSubmit={handleSave} className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-extrabold font-display text-white">Edit Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.06] text-xs text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.06] text-xs text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/[0.06] text-xs text-white focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
        </div>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );

  const renderWorkouts = () => (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-black font-display text-white">Your Workouts</h2>
      {activities.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/[0.06] mx-auto flex items-center justify-center">
            <Target className="w-8 h-8 text-slate-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No workouts yet</h3>
            <p className="text-xs text-slate-400 mt-1">Complete a workout to see it here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="glass-card p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                  {act.type === 'RUNNING' ? <Zap size={20} color="#10b981" /> :
                   act.type === 'WALKING' ? <Footprints size={20} color="#06b6d4" /> :
                   act.type === 'CYCLING' ? <Bike size={20} color="#f97316" /> :
                   act.type === 'HIKING' ? <Mountain size={20} color="#a855f7" /> :
                   <Target size={20} color="#10b981" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-extrabold text-white font-display">{act.title}</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-white/[0.06]">
                    {act.type}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/[0.04] text-center">
                  <Navigation className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                  <span className="text-sm font-black text-white font-display block">{(act.distance / 1000).toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">{unitSystem === 'IMPERIAL' ? 'mi' : 'km'}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/[0.04] text-center">
                  <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                  <span className="text-sm font-black text-orange-400 font-display block">{act.calories}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">kcal</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/[0.04] text-center">
                  <Flame className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <span className="text-sm font-black text-white font-display block">{Math.round(act.duration / 60)}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">min</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/[0.04] text-center">
                  <Footprints className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <span className="text-sm font-black text-white font-display block">{act.steps.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">steps</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderActivities = () => (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-black font-display text-white">Activities</h2>
      {activities.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/[0.06] mx-auto flex items-center justify-center">
            <Activity className="w-8 h-8 text-slate-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No activities yet</h3>
            <p className="text-xs text-slate-400 mt-1">Start a workout to see your activities.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((act) => (
            <div key={act.id} className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/[0.06] flex items-center justify-center">
                  <Target size={18} color="#10b981" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{act.title}</h4>
                  <p className="text-xs text-slate-400">{new Date(act.startTime).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>{(act.distance / 1000).toFixed(2)} km</span>
                <span>{Math.round(act.duration / 60)} min</span>
                <span>{act.calories} kcal</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Top navbar for You sub-pages */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActivePage('settings')}
           className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-white/[0.06] text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        <h1 className="text-xl font-black font-display text-white">You</h1>
        <div className="w-20" />
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 bg-slate-900 p-1.5 rounded-2xl border border-white/[0.06]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
              tab === t.id
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'progress' && renderProgress()}
      {tab === 'workouts' && renderWorkouts()}
      {tab === 'activities' && renderActivities()}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { User, Settings, Scale, Ruler, Shield, Bell, Moon, Sun, Globe, LogOut, Save, CheckCircle2, ChevronRight } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { user, updateUser, unitSystem, setUnitSystem, theme, toggleTheme, setActivePage } = useAppStore();

  const [fullName, setFullName] = useState(user.fullName);
  const [weight, setWeight] = useState(user.weight || 70);
  const [height, setHeight] = useState(user.height || 175);
  const [saved, setSaved] = useState(false);

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
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fadeIn">
      {/* User Header Card */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <img
          src={user.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
          alt={user.fullName}
          className="w-24 h-24 rounded-3xl object-cover ring-4 ring-emerald-500/40 shadow-xl"
        />

        <div className="space-y-1">
          <h1 className="text-3xl font-black font-display text-white">{user.fullName}</h1>
          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
          <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PRO RUNNER
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              JWT SECURED
            </span>
          </div>
        </div>
      </div>

      {/* Quick Link to Settings */}
      <button
        onClick={() => setActivePage('settings')}
        className="w-full glass-card p-4 flex items-center justify-between hover:border-slate-700 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <Settings className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-white">App Settings</h3>
            <p className="text-xs text-slate-400">Tracking, manual entry, data export, sync</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600" />
      </button>

      {/* Body Metrics Form */}
      <form onSubmit={handleSave} className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-extrabold font-display text-white flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-400" />
          <span>Body Metrics & Calorie Calibration</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-transform"
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved Successfully' : 'Save Changes'}</span>
        </button>
        {saved && (
          <p className="text-xs text-emerald-400 font-medium animate-pulse">MET calorie calculations recalibrated with new metrics.</p>
        )}
      </form>

      {/* App Preferences */}
      <div className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-extrabold font-display text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>App Preferences</span>
        </h2>

        <div className="divide-y divide-slate-800/80">
          <div className="py-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Measurement Units</h3>
              <p className="text-xs text-slate-400">Choose Kilometers or Miles for distance and speed</p>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setUnitSystem('METRIC')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  unitSystem === 'METRIC' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Metric (km)
              </button>
              <button
                onClick={() => setUnitSystem('IMPERIAL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  unitSystem === 'IMPERIAL' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                }`}
              >
                Imperial (mi)
              </button>
            </div>
          </div>

          <div className="py-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Theme Mode</h3>
              <p className="text-xs text-slate-400">Switch between dark glassmorphism and light mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span>{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

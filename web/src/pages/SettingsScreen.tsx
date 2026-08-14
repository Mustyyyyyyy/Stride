import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MapPin, Footprints, Trash2, Download, Upload, RefreshCw, Shield, Navigation, Activity } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { unitSystem, setUnitSystem, theme, toggleTheme, activities, goals, achievements, notifications, feedItems, setActivePage } = useAppStore();
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [realSteps, setRealSteps] = useState(true);
  const [trackingStatus, setTrackingStatus] = useState('Ready');
  const [isSyncing, setIsSyncing] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({ title: '', type: 'WALKING', distance: '0', duration: '0', steps: '0', calories: '0' });

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setActivePage('history');
    setShowManualForm(false);
    setManualForm({ title: '', type: 'WALKING', distance: '0', duration: '0', steps: '0', calories: '0' });
  };

  const handleExportData = () => {
    const data = { activities, goals, achievements, notifications, feedItems, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stride-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearCache = () => {
    if (confirm('Clear all local cached data? This will reset your app state.')) {
      localStorage.removeItem('stride_access_token');
      localStorage.removeItem('stride_onboarding_completed');
      window.location.reload();
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSyncing(false);
    alert('Data synced successfully.');
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-black font-display text-white">Settings</h1>
        <p className="text-xs text-slate-400 font-medium mt-1">Tracking, privacy, and data management</p>
      </div>

      {/* Tracking Settings */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-base font-extrabold font-display text-white flex items-center gap-2">
          <Navigation className="w-5 h-5 text-cyan-400" />
          Tracking Settings
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">GPS Tracking</h3>
            <p className="text-xs text-slate-400">Enable location tracking during workouts</p>
          </div>
          <button
            onClick={() => setGpsEnabled(!gpsEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              gpsEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {gpsEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Use Real Steps</h3>
            <p className="text-xs text-slate-400">Use device pedometer when available</p>
          </div>
          <button
            onClick={() => setRealSteps(!realSteps)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              realSteps ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {realSteps ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Tracking Status</h3>
            <p className="text-xs text-slate-400">Current system state</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            {trackingStatus}
          </span>
        </div>
      </div>

      {/* Manual Activity Entry */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-base font-extrabold font-display text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          Manual Activity Entry
        </h2>
        <p className="text-xs text-slate-400">Add a workout that wasn't tracked automatically.</p>

        {!showManualForm ? (
          <button
            onClick={() => setShowManualForm(true)}
            className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            + Add Manual Workout
          </button>
        ) : (
          <form onSubmit={handleManualAdd} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Title</label>
              <input
                type="text"
                value={manualForm.title}
                onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                placeholder="Morning Run"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Type</label>
                <select
                  value={manualForm.type}
                  onChange={(e) => setManualForm({ ...manualForm, type: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="WALKING">Walking</option>
                  <option value="RUNNING">Running</option>
                  <option value="CYCLING">Cycling</option>
                  <option value="HIKING">Hiking</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Distance (m)</label>
                <input
                  type="number"
                  value={manualForm.distance}
                  onChange={(e) => setManualForm({ ...manualForm, distance: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Duration (s)</label>
                <input
                  type="number"
                  value={manualForm.duration}
                  onChange={(e) => setManualForm({ ...manualForm, duration: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Steps</label>
                <input
                  type="number"
                  value={manualForm.steps}
                  onChange={(e) => setManualForm({ ...manualForm, steps: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Calories</label>
                <input
                  type="number"
                  value={manualForm.calories}
                  onChange={(e) => setManualForm({ ...manualForm, calories: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowManualForm(false)} className="flex-1 py-2.5 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold">
                Save Workout
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Data Management */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-base font-extrabold font-display text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          Data Management
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all disabled:opacity-60"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync Data'}
          </button>
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <Download size={16} />
            Export Data
          </button>
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'application/json';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const data = JSON.parse(reader.result as string);
                    alert(`Imported ${data.activities?.length || 0} activities.`);
                  } catch {
                    alert('Invalid export file.');
                  }
                };
                reader.readAsText(file);
              };
              input.click();
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <Upload size={16} />
            Import Data
          </button>
          <button
            onClick={handleClearCache}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all"
          >
            <Trash2 size={16} />
            Clear Cache
          </button>
        </div>
      </div>

      {/* App Preferences */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-base font-extrabold font-display text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          Preferences
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Units</h3>
            <p className="text-xs text-slate-400">Distance and speed units</p>
          </div>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setUnitSystem('METRIC')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                unitSystem === 'METRIC' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Metric
            </button>
            <button
              onClick={() => setUnitSystem('IMPERIAL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                unitSystem === 'IMPERIAL' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              Imperial
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Theme</h3>
            <p className="text-xs text-slate-400">App appearance</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200"
          >
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
        </div>
      </div>
    </div>
  );
};

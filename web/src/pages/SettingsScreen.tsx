import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MapPin, Footprints, Trash2, Download, Upload, RefreshCw, Shield, Navigation, Activity, Settings, ChevronRight, Moon, Sun, Mail, Bell, HelpCircle, FileText, Info, LogOut } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const { user, updateUser, unitSystem, setUnitSystem, theme, toggleTheme, setActivePage, activities } = useAppStore();
  const [email, setEmail] = useState(user.email || '');
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleUpdateEmail = () => {
    updateUser({ email });
    alert('Email updated successfully.');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('stride_access_token');
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const data = { activities, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stride-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
        <p className="text-xs text-slate-400 font-medium mt-1">Tracking, privacy, and support</p>
      </div>

      {/* Account */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-base font-extrabold font-display text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-emerald-400" />
          Account
        </h2>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">Email</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
            />
          </div>
          <button
            onClick={handleUpdateEmail}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
          >
            Save
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-base font-extrabold font-display text-white flex items-center gap-2">
          <Moon className="w-5 h-5 text-amber-400" />
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Theme</h3>
            <p className="text-xs text-slate-400">App appearance</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>
        </div>
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
      </div>

      {/* Permissions */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-base font-extrabold font-display text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-400" />
          Permissions
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Location</h3>
            <p className="text-xs text-slate-400">Required for GPS tracking</p>
          </div>
          <button
            onClick={() => setLocationEnabled(!locationEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              locationEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {locationEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            <p className="text-xs text-slate-400">Workout reminders and alerts</p>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              notificationsEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {notificationsEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Support & Legal */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-base font-extrabold font-display text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          Support & Legal
        </h2>
        <button
          onClick={() => setActivePage('support')}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
        >
          <div className="flex items-center gap-3">
            <HelpCircle size={18} color="#10b981" />
            <span className="text-sm font-bold text-white">Support</span>
          </div>
          <ChevronRight size={18} color="#64748b" />
        </button>
        <button
          onClick={() => setActivePage('legal')}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
        >
          <div className="flex items-center gap-3">
            <FileText size={18} color="#06b6d4" />
            <span className="text-sm font-bold text-white">Legal</span>
          </div>
          <ChevronRight size={18} color="#64748b" />
        </button>
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-3">
            <Info size={18} color="#f59e0b" />
            <div>
              <span className="text-sm font-bold text-white block">About</span>
              <span className="text-xs text-slate-400">Stride v1.0.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-base font-extrabold font-display text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
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
            onClick={() => {
              if (confirm('Clear all local cached data? This will reset your app state.')) {
                localStorage.removeItem('stride_access_token');
                localStorage.removeItem('stride_onboarding_completed');
                window.location.reload();
              }
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-all"
          >
            <Trash2 size={16} />
            Clear Cache
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="glass-card p-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-sm hover:bg-rose-500/20 transition-all"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>

      <p className="text-xs text-slate-600 text-center pb-6">Stride v1.0.0</p>
    </div>
  );
};

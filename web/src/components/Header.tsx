import React, { useEffect, useState } from 'react';
import { useAppStore, PageView } from '../store/useAppStore';
import {
  Activity, LayoutDashboard, History, BarChart3, Target,
  Smartphone, Share, PlusSquare, X, Sun, Moon, Bell,
  Trophy, Zap, User, Users, Home,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { activePage, setActivePage, isTracking, theme, toggleTheme, user, unreadNotificationsCount } = useAppStore();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    } else {
      setShowInstallModal(true);
    }
  };

  // ─── Desktop nav (all pages) ──────────────────────────────────────────────
  const desktopNavItems: Array<{ id: PageView; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'feed', label: 'Feed', icon: <Users className="w-4 h-4" /> },
    { id: 'live-activity', label: 'Record', icon: <Activity className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
    { id: 'challenges', label: 'Challenges', icon: <Trophy className="w-4 h-4" /> },
  ];

  // ─── Mobile bottom nav ────────────────────────────────────────────────────
  const mobileBottomNav: Array<{ id: PageView; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="w-5 h-5" /> },
    { id: 'live-activity', label: 'Record', icon: <Activity className="w-6 h-6" /> },
    { id: 'history', label: 'History', icon: <History className="w-5 h-5" /> },
    { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const NavBtn = ({
    id, label, icon, badge, isActive,
  }: { id: PageView; label: string; icon: React.ReactNode; badge?: number; isActive: boolean }) => (
    <button
      key={id}
      onClick={() => setActivePage(id)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all relative ${
        isActive
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && badge > 0 ? (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
      {id === 'live-activity' && isTracking ? (
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute top-1 right-1" />
      ) : null}
    </button>
  );

  return (
    <>
      {/* ─── Top App Bar ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

          {/* Logo / Brand */}
          <div
            onClick={() => setActivePage('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-slate-950 fill-slate-950" />
            </div>
            <span className="font-extrabold text-lg md:text-xl tracking-tight text-white font-display hidden sm:block">STRIDE</span>
          </div>

          {/* ─── Desktop navigation (hidden on mobile) ─── */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 overflow-x-auto">
            {desktopNavItems.map((item) => (
              <NavBtn key={item.id} {...item} isActive={activePage === item.id} />
            ))}
          </nav>

          {/* ─── Right-side controls ─── */}
          <div className="flex items-center gap-2">
            {/* Install PWA (desktop only) */}
            <button
              onClick={handleInstallClick}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold transition-all hover:bg-emerald-500/20"
              title="Install Stride App"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden lg:inline">Install App</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Notifications bell (visible on all sizes) */}
            <button
              onClick={() => setActivePage('notifications')}
              className={`relative p-2 rounded-xl border transition-all ${
                activePage === 'notifications'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center shadow-lg animate-bounce">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Profile avatar */}
            <div
              onClick={() => setActivePage('profile')}
              className="cursor-pointer group"
              title="Profile"
            >
              <img
                src={user.profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=10b981&color=fff&bold=true&size=128`}
                alt={user.fullName || 'Profile'}
                className={`w-8 h-8 md:w-9 md:h-9 rounded-xl object-cover ring-2 transition-all ${
                  activePage === 'profile' ? 'ring-emerald-400' : 'ring-emerald-500/40 group-hover:ring-emerald-400'
                }`}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ─── Mobile Bottom Navigation Bar ────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 safe-area-pb">
        <div className="flex items-center justify-around">
          {mobileBottomNav.map((item) => {
            const isActive = activePage === item.id;
            const isRecord = item.id === 'live-activity';
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${
                  isRecord
                    ? `${isActive ? 'bg-emerald-500 text-slate-950' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'} rounded-2xl px-5 py-2.5 -mt-4 shadow-lg shadow-emerald-500/20`
                    : isActive
                    ? 'text-emerald-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {item.icon}
                <span className={`text-[10px] font-semibold ${isRecord ? (isActive ? 'text-slate-950' : 'text-emerald-400') : ''}`}>
                  {item.label}
                </span>
                {isRecord && isTracking && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400 animate-ping" />
                )}
                {isActive && !isRecord && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ─── Install Modal ────────────────────────────────────────────────────── */}
      {showInstallModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card p-6 max-w-md w-full space-y-4 border-slate-700 relative">
            <button onClick={() => setShowInstallModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-black text-2xl">⚡</div>
              <div>
                <h3 className="text-xl font-extrabold font-display text-white">Install Stride App</h3>
                <p className="text-xs text-slate-400">Install directly on Android or iPhone</p>
              </div>
            </div>
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm"><span>📱 iPhone / iOS:</span></div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Open in <strong className="text-white">Safari</strong>.</li>
                  <li>Tap <strong className="text-white"><Share className="w-3.5 h-3.5 inline text-cyan-400" /> Share</strong> at bottom.</li>
                  <li>Tap <strong className="text-emerald-400">"Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 inline" /></strong>.</li>
                </ol>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm"><span>🤖 Android:</span></div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Open in <strong className="text-white">Chrome or Edge</strong>.</li>
                  <li>Tap <strong className="text-white">⋮ menu icon</strong>.</li>
                  <li>Select <strong className="text-cyan-400">"Install app"</strong> or <strong className="text-cyan-400">"Add to Home screen"</strong>.</li>
                </ol>
              </div>
            </div>
            <button onClick={() => setShowInstallModal(false)} className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">Got It!</button>
          </div>
        </div>
      )}
    </>
  );
};

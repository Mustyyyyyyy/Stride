import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { LiveActivity } from './pages/LiveActivity';
import { History } from './pages/History';
import { WorkoutDetail } from './pages/WorkoutDetail';
import { Stats } from './pages/Stats';
import { GoalsAchievements } from './pages/GoalsAchievements';
import { ProfileSettings } from './pages/ProfileSettings';
import { NotificationsPage } from './pages/NotificationsPage';
import { FeedPage } from './pages/FeedPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { AnimeSplashScreen } from './components/AnimeSplashScreen';
import { AuthPage } from './pages/AuthPage';
import { WifiOff, X } from 'lucide-react';

export const App: React.FC = () => {
  // ─── ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT TOP ─────────────────────
  const hydrateFromApi = useAppStore((s) => s.hydrateFromApi);
  const activePage = useAppStore((s) => s.activePage);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isOnline = useAppStore((s) => s.isOnline);

  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Only run hydration once on mount — hydrateFromApi guards against no-token itself
    hydrateFromApi().finally(() => setHydrated(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 1. Show anime splash on every app open (5 seconds)
  if (showSplash) {
    return <AnimeSplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // 2. Wait for initial hydration check
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center animate-pulse">
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-slate-400 text-sm font-semibold animate-pulse">Loading Stride…</p>
        </div>
      </div>
    );
  }

  // 3. If not authenticated, show full-featured auth page
  if (!isAuthenticated) {
    return <AuthPage onAuthenticated={() => hydrateFromApi()} />;
  }

  // 4. Main app for authenticated users
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header />

      {/* Offline Mode Banner (only shown when offline) */}
      {!isOnline && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-300">Offline Mode Active — Data is saved locally</span>
          </div>
        </div>
      )}

      {/* Page content — extra bottom padding on mobile for the bottom nav */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 pb-24 md:pb-8">
        {activePage === 'dashboard'      && <Dashboard />}
        {activePage === 'live-activity'  && <LiveActivity />}
        {activePage === 'history'        && <History />}
        {activePage === 'workout-detail' && <WorkoutDetail />}
        {activePage === 'stats'          && <Stats />}
        {activePage === 'goals'          && <GoalsAchievements />}
        {activePage === 'profile'        && <ProfileSettings />}
        {activePage === 'notifications'  && <NotificationsPage />}
        {activePage === 'feed'           && <FeedPage />}
        {activePage === 'challenges'     && <ChallengesPage />}
      </main>
    </div>
  );
};

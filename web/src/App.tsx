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
import { WorkoutSummary } from './pages/WorkoutSummary';
import { SettingsScreen } from './pages/SettingsScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { AuthPage } from './pages/AuthPage';
import { MapsPage } from './pages/MapsPage';
import { SupportPage } from './pages/SupportPage';
import { LegalPage } from './pages/LegalPage';
import { WifiOff } from 'lucide-react';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { BottomNavBar } from './components/BottomNavBar';
import { webBackgroundStepService } from './services/WebBackgroundStepService';

export const App: React.FC = () => {
  // ─── ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT TOP ─────────────────────
  const hydrateFromApi = useAppStore((s) => s.hydrateFromApi);
  const activePage = useAppStore((s) => s.activePage);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const isOnline = useAppStore((s) => s.isOnline);
  const setActivePage = useAppStore((s) => s.setActivePage);

  const [hydrated, setHydrated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem('stride_onboarding_completed');
    if (!hasSeenOnboarding && isAuthenticated) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Only run hydration once on mount — hydrateFromApi guards against no-token itself
    hydrateFromApi().finally(() => setHydrated(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize web background step service
  useEffect(() => {
    if (isAuthenticated) {
      webBackgroundStepService.start().catch(() => {
        // Silently fail if step counter is not available
      });
    }
    return () => {
      webBackgroundStepService.stop();
    };
  }, [isAuthenticated]);

  // Service worker update detection - auto-reload when new version is available
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        // Check for updates when the page becomes visible
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            registration.update();
          }
        };

        // Listen for service worker messages (e.g., reload request)
        const handleMessage = (event: MessageEvent) => {
          if (event.data && event.data.type === 'RELOAD') {
            window.location.reload();
          }
        };

        // Check for waiting service worker and reload
        const checkForUpdate = () => {
          if (registration.waiting) {
            // New service worker is waiting, reload to activate it
            window.location.reload();
          }
        };

        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available, reload
                window.location.reload();
              }
            });
          }
        });

        // Check periodically for updates
        const intervalId = setInterval(checkForUpdate, 60 * 60 * 1000); // Every hour

        document.addEventListener('visibilitychange', handleVisibilityChange);
        navigator.serviceWorker.addEventListener('message', handleMessage as any);

        return () => {
          clearInterval(intervalId);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          navigator.serviceWorker.removeEventListener('message', handleMessage as any);
        };
      } catch (err) {
        console.warn('Service worker registration failed:', err);
      }
    };

    const cleanup = registerServiceWorker();
    return () => {
      cleanup.then((fn) => fn && fn());
    };
  }, [isAuthenticated]);

  // Show onboarding for first-time users
  if (showOnboarding) {
    return <OnboardingScreen onFinish={() => {
      localStorage.setItem('stride_onboarding_completed', 'true');
      setShowOnboarding(false);
    }} />;
  }

  // Wait for initial hydration check
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

  // If not authenticated, show full-featured auth page
  if (!isAuthenticated) {
    return <AuthPage onAuthenticated={() => {
      hydrateFromApi();
      setActivePage('dashboard');
    }} />;
  }

  // Main app for authenticated users
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
        {activePage === 'dashboard'        && <Dashboard />}
        {activePage === 'live-activity'    && <LiveActivity />}
        {activePage === 'history'          && <History />}
        {activePage === 'workout-detail'   && <WorkoutDetail />}
        {activePage === 'workout-summary'  && <WorkoutSummary />}
        {activePage === 'stats'            && <Stats />}
        {activePage === 'goals'            && <GoalsAchievements />}
        {activePage === 'profile'          && <ProfileSettings />}
        {activePage === 'settings'         && <SettingsScreen />}
        {activePage === 'notifications'    && <NotificationsPage />}
        {activePage === 'feed'             && <FeedPage />}
        {activePage === 'challenges'       && <ChallengesPage />}
        {activePage === 'maps'             && <MapsPage />}
        {activePage === 'support'          && <SupportPage />}
        {activePage === 'legal'            && <LegalPage />}
      </main>

      {/* Mobile bottom navigation - hidden on desktop */}
      <BottomNavBar />

      <PWAInstallBanner />
    </div>
  );
};

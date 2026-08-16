import React, { useEffect, useState } from 'react';
import { View, StatusBar, AppState, Text, useColorScheme } from 'react-native';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { GoalsScreen } from './src/screens/GoalsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { FeedScreen } from './src/screens/FeedScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { BottomNavBar } from './src/components/BottomNavBar';
import { MobileHeader } from './src/components/MobileHeader';
import { useActivityStore } from './src/store/useActivityStore';
import { useGoalStore } from './src/store/useGoalStore';
import { LiveTrackingScreen } from './src/screens/LiveTrackingScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { WorkoutSummaryScreen } from './src/screens/WorkoutSummaryScreen';
import { YouScreen } from './src/screens/YouScreen';
import { MapsScreen } from './src/screens/MapsScreen';
import { SupportScreen } from './src/screens/SupportScreen';
import { LegalScreen } from './src/screens/LegalScreen';
import { backgroundStepService } from './src/services/BackgroundStepService';
import { permissionService } from './src/services/PermissionService';

type NavTab = 'home' | 'maps' | 'record' | 'you' | 'history' | 'onboarding' | 'liveTracking' | 'workoutSummary' | 'workoutDetail' | 'settings' | 'support' | 'legal';

export default function App() {
  const hydrateActivity = useActivityStore((s) => s.hydrateFromApi);
  const hydrateGoals = useGoalStore((s) => s.hydrateFromApi);
  const isTracking = useActivityStore((s) => s.isTracking);
  const lastCompletedWorkout = useActivityStore((s) => s.lastCompletedWorkout);
  const clearLastCompletedWorkout = useActivityStore((s) => s.clearLastCompletedWorkout);
  const recentActivities = useActivityStore((s) => s.recentActivities);
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    Promise.all([hydrateActivity(), hydrateGoals()]).catch(() => {});
  }, [hydrateActivity, hydrateGoals]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      // Do not auto-request permissions; features will request on demand
      if (mounted) {
        await backgroundStepService.start();
      }
    };
    init();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        backgroundStepService.start();
      }
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const selectedWorkout = selectedWorkoutId ? recentActivities.find((a) => a.id === selectedWorkoutId) || null : null;

  // Show live tracking when actively tracking OR when viewing the summary of a just-finished workout
  if (isTracking || activeTab === 'liveTracking') {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? '#050505' : '#f6f7fb' }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#050505' : '#f6f7fb'} />
        <LiveTrackingScreen onWorkoutComplete={() => setActiveTab('workoutSummary')} />
      </View>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardScreen onOpenOnboarding={() => setActiveTab('onboarding')} onStartActivity={() => setActiveTab('liveTracking')} />;
      case 'maps':
        return <MapsScreen />;
      case 'record':
        return <LiveTrackingScreen onWorkoutComplete={() => setActiveTab('workoutSummary')} />;
      case 'you':
        return <YouScreen onOpenSettings={() => setActiveTab('settings')} />;
      case 'history':
        return <HistoryScreen onSelectWorkout={(id) => { setSelectedWorkoutId(id); setActiveTab('workoutDetail'); }} />;
      case 'settings':
        return <SettingsScreen onNavigate={{ support: () => setActiveTab('support'), legal: () => setActiveTab('legal') }} />;
      case 'support':
        return <SupportScreen />;
      case 'legal':
        return <LegalScreen />;
      case 'onboarding':
        return <OnboardingScreen onFinish={() => setActiveTab('home')} />;
      case 'workoutSummary':
        return (
          <WorkoutSummaryScreen
            workout={lastCompletedWorkout}
            onDone={() => {
              clearLastCompletedWorkout();
              setActiveTab('home');
            }}
          />
        );
      case 'workoutDetail':
        return selectedWorkout ? (
          <WorkoutSummaryScreen
            workout={selectedWorkout}
            onDone={() => {
              setSelectedWorkoutId(null);
              setActiveTab('history');
            }}
          />
        ) : (
          <View style={{ flex: 1, backgroundColor: isDark ? '#050505' : '#f6f7fb', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: isDark ? '#f0fdf4' : '#0f172a', fontSize: 18, fontWeight: '700' }}>No workout selected</Text>
            <Text style={{ color: isDark ? '#4ade80' : '#94a3b8', fontSize: 14, marginTop: 8 }}>Select a workout from History to view details.</Text>
          </View>
        );
      default:
        return <DashboardScreen onOpenOnboarding={() => setActiveTab('onboarding')} onStartActivity={() => setActiveTab('liveTracking')} />;
    }
  };

  const showMainHeader = activeTab !== 'onboarding' && activeTab !== 'workoutSummary' && activeTab !== 'workoutDetail' && activeTab !== 'you';
  const showBottomNav = activeTab !== 'onboarding' && activeTab !== 'workoutSummary' && activeTab !== 'workoutDetail' && activeTab !== 'settings' && activeTab !== 'support' && activeTab !== 'legal';

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#050505' : '#f6f7fb' }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? '#050505' : '#f6f7fb'} />
      {showMainHeader && (
        <MobileHeader onSettingsPress={() => setActiveTab('settings')} />
      )}
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>
      {showBottomNav && (
        <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </View>
  );
}

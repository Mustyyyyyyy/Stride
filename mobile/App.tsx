import React, { useEffect, useState } from 'react';
import { View, StatusBar, AppState, Text } from 'react-native';
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
import { backgroundStepService } from './src/services/BackgroundStepService';
import { permissionService } from './src/services/PermissionService';

type NavTab = 'dashboard' | 'history' | 'notifications' | 'feed' | 'settings' | 'onboarding' | 'liveTracking' | 'workoutSummary' | 'workoutDetail';

export default function App() {
  const hydrateActivity = useActivityStore((s) => s.hydrateFromApi);
  const hydrateGoals = useGoalStore((s) => s.hydrateFromApi);
  const isTracking = useActivityStore((s) => s.isTracking);
  const lastCompletedWorkout = useActivityStore((s) => s.lastCompletedWorkout);
  const clearLastCompletedWorkout = useActivityStore((s) => s.clearLastCompletedWorkout);
  const recentActivities = useActivityStore((s) => s.recentActivities);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([hydrateActivity(), hydrateGoals()]).catch(() => {});
  }, [hydrateActivity, hydrateGoals]);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      await permissionService.requestAllPermissions();
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
      <View style={{ flex: 1, backgroundColor: '#090d16' }}>
        <StatusBar barStyle="light-content" backgroundColor="#090d16" />
        <LiveTrackingScreen onWorkoutComplete={() => setActiveTab('workoutSummary')} />
      </View>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen onOpenOnboarding={() => setActiveTab('onboarding')} onOpenSettings={() => setActiveTab('settings')} onStartActivity={() => setActiveTab('liveTracking')} />;
      case 'history':
        return <HistoryScreen onSelectWorkout={(id) => { setSelectedWorkoutId(id); setActiveTab('workoutDetail'); }} />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'feed':
        return <FeedScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'onboarding':
        return <OnboardingScreen onFinish={() => setActiveTab('dashboard')} />;
      case 'workoutSummary':
        return (
          <WorkoutSummaryScreen
            workout={lastCompletedWorkout}
            onDone={() => {
              clearLastCompletedWorkout();
              setActiveTab('dashboard');
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
          <View style={{ flex: 1, backgroundColor: '#090d16', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700' }}>No workout selected</Text>
            <Text style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>Select a workout from History to view details.</Text>
          </View>
        );
      default:
        return <DashboardScreen onOpenOnboarding={() => setActiveTab('onboarding')} onOpenSettings={() => setActiveTab('settings')} onStartActivity={() => setActiveTab('liveTracking')} />;
    }
  };

  const showHeader = activeTab !== 'onboarding' && activeTab !== 'workoutSummary' && activeTab !== 'workoutDetail';

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />
      {showHeader && (
        <MobileHeader onSettingsPress={() => setActiveTab('settings')} />
      )}
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>
      {activeTab !== 'onboarding' && activeTab !== 'workoutSummary' && activeTab !== 'workoutDetail' && (
        <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </View>
  );
}

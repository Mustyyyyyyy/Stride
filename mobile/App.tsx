import React, { useEffect, useState } from 'react';
import { Text, View, StatusBar } from 'react-native';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { GoalsScreen } from './src/screens/GoalsScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { FeedScreen } from './src/screens/FeedScreen';
import { BottomNavBar } from './src/components/BottomNavBar';
import { useActivityStore } from './src/store/useActivityStore';
import { useGoalStore } from './src/store/useGoalStore';

type NavTab = 'dashboard' | 'history' | 'notifications' | 'feed' | 'others';

export default function App() {
  const hydrateActivity = useActivityStore((s) => s.hydrateFromApi);
  const hydrateGoals = useGoalStore((s) => s.hydrateFromApi);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  useEffect(() => {
    Promise.all([hydrateActivity(), hydrateGoals()]).catch(() => {
    });
  }, [hydrateActivity, hydrateGoals]);

  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'feed':
        return <FeedScreen />;
      case 'others':
        return <GoalsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#090d16' }}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />
      {renderScreen()}
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );
}

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Home, Map, CirclePlay, User, History } from 'lucide-react-native';

type NavTab = 'home' | 'maps' | 'record' | 'you' | 'history';

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#050505' : '#ffffff', borderTopColor: isDark ? '#16b98133' : '#e2e8f0' }]}>
      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('home')}>
        <Home size={22} color={activeTab === 'home' ? (isDark ? '#34d399' : '#10b981') : (isDark ? '#4ade80' : '#94a3b8')} />
        <Text style={[styles.tabText, activeTab === 'home' && styles.tabTextActive, { color: isDark ? '#4ade80' : '#94a3b8' }]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('maps')}>
        <Map size={22} color={activeTab === 'maps' ? (isDark ? '#34d399' : '#10b981') : (isDark ? '#4ade80' : '#94a3b8')} />
        <Text style={[styles.tabText, activeTab === 'maps' && styles.tabTextActive, { color: isDark ? '#4ade80' : '#94a3b8' }]}>Maps</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('record')}>
        <View style={[styles.recordCircle, activeTab === 'record' && styles.recordCircleActive]}>
          <CirclePlay size={22} color={activeTab === 'record' ? '#050505' : (isDark ? '#4ade80' : '#94a3b8')} />
        </View>
        <Text style={[styles.tabText, activeTab === 'record' && styles.tabTextActive, { color: isDark ? '#4ade80' : '#94a3b8' }]}>Record</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('you')}>
        <User size={22} color={activeTab === 'you' ? (isDark ? '#34d399' : '#10b981') : (isDark ? '#4ade80' : '#94a3b8')} />
        <Text style={[styles.tabText, activeTab === 'you' && styles.tabTextActive, { color: isDark ? '#4ade80' : '#94a3b8' }]}>You</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('history')}>
        <History size={22} color={activeTab === 'history' ? (isDark ? '#34d399' : '#10b981') : (isDark ? '#4ade80' : '#94a3b8')} />
        <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive, { color: isDark ? '#4ade80' : '#94a3b8' }]}>History</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#10b981',
    fontWeight: '700',
  },
  recordCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  recordCircleActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
    shadowColor: '#10b981',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});

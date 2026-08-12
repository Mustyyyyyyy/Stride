import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LayoutDashboard, History, Bell, Share2, Settings } from 'lucide-react-native';

type NavTab = 'dashboard' | 'history' | 'notifications' | 'feed' | 'settings';

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabChange('dashboard')}
      >
        <LayoutDashboard size={22} color={activeTab === 'dashboard' ? '#10b981' : '#64748b'} />
        <Text style={[styles.tabText, activeTab === 'dashboard' && styles.tabTextActive]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabChange('feed')}
      >
        <Share2 size={22} color={activeTab === 'feed' ? '#10b981' : '#64748b'} />
        <Text style={[styles.tabText, activeTab === 'feed' && styles.tabTextActive]}>Feed</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabChange('history')}
      >
        <History size={22} color={activeTab === 'history' ? '#10b981' : '#64748b'} />
        <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabChange('notifications')}
      >
        <Bell size={22} color={activeTab === 'notifications' ? '#10b981' : '#64748b'} />
        <Text style={[styles.tabText, activeTab === 'notifications' && styles.tabTextActive]}>Alerts</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tab}
        onPress={() => onTabChange('settings')}
      >
        <Settings size={22} color={activeTab === 'settings' ? '#10b981' : '#64748b'} />
        <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  tabText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#10b981',
  },
});

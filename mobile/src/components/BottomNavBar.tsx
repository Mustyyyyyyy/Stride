import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Map, CirclePlay, User, History } from 'lucide-react-native';

type NavTab = 'home' | 'maps' | 'record' | 'you' | 'history';

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('home')}>
        <Home size={22} color={activeTab === 'home' ? '#10b981' : '#64748b'} />
        <Text style={[styles.tabText, activeTab === 'home' && styles.tabTextActive]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('maps')}>
        <Map size={22} color={activeTab === 'maps' ? '#10b981' : '#64748b'} />
        <Text style={[styles.tabText, activeTab === 'maps' && styles.tabTextActive]}>Maps</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('record')}>
        <View style={[styles.recordCircle, activeTab === 'record' && styles.recordCircleActive]}>
          <CirclePlay size={22} color={activeTab === 'record' ? '#090d16' : '#64748b'} />
        </View>
        <Text style={[styles.tabText, activeTab === 'record' && styles.tabTextActive]}>Record</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('you')}>
        <User size={22} color={activeTab === 'you' ? '#10b981' : '#64748b'} />
        <Text style={[styles.tabText, activeTab === 'you' && styles.tabTextActive]}>You</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} onPress={() => onTabChange('history')}>
        <History size={22} color={activeTab === 'history' ? '#10b981' : '#64748b'} />
        <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
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
  recordCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#334155',
  },
  recordCircleActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GoalsScreen } from './GoalsScreen';
import { SettingsScreen } from './SettingsScreen';

// Simple wrapper that exposes quick links: Goals and Settings
export const MoreScreen: React.FC<{ open: 'goals' | 'settings' | null } | undefined> = ({ }) => {
  // For simplicity render a list of options that navigate by replacing the main content in App.tsx
  // Actually the App manages which screen to show via activeTab; this MoreScreen will render a menu
  return (
    <View style={styles.container}>
      <Text style={styles.title}>More</Text>
      <TouchableOpacity style={styles.item} onPress={() => { /* handled by App via tab selection; placeholder */ }}>
        <Text style={styles.itemText}>Goals</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => { /* handled by App via tab selection; placeholder */ }}>
        <Text style={styles.itemText}>Settings</Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '800', marginBottom: 16 },
  item: { padding: 14, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937', marginBottom: 12 },
  itemText: { color: '#10b981', fontWeight: '700' },
});
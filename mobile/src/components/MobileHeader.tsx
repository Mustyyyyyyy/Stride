import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Settings, Bell, User } from 'lucide-react-native';

interface MobileHeaderProps {
  onSettingsPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onSettingsPress, onNotificationsPress, onProfilePress }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#050505' : '#ffffff', borderBottomColor: isDark ? '#16b98133' : '#e2e8f0' }]}>
      <View style={styles.brand}>
        <View style={[styles.logoBox, { backgroundColor: isDark ? '#34d399' : '#10b981', shadowColor: isDark ? '#34d399' : '#10b981' }]}>
          <Text style={styles.logoText}>⚡</Text>
        </View>
        <Text style={[styles.brandText, { color: isDark ? '#f0fdf4' : '#0f172a' }]}>STRIDE</Text>
      </View>
      <View style={styles.rightControls}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: isDark ? '#0a0a0a' : '#f6f7fb', borderColor: isDark ? '#16b98133' : '#e2e8f0' }]}
          onPress={onNotificationsPress}
          activeOpacity={0.7}
        >
          <Bell size={22} color={isDark ? '#34d399' : '#10b981'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: isDark ? '#0a0a0a' : '#f6f7fb', borderColor: isDark ? '#16b98133' : '#e2e8f0' }]}
          onPress={onProfilePress || onSettingsPress}
          activeOpacity={0.7}
        >
          <User size={22} color={isDark ? '#34d399' : '#10b981'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 56,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  logoText: {
    fontSize: 18,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});

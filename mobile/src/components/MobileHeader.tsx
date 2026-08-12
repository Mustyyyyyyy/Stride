import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Settings } from 'lucide-react-native';

interface MobileHeaderProps {
  onSettingsPress?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onSettingsPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>⚡</Text>
        </View>
        <Text style={styles.brandText}>STRIDE</Text>
      </View>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={onSettingsPress}
        activeOpacity={0.7}
      >
        <Settings size={24} color="#10b981" />
        <Text style={styles.settingsLabel}>Settings</Text>
      </TouchableOpacity>
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
    backgroundColor: '#090d16',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    minHeight: 56,
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
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 18,
  },
  brandText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  settingsLabel: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '800',
  },
});

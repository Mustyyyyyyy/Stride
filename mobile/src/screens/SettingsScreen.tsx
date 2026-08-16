import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { useActivityStore } from '../store/useActivityStore';
import { Settings, ChevronRight, Moon, Sun, Mail, Shield, Bell, HelpCircle, FileText, Info, LogOut, MapPin, Navigation, Footprints } from 'lucide-react-native';
import { api } from '../services/api';
import { permissionService } from '../services/PermissionService';
import { useColorScheme } from 'react-native';

interface SettingsScreenProps {
  onNavigate?: { support: () => void; legal: () => void };
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const { user, updateProfile, logout } = useAuthStore();
  const { unitSystem, setUnitSystem, theme, toggleTheme, backgroundStepsEnabled, setBackgroundStepsEnabled, init } = useAppStore();
  const { recentActivities } = useActivityStore();
  const [email, setEmail] = useState(user?.email || '');
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [bgStepsLoading, setBgStepsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = theme === 'DARK' || (theme === 'SYSTEM' && colorScheme === 'dark');

  useEffect(() => {
    setEmail(user?.email || '');
    init();
  }, [user?.email]);

  const handleUpdateEmail = () => {
    updateProfile({ email });
    Alert.alert('Success', 'Email updated successfully.');
  };

  const handleToggleBackgroundSteps = async () => {
    setBgStepsLoading(true);
    try {
      if (!backgroundStepsEnabled) {
        const granted = await permissionService.requestActivityRecognition();
        if (!granted) {
          Alert.alert('Permission Required', 'Activity recognition permission is needed for background step counting.');
          return;
        }
      }
      await setBackgroundStepsEnabled(!backgroundStepsEnabled);
    } finally {
      setBgStepsLoading(false);
    }
  };

  const handleToggleLocation = async () => {
    if (!locationEnabled) {
      const granted = await permissionService.requestLocation();
      if (!granted) {
        Alert.alert('Permission Required', 'Location permission is needed for GPS tracking.');
        return;
      }
    }
    setLocationEnabled(!locationEnabled);
  };

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await permissionService.requestNotification();
      if (!granted) {
        Alert.alert('Permission Required', 'Notification permission is needed for workout alerts.');
        return;
      }
    }
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  const handleSupport = () => {
    Linking.openURL('https://stride-phi-one.vercel.app/support');
  };

  const handleLegal = () => {
    Linking.openURL('https://stride-phi-one.vercel.app/legal');
  };

  const totalDistance = recentActivities.reduce((acc, a) => acc + a.distance, 0) / 1000;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Tracking, privacy, and support</Text>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <Mail size={18} color="#10b981" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <TouchableOpacity onPress={handleUpdateEmail} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              {theme === 'dark' ? <Moon size={18} color="#f59e0b" /> : <Sun size={18} color="#6366f1" />}
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Theme</Text>
              <Text style={styles.settingValue}>{theme === 'dark' ? 'Dark' : 'Light'}</Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={styles.toggleBtn}>
              <Text style={styles.toggleBtnText}>{theme === 'dark' ? 'Light' : 'Dark'}</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: '#1e293b' }]}>
            <View style={styles.settingIcon}>
              <Navigation size={18} color="#06b6d4" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Units</Text>
              <Text style={styles.settingValue}>{unitSystem === 'METRIC' ? 'Metric (km)' : 'Imperial (mi)'}</Text>
            </View>
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[styles.unitBtn, unitSystem === 'METRIC' && styles.unitBtnActive]}
                onPress={() => setUnitSystem('METRIC')}
              >
                <Text style={[styles.unitText, unitSystem === 'METRIC' && styles.unitTextActive]}>Metric</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.unitBtn, unitSystem === 'IMPERIAL' && styles.unitBtnActive]}
                onPress={() => setUnitSystem('IMPERIAL')}
              >
                <Text style={[styles.unitText, unitSystem === 'IMPERIAL' && styles.unitTextActive]}>Imperial</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Permissions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
              <MapPin size={18} color="#f97316" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Location</Text>
              <Text style={styles.settingValue}>Required for GPS tracking</Text>
            </View>
            <TouchableOpacity
              onPress={handleToggleLocation}
              style={[styles.toggleBtn, locationEnabled && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleBtnText, locationEnabled && styles.toggleBtnTextActive]}>
                {locationEnabled ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: isDark ? '#16b98133' : '#e2e8f0' }]}>
            <View style={styles.settingIcon}>
              <Footprints size={18} color={isDark ? '#22d3ee' : '#06b6d4'} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Background Steps</Text>
              <Text style={styles.settingValue}>Count steps even when the app is closed</Text>
            </View>
            <TouchableOpacity
              onPress={handleToggleBackgroundSteps}
              disabled={bgStepsLoading}
              style={[styles.toggleBtn, backgroundStepsEnabled && styles.toggleBtnActive, bgStepsLoading && { opacity: 0.6 }]}
            >
              <Text style={[styles.toggleBtnText, backgroundStepsEnabled && styles.toggleBtnTextActive]}>
                {bgStepsLoading ? '...' : backgroundStepsEnabled ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: isDark ? '#16b98133' : '#e2e8f0' }]}>
            <View style={styles.settingIcon}>
              <Bell size={18} color={isDark ? '#fbbf24' : '#f59e0b'} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingValue}>Workout reminders and alerts</Text>
            </View>
            <TouchableOpacity
              onPress={handleToggleNotifications}
              style={[styles.toggleBtn, notificationsEnabled && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleBtnText, notificationsEnabled && styles.toggleBtnTextActive]}>
                {notificationsEnabled ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Support & Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support & Legal</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.linkRow} onPress={() => onNavigate?.support()}>
            <View style={styles.settingIcon}>
              <HelpCircle size={18} color="#10b981" />
            </View>
            <Text style={styles.linkText}>Support</Text>
            <ChevronRight size={18} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.linkRow, { borderTopWidth: 1, borderTopColor: '#1e293b' }]} onPress={() => onNavigate?.legal()}>
            <View style={styles.settingIcon}>
              <FileText size={18} color="#06b6d4" />
            </View>
            <Text style={styles.linkText}>Legal</Text>
            <ChevronRight size={18} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.linkRow, { borderTopWidth: 1, borderTopColor: '#1e293b' }]}>
            <View style={styles.settingIcon}>
              <Info size={18} color="#f59e0b" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.linkText}>About</Text>
              <Text style={styles.settingValue}>Stride v1.0.0</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Stride v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fb',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 24,
    color: '#94a3b8',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0f172a',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f6f7fb',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
  settingValue: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  input: {
    backgroundColor: '#f6f7fb',
    borderRadius: 10,
    padding: 12,
    color: '#0f172a',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  toggleBtn: {
    backgroundColor: '#f6f7fb',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  toggleBtnText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: '#ffffff',
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#f6f7fb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  unitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  unitBtnActive: {
    backgroundColor: '#10b981',
  },
  unitText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  unitTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  linkText: {
    flex: 1,
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 16,
    borderRadius: 16,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
  version: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
});

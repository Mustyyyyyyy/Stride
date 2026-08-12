import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, Alert, ScrollView, BackHandler } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { Storage, KEYS } from '../services/Storage';
import { api } from '../services/api';
import { backgroundStepService } from '../services/BackgroundStepService';
import { permissionService } from '../services/PermissionService';
import { ChevronLeft, ShieldCheck, ShieldAlert, MapPin, Activity, Bell } from 'lucide-react-native';

export const SettingsScreen: React.FC = () => {
  const auth = useAuthStore();
  const user = auth.user;

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [weight, setWeight] = useState((user?.weight || 70).toString());
  const [height, setHeight] = useState((user?.height || 175).toString());
  const [unitSystem, setUnitSystem] = useState(user?.unitSystem || 'METRIC');
  const [theme, setTheme] = useState(user?.theme || 'DARK');
  const [backgroundTracking, setBackgroundTracking] = useState<boolean>(true);
  const [shareSteps, setShareSteps] = useState<boolean>(false);
  const [autoSync, setAutoSync] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [permActivity, setPermActivity] = useState<boolean | null>(null);
  const [permLocation, setPermLocation] = useState<boolean | null>(null);
  const [permNotification, setPermNotification] = useState<boolean | null>(null);

  // Load persisted settings once
  useEffect(() => {
    const raw = Storage.getString(KEYS.SETTINGS);
    if (raw) {
      try {
        const s = JSON.parse(raw);
        if (s.backgroundTracking !== undefined) setBackgroundTracking(!!s.backgroundTracking);
        if (s.shareSteps !== undefined) setShareSteps(!!s.shareSteps);
        if (s.autoSync !== undefined) setAutoSync(!!s.autoSync);
        if (s.unitSystem) setUnitSystem(s.unitSystem);
        if (s.theme) setTheme(s.theme);
      } catch {}
    }
  }, []);

  // Load current permission status
  useEffect(() => {
    let mounted = true;
    const loadPerms = async () => {
      const [activity, location, notification] = await Promise.all([
        permissionService.checkActivityRecognition(),
        permissionService.checkLocation(),
        permissionService.checkNotification(),
      ]);
      if (mounted) {
        setPermActivity(activity);
        setPermLocation(location);
        setPermNotification(notification);
      }
    };
    loadPerms();
    return () => { mounted = false; };
  }, []);

  // Android back button support
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      return false;
    });
    return () => subscription.remove();
  }, []);

  const persistSettings = useCallback((settings: Record<string, any>) => {
    Storage.setString(KEYS.SETTINGS, JSON.stringify(settings));
  }, []);

  const saveSettings = async () => {
    setIsSaving(true);
    const profilePayload: any = {
      fullName: fullName || user?.fullName,
      weight: Number(weight) || user?.weight,
      height: Number(height) || user?.height,
      unitSystem,
      theme,
    };

    try {
      await auth.updateProfile(profilePayload);
    } catch (e) {
      await auth.updateProfile(profilePayload).catch(() => {});
    }

    const settings = {
      backgroundTracking,
      shareSteps,
      autoSync,
      unitSystem,
      theme,
    };
    persistSettings(settings);

    setIsSaving(false);
    Alert.alert('Settings saved', 'Your preferences have been updated.');
  };

  const [devices, setDevices] = useState<Array<{ deviceId: string; linkedAt?: string }>>([]);

  const loadDevices = useCallback(async () => {
    try {
      const list = await api.getDevices();
      if (Array.isArray(list)) setDevices(list);
    } catch {}
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  const copyToClipboard = async (id: string) => {
    try {
      const Clipboard = require('@react-native-clipboard/clipboard').default;
      Clipboard.setString(id);
      Alert.alert('Copied', 'Device ID copied to clipboard');
    } catch {
      try {
        const { Share } = require('react-native');
        await Share.share({ message: `Device ID: ${id}`, title: 'Device ID' });
      } catch {
        Alert.alert('Could not copy device ID', id);
      }
    }
  };

  const linkDevice = async () => {
    try {
      const deviceId = Storage.getString(KEYS.DEVICE_ID) || '';
      if (!deviceId) {
        Alert.alert('No device id found');
        return;
      }
      await api.linkDevice(deviceId);
      Alert.alert('Device linked');
      loadDevices();
    } catch (e: any) {
      Alert.alert('Device link failed', e?.message || String(e));
    }
  };

  const unlinkDevice = async (deviceId: string) => {
    try {
      await api.unlinkDevice(deviceId);
      Alert.alert('Device unlinked');
      loadDevices();
    } catch (e: any) {
      Alert.alert('Unlink failed', e?.message || String(e));
    }
  };

  const signOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => auth.logout() },
    ]);
  };

  const doExport = async () => {
    try {
      const pending = (await import('../services/OfflineBuffer')).OfflineBuffer.getPendingOfflineWorkouts();
      const payload = { user: auth.user, pending, exportedAt: new Date().toISOString() };
      const json = JSON.stringify(payload, null, 2);
      const { Share } = require('react-native');
      await Share.share({ message: json, title: 'Stride export' });
    } catch (e: any) {
      Alert.alert('Export failed', e?.message || String(e));
    }
  };

  const doSync = async () => {
    try {
      setIsSaving(true);
      const offline = await import('../services/OfflineBuffer');
      const count = await offline.OfflineBuffer.syncPendingWorkouts(api.createActivity);
      setIsSaving(false);
      Alert.alert('Sync complete', `${count} workouts uploaded`);
    } catch (e: any) {
      setIsSaving(false);
      Alert.alert('Sync failed', e?.message || String(e));
    }
  };

  const toggleBackgroundTracking = async (val: boolean) => {
    setBackgroundTracking(val);
    const raw = Storage.getString(KEYS.SETTINGS);
    const s = raw ? JSON.parse(raw) : {};
    s.backgroundTracking = val;
    Storage.setString(KEYS.SETTINGS, JSON.stringify(s));

    if (val) {
      const granted = await permissionService.requestActivityRecognition();
      if (granted) {
        await backgroundStepService.setBackgroundTrackingEnabled(true);
        Alert.alert('Background tracking enabled', 'Steps will be counted even when the app is in the background.');
        setPermActivity(true);
      } else {
        Alert.alert('Permission denied', 'Enable activity recognition permission in Settings to count steps in background.');
        setBackgroundTracking(false);
      }
    } else {
      await backgroundStepService.setBackgroundTrackingEnabled(false);
    }
  };

  const requestLocationPermission = async () => {
    const granted = await permissionService.requestLocation();
    setPermLocation(granted);
    if (granted) {
      Alert.alert('Location enabled', 'GPS tracking is now available for workouts.');
    } else {
      Alert.alert('Location denied', 'Enable location permission in Settings to use GPS tracking.');
    }
  };

  const requestActivityPermission = async () => {
    const granted = await permissionService.requestActivityRecognition();
    setPermActivity(granted);
    if (granted) {
      Alert.alert('Activity recognition enabled', 'Step counting is now available.');
    } else {
      Alert.alert('Permission denied', 'Enable activity recognition in Settings to count steps.');
    }
  };

  const requestNotificationPermission = async () => {
    const granted = await permissionService.requestNotification();
    setPermNotification(granted);
    if (granted) {
      Alert.alert('Notifications enabled', 'You will now receive workout alerts.');
    } else {
      Alert.alert('Notifications denied', 'Enable notification permission in Settings to receive alerts.');
    }
  };

  const requestAllPermissions = async () => {
    const results = await permissionService.requestAllPermissions();
    setPermActivity(results.activity);
    setPermLocation(results.location);
    setPermNotification(results.notification);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => {}}>
          <ChevronLeft size={22} color="#10b981" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <Text style={styles.sectionLabel}>Profile</Text>
      <Text style={styles.label}>Full name</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Your name" placeholderTextColor="#64748b" />

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="70" placeholderTextColor="#64748b" />

      <Text style={styles.label}>Height (cm)</Text>
      <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" placeholder="175" placeholderTextColor="#64748b" />

      <Text style={styles.sectionLabel}>Preferences</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Unit System</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => setUnitSystem('METRIC')} style={[styles.unitBtn, unitSystem === 'METRIC' && styles.unitBtnActive]}>
            <Text style={styles.unitText}>Metric</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setUnitSystem('IMPERIAL')} style={[styles.unitBtn, unitSystem === 'IMPERIAL' && styles.unitBtnActive]}>
            <Text style={styles.unitText}>Imperial</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rowRight}>
        <Text style={styles.label}>Background tracking</Text>
        <Switch value={backgroundTracking} onValueChange={toggleBackgroundTracking} trackColor={{ false: '#334155', true: '#10b981' }} />
      </View>

      <View style={styles.rowRight}>
        <Text style={styles.label}>Share steps publicly</Text>
        <Switch value={shareSteps} onValueChange={setShareSteps} trackColor={{ false: '#334155', true: '#10b981' }} />
      </View>

      <View style={styles.rowRight}>
        <Text style={styles.label}>Auto-sync pending workouts</Text>
        <Switch value={autoSync} onValueChange={setAutoSync} trackColor={{ false: '#334155', true: '#10b981' }} />
      </View>

      <Text style={styles.sectionLabel}>Permissions</Text>
      <Text style={styles.helpText}>Grant these permissions so Stride can track workouts, count steps, and send alerts.</Text>

      <View style={styles.permCard}>
        <View style={styles.permHeader}>
          <View style={[styles.permIconBox, { backgroundColor: '#10b98115', borderColor: '#10b98130' }]}>
            <Activity size={20} color="#10b981" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.permTitle}>Physical Activity</Text>
            <Text style={styles.permDesc}>Required for background step counting</Text>
          </View>
          {permActivity === true && <ShieldCheck size={20} color="#10b981" />}
          {permActivity === false && <ShieldAlert size={20} color="#ef4444" />}
        </View>
        <TouchableOpacity
          style={[styles.permBtn, permActivity && styles.permBtnGranted]}
          onPress={requestActivityPermission}
        >
          <Text style={[styles.permBtnText, permActivity && styles.permBtnTextGranted]}>
            {permActivity === true ? 'Granted' : permActivity === false ? 'Denied — Tap to retry' : 'Grant Permission'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.permCard}>
        <View style={styles.permHeader}>
          <View style={[styles.permIconBox, { backgroundColor: '#06b6d415', borderColor: '#06b6d430' }]}>
            <MapPin size={20} color="#06b6d4" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.permTitle}>Location</Text>
            <Text style={styles.permDesc}>Required for GPS tracking during workouts</Text>
          </View>
          {permLocation === true && <ShieldCheck size={20} color="#10b981" />}
          {permLocation === false && <ShieldAlert size={20} color="#ef4444" />}
        </View>
        <TouchableOpacity
          style={[styles.permBtn, permLocation && styles.permBtnGranted]}
          onPress={requestLocationPermission}
        >
          <Text style={[styles.permBtnText, permLocation && styles.permBtnTextGranted]}>
            {permLocation === true ? 'Granted' : permLocation === false ? 'Denied — Tap to retry' : 'Grant Permission'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.permCard}>
        <View style={styles.permHeader}>
          <View style={[styles.permIconBox, { backgroundColor: '#f59e0b15', borderColor: '#f59e0b30' }]}>
            <Bell size={20} color="#f59e0b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.permTitle}>Notifications</Text>
            <Text style={styles.permDesc}>Required for workout alerts and reminders</Text>
          </View>
          {permNotification === true && <ShieldCheck size={20} color="#10b981" />}
          {permNotification === false && <ShieldAlert size={20} color="#ef4444" />}
        </View>
        <TouchableOpacity
          style={[styles.permBtn, permNotification && styles.permBtnGranted]}
          onPress={requestNotificationPermission}
        >
          <Text style={[styles.permBtnText, permNotification && styles.permBtnTextGranted]}>
            {permNotification === true ? 'Granted' : permNotification === false ? 'Denied — Tap to retry' : 'Grant Permission'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.grantAllBtn} onPress={requestAllPermissions}>
        <Text style={styles.grantAllBtnText}>Grant All Permissions</Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>Connected Devices</Text>
      <Text style={styles.label}>This device ID</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <Text style={[styles.input, { flex: 1 }]}>{Storage.getString(KEYS.DEVICE_ID) || '—'}</Text>
        <TouchableOpacity style={styles.smallBtn} onPress={() => { const id = Storage.getString(KEYS.DEVICE_ID) || ''; copyToClipboard(id); }}>
          <Text style={styles.smallBtnText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallBtn} onPress={linkDevice}>
          <Text style={styles.smallBtnText}>Link</Text>
        </TouchableOpacity>
      </View>

      {devices.length > 0 && devices.map((d) => (
        <View key={d.deviceId} style={styles.deviceRow}>
          <Text style={styles.deviceText}>{d.deviceId}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={styles.smallBtn} onPress={() => copyToClipboard(d.deviceId)}>
              <Text style={styles.smallBtnText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallBtn} onPress={() => unlinkDevice(d.deviceId)}>
              <Text style={styles.smallBtnText}>Unlink</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={styles.sectionLabel}>Data</Text>
      <TouchableOpacity style={styles.saveBtn} onPress={doExport}>
        <Text style={styles.saveBtnText}>Export data</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkBtn} onPress={doSync}>
        <Text style={styles.linkBtnText}>{isSaving ? 'Syncing...' : 'Sync pending workouts'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={saveSettings} disabled={isSaving}>
        <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save Profile'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signoutBtn} onPress={signOut}>
        <Text style={styles.signoutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1e293b' },
  title: { color: '#ffffff', fontSize: 22, fontWeight: '800' },
  sectionLabel: { color: '#ffffff', fontSize: 14, fontWeight: '700', marginTop: 20, marginBottom: 12 },
  label: { color: '#94a3b8', fontSize: 12, marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#0f172a', color: '#ffffff', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#1f2937' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rowRight: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  unitBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1f2937' },
  unitBtnActive: { backgroundColor: '#10b981' },
  unitText: { color: '#ffffff', fontWeight: '700' },
  saveBtn: { marginTop: 12, backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#090d16', fontWeight: '800' },
  linkBtn: { marginTop: 12, backgroundColor: '#111827', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1f2937' },
  linkBtnText: { color: '#94a3b8', fontWeight: '700' },
  signoutBtn: { marginTop: 12, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  signoutText: { color: '#ef4444', fontWeight: '800' },
  smallBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b' },
  smallBtnText: { color: '#10b981', fontWeight: '700', fontSize: 12 },
  deviceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111827', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#1f2937', marginBottom: 8 },
  deviceText: { color: '#94a3b8', fontSize: 12, flex: 1 },
  helpText: { color: '#64748b', fontSize: 12, marginBottom: 12, marginTop: -8 },
  permCard: { backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1f2937', marginBottom: 12 },
  permHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  permIconBox: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  permTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  permDesc: { color: '#64748b', fontSize: 11, fontWeight: '500', marginTop: 2 },
  permBtn: { paddingVertical: 12, borderRadius: 10, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', alignItems: 'center' },
  permBtnText: { color: '#10b981', fontSize: 13, fontWeight: '700' },
  permBtnGranted: { backgroundColor: '#10b98115', borderColor: '#10b98130' },
  permBtnTextGranted: { color: '#10b981' },
  grantAllBtn: { marginTop: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center' },
  grantAllBtnText: { color: '#090d16', fontSize: 14, fontWeight: '800' },
});

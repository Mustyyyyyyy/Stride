import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { User, Settings, Save, Moon, Sun } from 'lucide-react-native';
import { Storage, KEYS } from '../services/Storage';
import { api } from '../services/api';

export const ProfileScreen: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.fullName || '');
  const [weight, setWeight] = useState(String(user?.weight || 70));
  const [height, setHeight] = useState(String(user?.height || 175));

  const handleSave = () => {
    updateProfile({ fullName: name, weight: Number(weight), height: Number(height) });
  };

  const toggleTheme = async () => {
    const newTheme = user?.theme === 'DARK' ? 'LIGHT' : 'DARK';
    await updateProfile({ theme: newTheme });
  };

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Not signed in</Text>
      </View>
    );
  }

  const deviceId = Storage.getString(KEYS.DEVICE_ID) || 'unknown';

  const handleLinkDevice = async () => {
    try {
      await api.linkDevice(deviceId);
      alert('Device linked to your account.');
    } catch (e) {
      alert('Unable to link device. Backend may not support device linking.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.fullName?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Body Metrics</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Save size={16} color="#090d16" />
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.preferenceRow}>
            <View>
              <Text style={styles.prefLabel}>Units</Text>
              <Text style={styles.prefValue}>{user.unitSystem === 'METRIC' ? 'Metric (km)' : 'Imperial (mi)'}</Text>
            </View>
            <View style={styles.unitToggle}>
              <TouchableOpacity style={[styles.unitBtn, user.unitSystem === 'METRIC' && styles.unitBtnActive]}>
                <Text style={[styles.unitText, user.unitSystem === 'METRIC' && styles.unitTextActive]}>Metric</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.unitBtn, user.unitSystem === 'IMPERIAL' && styles.unitBtnActive]}>
                <Text style={[styles.unitText, user.unitSystem === 'IMPERIAL' && styles.unitTextActive]}>Imperial</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.preferenceRow, { borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 14, marginTop: 14 }]}>
            <View>
              <Text style={styles.prefLabel}>Theme</Text>
              <Text style={styles.prefValue}>{user.theme === 'DARK' ? 'Dark' : 'Light'}</Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeIcon}>
              {user.theme === 'DARK' ? <Moon size={20} color="#f59e0b" /> : <Sun size={20} color="#6366f1" />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Device</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Device ID</Text>
            <Text style={{ color: '#94a3b8', marginBottom: 12 }}>{deviceId}</Text>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#06b6d4' }]} onPress={handleLinkDevice}>
              <Text style={styles.saveBtnText}>Link this device</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  profileHeader: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#090d16', fontSize: 32, fontWeight: '800' },
  name: { color: '#ffffff', fontSize: 22, fontWeight: '800' },
  email: { color: '#64748b', fontSize: 13, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  card: { backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1f2937' },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: '#0f172a', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 14, borderWidth: 1, borderColor: '#1e293b' },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12, marginTop: 18 },
  saveBtnText: { color: '#090d16', fontWeight: '700', fontSize: 13 },
  preferenceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prefLabel: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
  prefValue: { color: '#64748b', fontSize: 12, marginTop: 2 },
  unitToggle: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 10, borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden' },
  unitBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  unitBtnActive: { backgroundColor: '#10b981' },
  unitText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  unitTextActive: { color: '#090d16', fontWeight: '700' },
  themeIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, backgroundColor: '#090d16', alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
});


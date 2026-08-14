import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useActivityStore } from '../store/useActivityStore';
import { ActivityType } from '../types';
import { Search, Zap, Footprints, Bike, Mountain, ChevronRight } from 'lucide-react-native';

const FILTERS: Array<{ id: string; label: string }> = [
  { id: 'ALL', label: 'All' },
  { id: 'RUNNING', label: 'Run' },
  { id: 'WALKING', label: 'Walk' },
  { id: 'CYCLING', label: 'Ride' },
  { id: 'HIKING', label: 'Hike' },
];

const TYPE_ICON: Record<string, React.ReactNode> = {
  RUNNING: <Zap size={22} color="#10b981" />,
  WALKING: <Footprints size={22} color="#06b6d4" />,
  CYCLING: <Bike size={22} color="#f97316" />,
  HIKING: <Mountain size={22} color="#a855f7" />,
};

export const HistoryScreen: React.FC<{ onSelectWorkout?: (id: string) => void }> = ({ onSelectWorkout }) => {
  const { recentActivities, addManualActivity, deleteActivity } = useActivityStore();
  const [filter, setFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'WALKING', distance: '0', duration: '0', steps: '0', calories: '0' });

  const filtered = recentActivities.filter((act) => {
    if (filter !== 'ALL' && act.type !== filter) return false;
    if (query.trim()) return act.title.toLowerCase().includes(query.toLowerCase());
    return true;
  });

  const onAdd = async () => {
    const payload: Partial<any> = {
      title: form.title || undefined,
      type: form.type as any,
      distance: Number(form.distance) || 0,
      duration: Number(form.duration) || 0,
      steps: Number(form.steps) || 0,
      calories: Number(form.calories) || 0,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
    };
    await addManualActivity(payload);
    setShowAdd(false);
    setForm({ title: '', type: 'WALKING', distance: '0', duration: '0', steps: '0', calories: '0' });
  };

  const onDelete = (id: string) => {
    const ok = (global as any).confirm ? (global as any).confirm('Delete this workout?') : true;
    if (ok) deleteActivity(id);
  };

  const handleWorkoutPress = (id: string) => {
    if (onSelectWorkout) {
      onSelectWorkout(id);
    }
  };

  if (recentActivities.length === 0 && !showAdd) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No activities yet</Text>
        <Text style={styles.emptySub}>Start a workout to build your history.</Text>
        <TouchableOpacity style={styles.onboardingButton} onPress={() => setShowAdd(true)}>
          <Text style={styles.onboardingButtonText}>Add workout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.title}>Activity History</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd((s) => !s)}>
          <Text style={styles.addBtnText}>{showAdd ? 'Cancel' : 'Add'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Your recorded GPS workouts</Text>

      {showAdd && (
        <View style={styles.addCard}>
          <TextInput style={styles.input} placeholder="Title" placeholderTextColor="#64748b" value={form.title} onChangeText={(t) => setForm((s) => ({ ...s, title: t }))} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Distance (m)" keyboardType="numeric" value={form.distance} onChangeText={(t) => setForm((s) => ({ ...s, distance: t }))} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Duration (s)" keyboardType="numeric" value={form.duration} onChangeText={(t) => setForm((s) => ({ ...s, duration: t }))} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Steps" keyboardType="numeric" value={form.steps} onChangeText={(t) => setForm((s) => ({ ...s, steps: t }))} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Calories" keyboardType="numeric" value={form.calories} onChangeText={(t) => setForm((s) => ({ ...s, calories: t }))} />
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={onAdd}><Text style={styles.saveBtnText}>Save workout</Text></TouchableOpacity>
        </View>
      )}

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={16} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workouts..."
            placeholderTextColor="#64748b"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.list}>
        {filtered.map((act) => (
          <TouchableOpacity key={act.id} onPress={() => handleWorkoutPress(act.id)}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>{TYPE_ICON[act.type]}</View>
                <View style={styles.cardTitleBlock}>
                  <Text style={styles.cardTitle}>{act.title}</Text>
                  <Text style={styles.cardMeta}>
                    {new Date(act.startTime).toLocaleDateString()} • {(act.distance / 1000).toFixed(2)} km
                  </Text>
                </View>
                <ChevronRight size={18} color="#64748b" />
              </View>
              <View style={styles.cardMetrics}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Duration</Text>
                  <Text style={styles.metricValue}>{Math.round(act.duration / 60)} min</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Calories</Text>
                  <Text style={[styles.metricValue, { color: '#f97316' }]}>{act.calories} kcal</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Pace</Text>
                  <Text style={styles.metricValue}>{act.averagePace} min/km</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#94a3b8', fontSize: 13, marginBottom: 16 },
  searchRow: { marginBottom: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#1f2937' },
  searchInput: { color: '#ffffff', marginLeft: 8, flex: 1, fontSize: 14 },
  filterRow: { marginBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937', marginRight: 8 },
  filterChipActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  filterText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#090d16', fontWeight: '700' },
  list: { gap: 12, paddingBottom: 24 },
  card: { backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1f2937' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardTitleBlock: { flex: 1 },
  cardTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  cardMeta: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  cardMetrics: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1e293b' },
  metricBox: { alignItems: 'center' },
  metricLabel: { color: '#64748b', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  metricValue: { color: '#ffffff', fontSize: 14, fontWeight: '700', marginTop: 4 },
  emptyContainer: { flex: 1, backgroundColor: '#090d16', alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub: { color: '#64748b', fontSize: 14 },
  addBtn: { backgroundColor: '#10b981', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#090d16', fontWeight: '700', fontSize: 12 },
  addCard: { backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1f2937', marginBottom: 16 },
  input: { backgroundColor: '#0f172a', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 14, borderWidth: 1, borderColor: '#1e293b', marginBottom: 8 },
  saveBtn: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#090d16', fontWeight: '700', fontSize: 14 },
  onboardingButton: { backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  onboardingButtonText: { color: '#090d16', fontWeight: '700', fontSize: 14 },
});

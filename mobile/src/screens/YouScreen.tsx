import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useActivityStore } from '../store/useActivityStore';
import { useGoalStore } from '../store/useGoalStore';
import { Settings, ChevronRight, Trophy, Flame, Footprints, Zap, Bike, Mountain, Target, Award } from 'lucide-react-native';
import { Storage, KEYS } from '../services/Storage';
import { api } from '../services/api';

type YouTab = 'progress' | 'workouts' | 'activities';

interface YouScreenProps {
  onOpenSettings?: () => void;
}

export const YouScreen: React.FC<YouScreenProps> = ({ onOpenSettings }) => {
  const { user, updateProfile } = useAuthStore();
  const { recentActivities } = useActivityStore();
  const { goals, achievements } = useGoalStore();
  const [tab, setTab] = useState<YouTab>('progress');
  const [name, setName] = useState(user?.fullName || '');
  const [weight, setWeight] = useState(String(user?.weight || 70));
  const [height, setHeight] = useState(String(user?.height || 175));

  useEffect(() => {
    setName(user?.fullName || '');
    setWeight(String(user?.weight || 70));
    setHeight(String(user?.height || 175));
  }, [user?.fullName, user?.weight, user?.height]);

  const handleSave = () => {
    updateProfile({ fullName: name, weight: Number(weight), height: Number(height) });
  };

  const deviceId = Storage.getString(KEYS.DEVICE_ID) || 'unknown';

  const handleLinkDevice = async () => {
    try {
      await api.linkDevice(deviceId);
      alert('Device linked to your account.');
    } catch (e) {
      alert('Unable to link device. Backend may not support device linking.');
    }
  };

  const totalDistance = recentActivities.reduce((acc, a) => acc + a.distance, 0) / 1000;
  const totalSteps = recentActivities.reduce((acc, a) => acc + a.steps, 0);
  const totalCalories = recentActivities.reduce((acc, a) => acc + a.calories, 0);
  const totalWorkouts = recentActivities.length;

  const tabs: { id: YouTab; label: string }[] = [
    { id: 'progress', label: 'Progress' },
    { id: 'workouts', label: 'Workouts' },
    { id: 'activities', label: 'Activities' },
  ];

  const renderProgress = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullName?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Flame size={20} color="#f97316" />
          <Text style={styles.statValue}>{Math.round(totalCalories)}</Text>
          <Text style={styles.statLabel}>kcal</Text>
        </View>
        <View style={styles.statCard}>
          <Footprints size={20} color="#06b6d4" />
          <Text style={styles.statValue}>{totalSteps.toLocaleString()}</Text>
          <Text style={styles.statLabel}>steps</Text>
        </View>
        <View style={styles.statCard}>
          <Zap size={20} color="#10b981" />
          <Text style={styles.statValue}>{totalWorkouts}</Text>
          <Text style={styles.statLabel}>workouts</Text>
        </View>
        <View style={styles.statCard}>
          <Bike size={20} color="#f59e0b" />
          <Text style={styles.statValue}>{totalDistance.toFixed(1)}</Text>
          <Text style={styles.statLabel}>km</Text>
        </View>
      </View>

      {/* Edit Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Edit Profile</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Device */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Device ID</Text>
          <Text style={{ color: '#94a3b8', marginBottom: 12 }}>{deviceId}</Text>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: '#06b6d4' }]} onPress={handleLinkDevice}>
            <Text style={styles.saveBtnText}>Link this device</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderWorkouts = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>Your Workouts</Text>
      {recentActivities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No workouts yet</Text>
          <Text style={styles.emptySub}>Complete a workout to see it here.</Text>
        </View>
      ) : (
        <View style={styles.workoutList}>
          {recentActivities.map((act) => (
            <View key={act.id} style={styles.workoutCard}>
              <View style={styles.workoutHeader}>
                <View style={styles.workoutIconBox}>
                  {act.type === 'RUNNING' ? <Zap size={20} color="#10b981" /> :
                   act.type === 'WALKING' ? <Footprints size={20} color="#06b6d4" /> :
                   act.type === 'CYCLING' ? <Bike size={20} color="#f97316" /> :
                   act.type === 'HIKING' ? <Mountain size={20} color="#a855f7" /> :
                   <Zap size={20} color="#10b981" />}
                </View>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutTitle}>{act.title}</Text>
                  <Text style={styles.workoutMeta}>
                    {new Date(act.startTime).toLocaleDateString()} • {(act.distance / 1000).toFixed(2)} km
                  </Text>
                </View>
              </View>
              <View style={styles.workoutMetrics}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Duration</Text>
                  <Text style={styles.metricValue}>{Math.round(act.duration / 60)} min</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Calories</Text>
                  <Text style={styles.metricValue}>{act.calories} kcal</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Pace</Text>
                  <Text style={styles.metricValue}>{act.averagePace} min/km</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderActivities = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.tabTitle}>Activities</Text>
      <View style={styles.activityList}>
        {recentActivities.map((act) => (
          <View key={act.id} style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={[styles.activityIcon, { backgroundColor: '#10b98115', borderColor: '#10b98133' }]}>
                <Target size={18} color="#10b981" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{act.title}</Text>
                <Text style={styles.activityMeta}>{new Date(act.startTime).toLocaleString()}</Text>
              </View>
            </View>
            <View style={styles.activityStats}>
              <View style={styles.activityStat}>
                <Text style={styles.activityStatValue}>{(act.distance / 1000).toFixed(2)}</Text>
                <Text style={styles.activityStatLabel}>km</Text>
              </View>
              <View style={styles.activityStat}>
                <Text style={styles.activityStatValue}>{Math.round(act.duration / 60)}</Text>
                <Text style={styles.activityStatLabel}>min</Text>
              </View>
              <View style={styles.activityStat}>
                <Text style={styles.activityStatValue}>{act.calories}</Text>
                <Text style={styles.activityStatLabel}>kcal</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Top navbar for You sub-pages */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onOpenSettings} style={styles.topNavButton}>
          <Settings size={22} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>You</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Sub-tabs */}
      <View style={styles.subTabRow}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setTab(t.id)}
            style={[styles.subTab, tab === t.id && styles.subTabActive]}
          >
            <Text style={[styles.subTabText, tab === t.id && styles.subTabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {tab === 'progress' && renderProgress()}
      {tab === 'workouts' && renderWorkouts()}
      {tab === 'activities' && renderActivities()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  topNavButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  subTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
  },
  subTabActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  subTabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  subTabTextActive: {
    color: '#090d16',
    fontWeight: '800',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  tabTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    marginTop: 8,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#090d16',
    fontSize: 32,
    fontWeight: '800',
  },
  name: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  email: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 8,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 14,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  saveBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  saveBtnText: {
    color: '#090d16',
    fontWeight: '700',
    fontSize: 14,
  },
  workoutList: {
    gap: 12,
    paddingBottom: 24,
  },
  workoutCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workoutIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  workoutMeta: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  workoutMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  metricBox: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  activityList: {
    gap: 12,
    paddingBottom: 24,
  },
  activityCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  activityMeta: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  activityStat: {
    alignItems: 'center',
  },
  activityStatValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  activityStatLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

/** @jsxRuntime classic */
/// <reference types="react-native" />
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { Zap, Footprints, Bike, Mountain, MapPin, Flame, Target, Play } from 'lucide-react-native';
import { useActivityStore } from '../store/useActivityStore';
import { useAuthStore } from '../store/useAuthStore';
import { WorkoutActivity } from '../types';

type ActivityType = 'RUNNING' | 'WALKING' | 'CYCLING' | 'HIKING';

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  RUNNING: <Zap size={20} color="#10b981" />,
  WALKING: <Footprints size={20} color="#06b6d4" />,
  CYCLING: <Bike size={20} color="#f97316" />,
  HIKING: <Mountain size={20} color="#a855f7" />,
};

const HealthRing: React.FC<{
  label: string;
  value: number;
  max: number;
  color: string;
  unit: string;
  size?: number;
}> = ({ label, value, max, color, unit, size = 100 }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }], position: 'absolute' }}>
          <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <Circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} />
        </Svg>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#ffffff' }}>{Math.round(value)}</Text>
          <Text style={{ fontSize: 9, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>{unit}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 10, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
};

export const DashboardScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { recentActivities, hydrateFromApi } = useActivityStore();
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    hydrateFromApi().finally(() => setIsHydrating(false));
  }, [hydrateFromApi]);

  const handleStart = (type: ActivityType): void => {
    const { setActivityType, startWorkout } = useActivityStore.getState();
    setActivityType(type);
    startWorkout();
  };

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Welcome to Stride</Text>
        <Text style={styles.emptySub}>Sign in to start tracking your fitness journey.</Text>
      </View>
    );
  }

  const totalDistanceMeters = recentActivities.reduce((acc, a) => acc + a.distance, 0);
  const totalCalories = recentActivities.reduce((acc, a) => acc + a.calories, 0);
  const totalSteps = recentActivities.reduce((acc, a) => acc + a.steps, 0);
  const totalDurationSecs = recentActivities.reduce((acc, a) => acc + a.duration, 0);
  const durationMins = Math.round(totalDurationSecs / 60);

  const moveTarget = 500;
  const exerciseTarget = 60;
  const standTarget = 10000;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user.fullName}</Text>
        <View style={styles.streakRow}>
          <Flame size={16} color="#f97316" />
          <Text style={styles.streak}>7-Day Active Workout Streak</Text>
        </View>
      </View>

      <View style={styles.ringsContainer}>
        <HealthRing label="Move" value={totalCalories} max={moveTarget} color="#f43f5e" unit="kcal" />
        <HealthRing label="Exercise" value={durationMins} max={exerciseTarget} color="#10b981" unit="mins" />
        <HealthRing label="Steps" value={totalSteps} max={standTarget} color="#06b6d4" unit="steps" />
      </View>

      <View style={styles.quickStartContainer}>
        <Text style={styles.sectionTitle}>Quick Start Activity</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.actButton, { backgroundColor: '#10b981' }]} onPress={() => handleStart('RUNNING')}>
            <Text style={styles.actButtonText}>Run</Text>
            <Zap size={16} color="#090d16" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actButton, { backgroundColor: '#06b6d4' }]} onPress={() => handleStart('WALKING')}>
            <Text style={styles.actButtonText}>Walk</Text>
            <Footprints size={16} color="#090d16" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actButton, { backgroundColor: '#f97316' }]} onPress={() => handleStart('CYCLING')}>
            <Text style={styles.actButtonText}>Ride</Text>
            <Bike size={16} color="#090d16" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actButton, { backgroundColor: '#a855f7' }]} onPress={() => handleStart('HIKING')}>
            <Text style={styles.actButtonText}>Hike</Text>
            <Mountain size={16} color="#090d16" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Flame size={20} color="#f97316" />
          <Text style={styles.statValue}>{Math.round(totalCalories)}</Text>
          <Text style={styles.statLabel}>kcal</Text>
        </View>
        <View style={styles.statCard}>
          <Target size={20} color="#10b981" />
          <Text style={styles.statValue}>{(totalDistanceMeters / 1000).toFixed(1)}</Text>
          <Text style={styles.statLabel}>km</Text>
        </View>
        <View style={styles.statCard}>
          <Footprints size={20} color="#06b6d4" />
          <Text style={styles.statValue}>{totalSteps.toLocaleString()}</Text>
          <Text style={styles.statLabel}>steps</Text>
        </View>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {isHydrating ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>Loading activities...</Text>
          </View>
        ) : recentActivities.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>No workouts yet. Start your first activity above!</Text>
          </View>
        ) : (
          recentActivities.slice(0, 5).map((act: WorkoutActivity) => (
            <View key={act.id} style={styles.workoutCard}>
              <View style={styles.workoutIconBox}>
                {ACTIVITY_ICONS[act.type as ActivityType] || <Zap size={20} color="#10b981" />}
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutTitle}>{act.title}</Text>
                <View style={styles.workoutMetaRow}>
                  <MapPin size={12} color="#64748b" />
                  <Text style={styles.workoutMeta}>
                    {(act.distance / 1000).toFixed(2)} km • {Math.round(act.duration / 60)} mins
                    {act.startLocation ? ` • ${act.startLocation}` : ''}
                  </Text>
                </View>
              </View>
              <Text style={styles.workoutCalories}>{act.calories} kcal</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  header: { marginBottom: 20 },
  greeting: { color: '#94a3b8', fontSize: 14 },
  userName: { color: '#ffffff', fontSize: 24, fontWeight: '800', marginTop: 2 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  streak: { color: '#f97316', fontSize: 13, fontWeight: '600' },
  ringsContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, marginBottom: 16 },
  quickStartContainer: { marginBottom: 24 },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  actButton: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginHorizontal: 3, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  actButtonText: { color: '#090d16', fontWeight: '700', fontSize: 13 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#111827', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#1f2937' },
  statValue: { color: '#ffffff', fontSize: 20, fontWeight: '900', marginTop: 8 },
  statLabel: { color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  recentSection: { marginBottom: 24 },
  workoutCard: { backgroundColor: '#111827', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1f2937', gap: 12 },
  workoutIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  workoutInfo: { flex: 1 },
  workoutTitle: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  workoutMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  workoutMeta: { color: '#94a3b8', fontSize: 12 },
  workoutCalories: { color: '#f97316', fontWeight: '700', fontSize: 13 },
  emptyCard: { backgroundColor: '#111827', borderRadius: 14, padding: 24, borderWidth: 1, borderColor: '#1f2937', alignItems: 'center' },
  emptyCardText: { color: '#64748b', fontSize: 13, textAlign: 'center' },
  emptyContainer: { flex: 1, backgroundColor: '#090d16', alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { color: '#ffffff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySub: { color: '#64748b', fontSize: 14, textAlign: 'center' },
});

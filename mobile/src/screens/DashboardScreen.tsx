import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { Zap, Footprints, Bike, Mountain, MapPin, Flame, Target, Play, Settings } from 'lucide-react-native';
import { useActivityStore } from '../store/useActivityStore';
import { useAuthStore } from '../store/useAuthStore';
import { backgroundStepService } from '../services/BackgroundStepService';
import { LoginScreen } from './LoginScreen';
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

export const DashboardScreen: React.FC<{ onOpenOnboarding?: () => void; onOpenSettings?: () => void; onStartActivity?: () => void }> = ({ onOpenOnboarding, onOpenSettings, onStartActivity }) => {
  const { user } = useAuthStore();
  const { recentActivities, hydrateFromApi } = useActivityStore();
  const [isHydrating, setIsHydrating] = useState(true);
  const [dailySteps, setDailySteps] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    hydrateFromApi().finally(() => setIsHydrating(false));
  }, [hydrateFromApi]);

  useEffect(() => {
    let mounted = true;

    const loadSteps = async () => {
      try {
        const steps = await backgroundStepService.getDailySteps();
        if (mounted) {
          setDailySteps(steps);
        }
      } catch {
        // ignore
      }
    };

    loadSteps();

    const unsubscribe = backgroundStepService.addListener((steps) => {
      if (mounted) {
        setDailySteps(steps);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleStart = (type: ActivityType): void => {
    const { setActivityType, startWorkout } = useActivityStore.getState();
    setActivityType(type);
    startWorkout();
    if (onStartActivity) onStartActivity();
  };

  if (!user) {
    return <LoginScreen />;
  }

  const totalDistanceMeters = recentActivities.reduce((acc, a) => acc + a.distance, 0);
  const today = new Date().toISOString().split('T')[0];
  const todayActivities = recentActivities.filter((a) => (a.startTime || '').startsWith(today));
  const todayCalories = todayActivities.reduce((acc, a) => acc + a.calories, 0);
  const todayDurationSecs = todayActivities.reduce((acc, a) => acc + a.duration, 0);
  const todayStepsFromActivities = todayActivities.reduce((acc, a) => acc + (a.steps || 0), 0);
  const totalSteps = dailySteps > 0 ? dailySteps : todayStepsFromActivities;
  const durationMins = Math.round(todayDurationSecs / 60);

  const moveTarget = 500;
  const exerciseTarget = 60;
  const standTarget = 10000;

  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#050505' : '#f6f7fb' }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: isDark ? '#4ade80' : '#94a3b8' }]}>Welcome back,</Text>
          <Text style={[styles.userName, { color: isDark ? '#f0fdf4' : '#0f172a' }]}>{user.fullName}</Text>
        </View>
        <TouchableOpacity style={[styles.settingsButton, { backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderColor: isDark ? '#16b98133' : '#e2e8f0' }]} onPress={() => onOpenSettings && onOpenSettings()}>
          <Settings size={22} color={isDark ? '#34d399' : '#10b981'} />
        </TouchableOpacity>
      </View>

      <View style={styles.ringsContainer}>
        <HealthRing label="Move" value={todayCalories} max={moveTarget} color={isDark ? '#fb7185' : '#f43f5e'} unit="kcal" />
        <HealthRing label="Exercise" value={durationMins} max={exerciseTarget} color={isDark ? '#34d399' : '#10b981'} unit="mins" />
        <HealthRing label="Steps" value={totalSteps} max={standTarget} color={isDark ? '#22d3ee' : '#06b6d4'} unit="steps" />
      </View>

      <View style={styles.quickStartContainer}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#f0fdf4' : '#0f172a' }]}>Quick Start Activity</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.actButton, { backgroundColor: isDark ? '#34d399' : '#10b981' }]} onPress={() => handleStart('RUNNING')}>
            <Text style={[styles.actButtonText, { color: isDark ? '#050505' : '#090d16' }]}>Run</Text>
            <Zap size={16} color={isDark ? '#050505' : '#090d16'} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actButton, { backgroundColor: isDark ? '#22d3ee' : '#06b6d4' }]} onPress={() => handleStart('WALKING')}>
            <Text style={[styles.actButtonText, { color: isDark ? '#050505' : '#090d16' }]}>Walk</Text>
            <Footprints size={16} color={isDark ? '#050505' : '#090d16'} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actButton, { backgroundColor: isDark ? '#fb923c' : '#f97316' }]} onPress={() => handleStart('CYCLING')}>
            <Text style={[styles.actButtonText, { color: isDark ? '#050505' : '#090d16' }]}>Ride</Text>
            <Bike size={16} color={isDark ? '#050505' : '#090d16'} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actButton, { backgroundColor: isDark ? '#c084fc' : '#a855f7' }]} onPress={() => handleStart('HIKING')}>
            <Text style={[styles.actButtonText, { color: isDark ? '#050505' : '#090d16' }]}>Hike</Text>
            <Mountain size={16} color={isDark ? '#050505' : '#090d16'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderColor: isDark ? '#16b98133' : '#e2e8f0' }]}>
          <Flame size={20} color={isDark ? '#fb923c' : '#f97316'} />
          <Text style={[styles.statValue, { color: isDark ? '#f0fdf4' : '#0f172a' }]}>{Math.round(totalCalories)}</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#4ade80' : '#94a3b8' }]}>kcal</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderColor: isDark ? '#16b98133' : '#e2e8f0' }]}>
          <Target size={20} color={isDark ? '#34d399' : '#10b981'} />
          <Text style={[styles.statValue, { color: isDark ? '#f0fdf4' : '#0f172a' }]}>{(totalDistanceMeters / 1000).toFixed(1)}</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#4ade80' : '#94a3b8' }]}>km</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderColor: isDark ? '#16b98133' : '#e2e8f0' }]}>
          <Footprints size={20} color={isDark ? '#22d3ee' : '#06b6d4'} />
          <Text style={[styles.statValue, { color: isDark ? '#f0fdf4' : '#0f172a' }]}>{totalSteps.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#4ade80' : '#94a3b8' }]}>steps</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderColor: isDark ? '#16b98133' : '#e2e8f0' }]}>
          <MapPin size={20} color={isDark ? '#c084fc' : '#a855f7'} />
          <Text style={[styles.statValue, { color: isDark ? '#f0fdf4' : '#0f172a' }]}>{recentActivities.length}</Text>
          <Text style={[styles.statLabel, { color: isDark ? '#4ade80' : '#94a3b8' }]}>workouts</Text>
        </View>
      </View>

      <View style={styles.recentSection}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#f0fdf4' : '#0f172a' }]}>Recent Workouts</Text>
        {isHydrating ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderColor: isDark ? '#16b98133' : '#e2e8f0' }]}>
            <Text style={[styles.emptyCardText, { color: isDark ? '#4ade80' : '#64748b' }]}>Loading activities...</Text>
          </View>
        ) : recentActivities.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderColor: isDark ? '#16b98133' : '#e2e8f0' }]}>
            <Text style={[styles.emptyCardText, { color: isDark ? '#4ade80' : '#64748b' }]}>No workouts yet. Start your first activity above!</Text>
          </View>
        ) : (
          recentActivities.slice(0, 5).map((act) => (
            <View key={act.id} style={[styles.workoutCard, { backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderColor: isDark ? '#16b98133' : '#e2e8f0' }]}>
              <View style={[styles.workoutIconBox, { backgroundColor: isDark ? '#050505' : '#f6f7fb', borderColor: isDark ? '#16b98133' : '#e2e8f0' }]}>
                {ACTIVITY_ICONS[act.type as ActivityType] || <Activity size={20} color={isDark ? '#4ade80' : '#64748b'} />}
              </View>
              <View style={styles.workoutInfo}>
                <Text style={[styles.workoutTitle, { color: isDark ? '#f0fdf4' : '#0f172a' }]}>{act.title}</Text>
                <Text style={[styles.workoutMeta, { color: isDark ? '#4ade80' : '#94a3b8' }]}>
                  {new Date(act.startTime).toLocaleDateString()} • {(act.distance / 1000).toFixed(2)} km
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.workoutCalories, { color: isDark ? '#fb923c' : '#f97316' }]}>{act.calories} kcal</Text>
                <Text style={[styles.workoutMeta, { color: isDark ? '#4ade80' : '#94a3b8' }]}>{Math.round(act.duration / 60)} min</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 14, fontWeight: '600' },
  userName: { fontSize: 26, fontWeight: '900', letterSpacing: -0.3 },
  settingsButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  ringsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 28, paddingVertical: 20 },
  quickStartContainer: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12, letterSpacing: -0.2 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  actButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 16, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  actButtonText: { fontWeight: '800', fontSize: 13 },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: { flex: 1, borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  statValue: { fontSize: 22, fontWeight: '900', marginTop: 8 },
  statLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  recentSection: { marginBottom: 24 },
  workoutCard: { borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  workoutIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  workoutInfo: { flex: 1 },
  workoutTitle: { fontWeight: '700', fontSize: 14 },
  workoutMeta: { fontSize: 12, marginTop: 3 },
  workoutCalories: { fontWeight: '700', fontSize: 13 },
  emptyCard: { borderRadius: 16, padding: 24, borderWidth: 1, alignItems: 'center' },
  emptyCardText: { fontSize: 13, textAlign: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center' },
});

import { Activity } from 'lucide-react-native';

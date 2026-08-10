import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useActivityStore } from '../store/useActivityStore';
import { useGoalStore } from '../store/useGoalStore';
import { Navigation, Flame, Footprints, Timer, TrendingUp, Target } from 'lucide-react-native';

export const StatsScreen: React.FC = () => {
  const { recentActivities } = useActivityStore();
  const { goals } = useGoalStore();

  const stats = useMemo(() => {
    const totalDist = recentActivities.reduce((acc, a) => acc + a.distance, 0) / 1000;
    const totalSteps = recentActivities.reduce((acc, a) => acc + a.steps, 0);
    const totalCals = recentActivities.reduce((acc, a) => acc + a.calories, 0);
    const totalDur = recentActivities.reduce((acc, a) => acc + a.duration, 0);
    const avgSpeed = totalDur > 0 ? totalDist / (totalDur / 3600) : 0;
    const avgPace = totalDist > 0 ? (totalDur / 60) / totalDist : 0;
    return { totalDist, totalSteps, totalCals, totalDur, avgSpeed, avgPace };
  }, [recentActivities]);

  if (recentActivities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <TrendingUp size={40} color="#475569" />
        <Text style={styles.emptyTitle}>No analytics yet</Text>
        <Text style={styles.emptySub}>Complete workouts to see your stats.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Fitness Analytics</Text>
      <Text style={styles.subtitle}>Performance breakdown</Text>

      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Navigation size={20} color="#10b981" />
          <Text style={styles.statValue}>{stats.totalDist.toFixed(1)}<Text style={styles.statUnit}> km</Text></Text>
          <Text style={styles.statLabel}>Total Distance</Text>
        </View>
        <View style={styles.statCard}>
          <Flame size={20} color="#f97316" />
          <Text style={styles.statValue}>{Math.round(stats.totalCals).toLocaleString()}<Text style={styles.statUnit}> kcal</Text></Text>
          <Text style={styles.statLabel}>Total Calories</Text>
        </View>
        <View style={styles.statCard}>
          <Footprints size={20} color="#06b6d4" />
          <Text style={styles.statValue}>{stats.totalSteps.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Steps</Text>
        </View>
        <View style={styles.statCard}>
          <Timer size={20} color="#a855f7" />
          <Text style={styles.statValue}>{Math.round(stats.totalDur / 60)}<Text style={styles.statUnit}> min</Text></Text>
          <Text style={styles.statLabel}>Active Time</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={20} color="#f59e0b" />
          <Text style={styles.statValue}>{stats.avgSpeed.toFixed(1)}<Text style={styles.statUnit}> km/h</Text></Text>
          <Text style={styles.statLabel}>Avg Speed</Text>
        </View>
        <View style={styles.statCard}>
          <Target size={20} color="#10b981" />
          <Text style={styles.statValue}>{stats.avgPace.toFixed(2)}<Text style={styles.statUnit}> min/km</Text></Text>
          <Text style={styles.statLabel}>Avg Pace</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Goals Progress</Text>
        {goals.slice(0, 3).map((g) => {
          const pct = Math.min(100, Math.round((g.currentProgress / g.targetValue) * 100));
          return (
            <View key={g.id} style={styles.goalRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.goalLabel}>{g.type.replace(/_/g, ' ')}</Text>
                <Text style={styles.goalValue}>{g.currentProgress.toLocaleString()} / {g.targetValue.toLocaleString()}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.goalPct}>{pct}%</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#94a3b8', fontSize: 13, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '47%', backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1f2937', marginBottom: 12 },
  statValue: { color: '#ffffff', fontSize: 20, fontWeight: '800', marginTop: 8 },
  statUnit: { color: '#64748b', fontSize: 12, fontWeight: '600' },
  statLabel: { color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  goalRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#1f2937' },
  goalLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  goalValue: { color: '#ffffff', fontSize: 14, fontWeight: '700', marginTop: 2 },
  progressTrack: { width: 80, height: 6, borderRadius: 3, backgroundColor: '#1e293b', marginHorizontal: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: '#10b981' },
  goalPct: { color: '#10b981', fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
  emptyContainer: { flex: 1, backgroundColor: '#090d16', alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  emptySub: { color: '#64748b', fontSize: 14 },
});

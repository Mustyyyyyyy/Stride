import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Trophy, Users, Flame, Target, CheckCircle2, Zap, Crown, Sun, Clock } from 'lucide-react-native';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  participants: number;
  userProgress: number;
  completed: boolean;
  reward: string;
  icon: string;
  color: string;
}

const DEMO_CHALLENGES: Challenge[] = [
  {
    id: 'ch_1',
    title: 'Weekly Warrior',
    description: 'Complete 5 workouts this week to earn the Warrior badge.',
    type: 'WEEKLY',
    targetValue: 5,
    unit: 'workouts',
    startDate: '2026-08-10',
    endDate: '2026-08-16',
    participants: 12450,
    userProgress: 2,
    completed: false,
    reward: 'Warrior Badge + 500 XP',
    icon: '💪',
    color: 'from-orange-500/10 to-red-500/10',
  },
  {
    id: 'ch_2',
    title: 'Distance Dynamo',
    description: 'Run or walk 50 km this week to unlock the Distance Dynamo badge.',
    type: 'WEEKLY',
    targetValue: 50000,
    unit: 'm',
    startDate: '2026-08-10',
    endDate: '2026-08-16',
    participants: 8920,
    userProgress: 28400,
    completed: false,
    reward: 'Dynamo Badge + 300 XP',
    icon: '🏃',
    color: 'from-cyan-500/10 to-blue-500/10',
  },
  {
    id: 'ch_3',
    title: 'Calorie Crusher',
    description: 'Burn 3000 kcal this week to prove your dedication.',
    type: 'WEEKLY',
    targetValue: 3000,
    unit: 'kcal',
    startDate: '2026-08-10',
    endDate: '2026-08-16',
    participants: 15600,
    userProgress: 1850,
    completed: false,
    reward: 'Crusher Badge + 400 XP',
    icon: '🔥',
    color: 'from-amber-500/10 to-orange-500/10',
  },
  {
    id: 'ch_4',
    title: 'Early Bird',
    description: 'Complete 3 morning workouts before 7 AM this week.',
    type: 'WEEKLY',
    targetValue: 3,
    unit: 'workouts',
    startDate: '2026-08-10',
    endDate: '2026-08-16',
    participants: 5400,
    userProgress: 1,
    completed: false,
    reward: 'Early Bird Badge + 200 XP',
    icon: '🌅',
    color: 'from-yellow-500/10 to-amber-500/10',
  },
];

export const ChallengesScreen: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setIsLoading(true);
    try {
      const data = await fetch('/api/challenges', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('stride_access_token')}`,
        },
      }).then((res) => res.json());
      setChallenges(Array.isArray(data) ? data : DEMO_CHALLENGES);
    } catch {
      setChallenges(DEMO_CHALLENGES);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChallenges = challenges.filter((ch) => {
    if (filter === 'active') return !ch.completed;
    if (filter === 'completed') return ch.completed;
    return true;
  });

  const completedCount = challenges.filter((c) => c.completed).length;

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getProgressPercent = (ch: Challenge) => {
    if (ch.targetValue === 0) return 0;
    return Math.min(100, Math.round((ch.userProgress / ch.targetValue) * 100));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Weekly Challenges</Text>
          <Text style={styles.subtitle}>Compete with the community and earn rewards</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Trophy size={14} color="#f59e0b" />
            <Text style={styles.statText}>{completedCount}/{challenges.length} Done</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'active', 'completed'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredChallenges.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Trophy size={40} color="#475569" />
          <Text style={styles.emptyTitle}>No challenges yet</Text>
          <Text style={styles.emptySub}>Complete your first workout to unlock challenges.</Text>
        </View>
      ) : (
        <View style={styles.challengeList}>
          {filteredChallenges.map((ch) => {
            const progress = getProgressPercent(ch);
            return (
              <View key={ch.id} style={[styles.challengeCard, ch.completed && styles.challengeCardCompleted]}>
                <View style={styles.challengeHeader}>
                  <View style={styles.challengeIconBox}>
                    <Text style={styles.challengeIcon}>{ch.icon}</Text>
                  </View>
                  <View style={styles.challengeInfo}>
                    <Text style={styles.challengeTitle}>{ch.title}</Text>
                    <Text style={styles.challengeDesc}>{ch.description}</Text>
                  </View>
                  {ch.completed && (
                    <View style={styles.completedBadge}>
                      <CheckCircle2 size={20} color="#10b981" />
                    </View>
                  )}
                </View>

                <View style={styles.challengeMeta}>
                  <View style={styles.metaItem}>
                    <Users size={12} color="#94a3b8" />
                    <Text style={styles.metaText}>{formatNumber(ch.participants)} competing</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Zap size={12} color="#f59e0b" />
                    <Text style={styles.metaText}>{ch.reward}</Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>
                      {ch.userProgress.toLocaleString()} / {ch.targetValue.toLocaleString()} {ch.unit}
                    </Text>
                    <Text style={[styles.progressPercent, ch.completed && styles.progressPercentDone]}>
                      {progress}%
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                </View>

                <View style={styles.challengeFooter}>
                  <Text style={styles.challengeEnd}>
                    Ends {new Date(ch.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </Text>
                  {ch.completed ? (
                    <View style={styles.statusBadgeCompleted}>
                      <Text style={styles.statusTextCompleted}>Completed</Text>
                    </View>
                  ) : (
                    <View style={styles.statusBadgeActive}>
                      <Text style={styles.statusTextActive}>In Progress</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  header: { marginBottom: 20 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  statBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#1f2937' },
  statText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937' },
  filterChipActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  filterText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#090d16', fontWeight: '700' },
  loadingContainer: { flex: 1, backgroundColor: '#090d16', alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { color: '#64748b', fontSize: 13, textAlign: 'center', marginTop: 8, paddingHorizontal: 24 },
  challengeList: { gap: 16, paddingBottom: 24 },
  challengeCard: { backgroundColor: '#111827', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#1f2937', gap: 12 },
  challengeCardCompleted: { borderColor: '#10b98133' },
  challengeHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  challengeIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  challengeIcon: { fontSize: 24 },
  challengeInfo: { flex: 1 },
  challengeTitle: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  challengeDesc: { color: '#94a3b8', fontSize: 12, marginTop: 2, lineHeight: 16 },
  completedBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#10b98115', alignItems: 'center', justifyContent: 'center' },
  challengeMeta: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 60 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  progressSection: { gap: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  progressPercent: { color: '#10b981', fontSize: 12, fontWeight: '700' },
  progressPercentDone: { color: '#10b981' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#1e293b', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#10b981' },
  challengeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1e293b' },
  challengeEnd: { color: '#64748b', fontSize: 11, fontWeight: '500' },
  statusBadgeCompleted: { backgroundColor: '#10b98115', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#10b98133' },
  statusTextCompleted: { color: '#10b981', fontSize: 10, fontWeight: '700' },
  statusBadgeActive: { backgroundColor: '#f9731615', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#f9731633' },
  statusTextActive: { color: '#f97316', fontSize: 10, fontWeight: '700' },
});

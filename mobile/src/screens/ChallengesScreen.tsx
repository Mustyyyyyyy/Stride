import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Trophy, Users, Flame, CheckCircle2, Lock, Zap } from 'lucide-react-native';

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

export const ChallengesScreen: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setIsLoading(true);
    try {
      const data = await fetch('http://localhost:3004/api/challenges', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('stride_access_token')}`,
        },
      }).then((res) => res.json());
      setChallenges(Array.isArray(data) ? data : []);
    } catch {
      setChallenges([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChallenges = challenges.filter((ch) => {
    if (filter === 'active') return !ch.completed;
    if (filter === 'completed') return ch.completed;
    return true;
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Weekly Challenges</Text>
      <Text style={styles.subtitle}>Compete and earn rewards</Text>

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

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading challenges...</Text>
        </View>
      ) : challenges.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Trophy size={48} color="#64748b" />
          <Text style={styles.emptyText}>No active challenges</Text>
          <Text style={styles.emptySub}>Complete your first workout to unlock challenges.</Text>
        </View>
      ) : (
        <View style={styles.challengeList}>
          {filteredChallenges.map((ch) => {
            const progressPercent = Math.min(100, Math.round((ch.userProgress / ch.targetValue) * 100));

            return (
              <View key={ch.id} style={[styles.card, ch.completed && styles.cardCompleted]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{ch.icon}</Text>
                  <View style={styles.cardTitleBlock}>
                    <Text style={styles.cardTitle}>{ch.title}</Text>
                    <Text style={styles.cardDesc}>{ch.description}</Text>
                  </View>
                  {ch.completed && <CheckCircle2 size={20} color="#10b981" />}
                </View>

                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardProgress}>
                    {ch.userProgress.toLocaleString()} / {ch.targetValue.toLocaleString()} {ch.unit}
                  </Text>
                  <Text style={styles.cardReward}>
                    <Zap size={12} color="#f59e0b" /> {ch.reward}
                  </Text>
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
  title: { color: '#ffffff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#94a3b8', fontSize: 13, marginBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937' },
  filterChipActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  filterText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#090d16', fontWeight: '700' },
  challengeList: { gap: 12, paddingBottom: 24 },
  card: { backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1f2937' },
  cardCompleted: { borderColor: '#10b98133' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  cardIcon: { fontSize: 28 },
  cardTitleBlock: { flex: 1 },
  cardTitle: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  cardDesc: { color: '#64748b', fontSize: 12, marginTop: 2 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#1e293b', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#f97316' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  cardProgress: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  cardReward: { color: '#f59e0b', fontSize: 11, fontWeight: '700' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { color: '#64748b', fontSize: 14, marginTop: 12, fontWeight: '600' },
  emptySub: { color: '#64748b', fontSize: 12, marginTop: 4, textAlign: 'center' },
});

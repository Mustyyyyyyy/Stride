import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useGoalStore } from '../store/useGoalStore';
import { Target, Plus, CheckCircle2, Lock, Trophy, Zap } from 'lucide-react-native';

type SubTab = 'goals' | 'challenges';

export const GoalsScreen: React.FC = () => {
  const { goals, achievements, addGoal } = useGoalStore();
  const [showModal, setShowModal] = useState(false);
  const [goalType, setGoalType] = useState('DAILY_STEPS');
  const [targetVal, setTargetVal] = useState('10000');
  const [subTab, setSubTab] = useState<SubTab>('goals');

  const handleSave = () => {
    addGoal({ type: goalType as any, targetValue: Number(targetVal) });
    setShowModal(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Goals & Challenges</Text>
          <Text style={styles.subtitle}>Set targets and compete with the community</Text>
        </View>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, subTab === 'goals' && styles.tabActive]}
          onPress={() => setSubTab('goals')}
        >
          <Target size={18} color={subTab === 'goals' ? '#10b981' : '#64748b'} />
          <Text style={[styles.tabText, subTab === 'goals' && styles.tabTextActive]}>Goals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, subTab === 'challenges' && styles.tabActive]}
          onPress={() => setSubTab('challenges')}
        >
          <Trophy size={18} color={subTab === 'challenges' ? '#f59e0b' : '#64748b'} />
          <Text style={[styles.tabText, subTab === 'challenges' && styles.tabTextActive]}>Challenges</Text>
        </TouchableOpacity>
      </View>

      {subTab === 'goals' ? (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Active Goals</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
              <Plus size={18} color="#090d16" />
              <Text style={styles.addBtnText}>New</Text>
            </TouchableOpacity>
          </View>

          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentProgress / g.targetValue) * 100));
            return (
              <View key={g.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Text style={styles.goalType}>{g.type.replace(/_/g, ' ')}</Text>
                  {g.completed ? (
                    <View style={styles.completedBadge}>
                      <CheckCircle2 size={14} color="#10b981" />
                      <Text style={styles.completedText}>Done</Text>
                    </View>
                  ) : (
                    <Text style={styles.goalPct}>{pct}%</Text>
                  )}
                </View>
                <Text style={styles.goalValue}>
                  {g.currentProgress.toLocaleString()} / <Text style={styles.goalTarget}>{g.targetValue.toLocaleString()}</Text>
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
              </View>
            );
          })}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Achievements</Text>
          <View style={styles.badgeGrid}>
            {achievements.map((ach) => (
              <View key={ach.id} style={[styles.badgeCard, ach.unlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
                <Text style={styles.badgeIcon}>{ach.icon}</Text>
                <Text style={styles.badgeName}>{ach.name}</Text>
                <Text style={styles.badgeDesc} numberOfLines={2}>{ach.description}</Text>
                {ach.unlocked ? (
                  <Text style={styles.badgeUnlockedText}>Unlocked</Text>
                ) : (
                  <View style={styles.lockedRow}>
                    <Lock size={12} color="#64748b" />
                    <Text style={styles.badgeLockedText}>Locked</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.comingSoon}>
          <Trophy size={40} color="#f59e0b" />
          <Text style={styles.comingSoonTitle}>Weekly Challenges</Text>
          <Text style={styles.comingSoonText}>
            Compete with the community. Complete workouts to unlock challenges and earn exclusive rewards.
          </Text>
          <View style={styles.challengePreview}>
            <View style={styles.previewCard}>
              <Text style={styles.previewIcon}>💪</Text>
              <Text style={styles.previewTitle}>Weekly Warrior</Text>
              <Text style={styles.previewDesc}>Complete 5 workouts this week</Text>
              <View style={styles.previewParticipants}>
                <Users size={14} color="#94a3b8" />
                <Text style={styles.previewCount}>12,450 competing</Text>
              </View>
            </View>
            <View style={styles.previewCard}>
              <Text style={styles.previewIcon}>🏃</Text>
              <Text style={styles.previewTitle}>Distance Dynamo</Text>
              <Text style={styles.previewDesc}>Run or walk 50 km this week</Text>
              <View style={styles.previewParticipants}>
                <Users size={14} color="#94a3b8" />
                <Text style={styles.previewCount}>8,920 competing</Text>
              </View>
            </View>
            <View style={styles.previewCard}>
              <Text style={styles.previewIcon}>🔥</Text>
              <Text style={styles.previewTitle}>Calorie Crusher</Text>
              <Text style={styles.previewDesc}>Burn 3000 kcal this week</Text>
              <View style={styles.previewParticipants}>
                <Users size={14} color="#94a3b8" />
                <Text style={styles.previewCount}>15,600 competing</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set New Goal</Text>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Goal Metric</Text>
              <View style={styles.typeRow}>
                {['DAILY_STEPS', 'DAILY_DISTANCE', 'WEEKLY_DISTANCE', 'CALORIES'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setGoalType(t)}
                    style={[styles.typeChip, goalType === t && styles.typeChipActive]}
                  >
                    <Text style={[styles.typeText, goalType === t && styles.typeTextActive]}>{t.replace(/_/g, ' ')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Target Value</Text>
              <TextInput
                style={styles.input}
                value={targetVal}
                onChangeText={setTargetVal}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSave}>
                <Text style={styles.saveText}>Create Goal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

import { TextInput } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1f2937' },
  tabActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  tabText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  tabTextActive: { color: '#090d16', fontWeight: '700' },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#10b981', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  addBtnText: { color: '#090d16', fontWeight: '700', fontSize: 12 },
  goalCard: { backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1f2937', marginBottom: 12 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  goalType: { color: '#94a3b8', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  goalPct: { color: '#10b981', fontSize: 12, fontWeight: '700' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completedText: { color: '#10b981', fontSize: 11, fontWeight: '700' },
  goalValue: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  goalTarget: { color: '#10b981', fontSize: 14 },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: '#1e293b', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#10b981' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeCard: { width: '47%', backgroundColor: '#111827', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#1f2937', marginBottom: 10, alignItems: 'center' },
  badgeUnlocked: { borderColor: '#10b98133' },
  badgeLocked: { opacity: 0.5 },
  badgeIcon: { fontSize: 32, marginBottom: 8 },
  badgeName: { color: '#ffffff', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  badgeDesc: { color: '#64748b', fontSize: 11, textAlign: 'center', marginTop: 4 },
  badgeUnlockedText: { color: '#10b981', fontSize: 10, fontWeight: '700', marginTop: 8 },
  lockedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  badgeLockedText: { color: '#64748b', fontSize: 10, fontWeight: '600' },
  comingSoon: { alignItems: 'center', paddingVertical: 40 },
  comingSoonTitle: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginTop: 16 },
  comingSoonText: { color: '#64748b', fontSize: 13, textAlign: 'center', marginTop: 8, paddingHorizontal: 24 },
  challengePreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 20, paddingHorizontal: 8 },
  previewCard: { width: '100%', backgroundColor: '#111827', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#1f2937', alignItems: 'center' },
  previewIcon: { fontSize: 32, marginBottom: 8 },
  previewTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  previewDesc: { color: '#64748b', fontSize: 11, textAlign: 'center', marginTop: 4 },
  previewParticipants: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  previewCount: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  modalOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(9,13,22,0.85)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#111827', borderRadius: 20, padding: 24, width: '100%', borderWidth: 1, borderColor: '#1e293b' },
  modalTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  formGroup: { marginBottom: 16 },
  formLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b' },
  typeChipActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  typeText: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  typeTextActive: { color: '#090d16', fontWeight: '700' },
  input: { backgroundColor: '#0f172a', borderRadius: 12, padding: 14, color: '#ffffff', fontSize: 14, borderWidth: 1, borderColor: '#1e293b' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#1e293b' },
  saveBtn: { backgroundColor: '#10b981' },
  cancelText: { color: '#94a3b8', fontWeight: '700', fontSize: 13 },
  saveText: { color: '#090d16', fontWeight: '700', fontSize: 13 },
});

import { Users } from 'lucide-react-native';

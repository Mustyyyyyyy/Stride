import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Zap, Footprints, Bike, Mountain, Trophy, Flame, ChevronRight } from 'lucide-react-native';

type OnboardingStep = {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

const STEPS: OnboardingStep[] = [
  {
    title: 'Track Your Workouts',
    description: 'Record running, walking, cycling, and hiking with GPS precision. View pace, distance, and elevation in real time.',
    icon: <Footprints size={36} color="#06b6d4" />,
    color: '#06b6d4',
  },
  {
    title: 'Earn Achievements',
    description: 'Unlock badges, complete weekly challenges, and compete with friends to stay motivated.',
    icon: <Trophy size={36} color="#f59e0b" />,
    color: '#f59e0b',
  },
  {
    title: 'Build Streaks',
    description: 'Maintain daily activity streaks and watch your fitness consistency grow over time.',
    icon: <Flame size={36} color="#f97316" />,
    color: '#f97316',
  },
  {
    title: 'Start Moving',
    description: 'Your personalized fitness dashboard is ready. Let\'s hit the road and crush your goals.',
    icon: <Zap size={36} color="#10b981" />,
    color: '#10b981',
  },
];

export const OnboardingScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [step, setStep] = useState(0);

  const isLast = step === STEPS.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#090d16" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.iconBox}>{STEPS[step].icon}</View>
        <Text style={styles.title}>{STEPS[step].title}</Text>
        <Text style={styles.description}>{STEPS[step].description}</Text>

        <View style={styles.dotsRow}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: STEPS[step].color }]}
          onPress={() => (isLast ? onFinish() : setStep((s) => s + 1))}
        >
          <Text style={styles.buttonText}>{isLast ? 'Get Started' : 'Next'}</Text>
          {!isLast && <ChevronRight size={18} color="#090d16" />}
        </TouchableOpacity>

        {!isLast && (
          <TouchableOpacity style={styles.skipButton} onPress={onFinish}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconBox: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { color: '#ffffff', fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  description: { color: '#94a3b8', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1f2937' },
  dotActive: { backgroundColor: '#10b981', width: 24 },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: { color: '#090d16', fontSize: 16, fontWeight: '700' },
  skipButton: { marginTop: 16 },
  skipText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
});

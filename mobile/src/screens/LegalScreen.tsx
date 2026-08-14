import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { FileText, ChevronRight, ExternalLink } from 'lucide-react-native';

type LegalTab = 'privacy' | 'terms' | 'licenses';

export const LegalScreen: React.FC = () => {
  const [tab, setTab] = useState<LegalTab>('privacy');

  const tabs: { id: LegalTab; label: string }[] = [
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'terms', label: 'Terms of Service' },
    { id: 'licenses', label: 'Licenses' },
  ];

  const openUrl = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <FileText size={32} color="#10b981" />
        <Text style={styles.title}>Legal</Text>
        <Text style={styles.subtitle}>Policies and licenses</Text>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setTab(t.id)}
            style={[styles.tab, tab === t.id && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {tab === 'privacy' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Privacy Policy</Text>
            <Text style={styles.cardText}>
              Stride takes your privacy seriously. We only collect data necessary to provide our fitness tracking services.
              Your location data is used solely for workout tracking and is never shared with third parties without your consent.
            </Text>
            <TouchableOpacity onPress={() => openUrl('https://stride-phi-one.vercel.app/legal/privacy')} style={styles.linkBtn}>
              <Text style={styles.linkBtnText}>Read Full Policy</Text>
              <ExternalLink size={16} color="#10b981" />
            </TouchableOpacity>
          </View>
        )}

        {tab === 'terms' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Terms of Service</Text>
            <Text style={styles.cardText}>
              By using Stride, you agree to these terms. Our services are provided as-is, and we continuously improve
              the app based on user feedback. Please use the app responsibly and follow local regulations when tracking workouts.
            </Text>
            <TouchableOpacity onPress={() => openUrl('https://stride-phi-one.vercel.app/legal/terms')} style={styles.linkBtn}>
              <Text style={styles.linkBtnText}>Read Full Terms</Text>
              <ExternalLink size={16} color="#10b981" />
            </TouchableOpacity>
          </View>
        )}

        {tab === 'licenses' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Open Source Licenses</Text>
            <Text style={styles.cardText}>
              Stride uses several open source libraries. We are grateful to the community for their contributions.
            </Text>
            <View style={styles.licenseList}>
              {['React Native', 'Expo', 'Zustand', 'Lucide Icons', 'React Navigation'].map((lib, idx) => (
                <View key={idx} style={styles.licenseItem}>
                  <Text style={styles.licenseName}>{lib}</Text>
                  <Text style={styles.licenseType}>MIT License</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1f2937',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#090d16',
    fontWeight: '800',
  },
  content: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 12,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  cardText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  linkBtnText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '700',
  },
  licenseList: {
    gap: 8,
    marginTop: 12,
  },
  licenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  licenseName: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  licenseType: {
    color: '#64748b',
    fontSize: 12,
  },
});

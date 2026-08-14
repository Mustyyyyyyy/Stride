import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { HelpCircle, MessageCircle, Mail, Phone, ChevronRight } from 'lucide-react-native';

export const SupportScreen: React.FC = () => {
  const supportOptions = [
    {
      icon: <MessageCircle size={20} color="#10b981" />,
      title: 'Chat Support',
      desc: 'Chat with our support team',
      action: () => Linking.openURL('https://stride-phi-one.vercel.app/support/chat'),
    },
    {
      icon: <Mail size={20} color="#06b6d4" />,
      title: 'Email Us',
      desc: 'support@stride.app',
      action: () => Linking.openURL('mailto:support@stride.app'),
    },
    {
      icon: <Phone size={20} color="#f59e0b" />,
      title: 'Call Us',
      desc: '+1 (555) 123-4567',
      action: () => Linking.openURL('tel:+15551234567'),
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <HelpCircle size={32} color="#10b981" />
        <Text style={styles.title}>Support</Text>
        <Text style={styles.subtitle}>We\'re here to help</Text>
      </View>

      <View style={styles.section}>
        {supportOptions.map((option, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={option.action}
            style={[styles.optionCard, idx > 0 && { marginTop: 12 }]}
          >
            <View style={styles.optionIcon}>{option.icon}</View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDesc}>{option.desc}</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Response time: usually within 24 hours</Text>
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
  section: {
    marginBottom: 24,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  optionDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    color: '#64748b',
    fontSize: 12,
  },
});

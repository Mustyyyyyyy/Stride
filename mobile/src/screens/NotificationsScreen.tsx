import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Bell, CheckCircle, Clock, Info, AlertTriangle, X, Trophy, Flame } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export const NotificationsScreen: React.FC = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'WORKOUT_COMPLETE':
        return <CheckCircle size={20} color="#10b981" />;
      case 'GOAL_ACHIEVED':
        return <Trophy size={20} color="#f59e0b" />;
      case 'STREAK':
        return <Flame size={20} color="#f97316" />;
      case 'ERROR':
        return <AlertTriangle size={20} color="#ef4444" />;
      default:
        return <Info size={20} color="#3b82f6" />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {notifications.some((n) => !n.read) && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={48} color="#64748b" />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        notifications.map((notif) => (
          <TouchableOpacity
            key={notif.id}
            style={[styles.notifCard, notif.read && styles.notifCardRead]}
            onPress={() => handleMarkRead(notif.id)}
          >
            <View style={styles.notifIcon}>
              {getIcon(notif.type)}
            </View>
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, notif.read && styles.notifTitleRead]}>
                {notif.title}
              </Text>
              <Text style={styles.notifBody}>{notif.body}</Text>
              <Text style={styles.notifTime}>
                {new Date(notif.createdAt).toLocaleString()}
              </Text>
            </View>
            {!notif.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#ffffff', fontSize: 24, fontWeight: '800' },
  markAllText: { color: '#10b981', fontSize: 13, fontWeight: '600' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { color: '#64748b', fontSize: 14, marginTop: 12 },
  notifCard: { flexDirection: 'row', backgroundColor: '#111827', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1f2937', position: 'relative' },
  notifCardRead: { opacity: 0.6 },
  notifIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1, marginLeft: 12 },
  notifTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  notifTitleRead: { color: '#94a3b8' },
  notifBody: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  notifTime: { color: '#64748b', fontSize: 11, marginTop: 6 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981', position: 'absolute', top: 14, right: 14 },
});
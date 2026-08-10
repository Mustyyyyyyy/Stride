import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Heart, MessageCircle, Share2, Navigation, Clock, Flame, Zap, Footprints, Bike, Mountain, Bookmark } from 'lucide-react-native';

interface FeedItem {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  activity: {
    type: string;
    title: string;
    distance: number;
    duration: number;
    calories: number;
    pace: number;
    steps: number;
    startTime: string;
  };
  likes: number;
  liked: boolean;
  comments: number;
  bookmarked: boolean;
}

const DEMO_FEED: FeedItem[] = [
  {
    id: 'feed_1',
    user: { name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    activity: {
      type: 'RUNNING',
      title: 'Morning Golden Gate Run',
      distance: 8540,
      duration: 3420,
      calories: 620,
      pace: 4.2,
      steps: 11200,
      startTime: '2026-08-09T06:30:00Z',
    },
    likes: 24,
    liked: false,
    comments: 3,
    bookmarked: false,
  },
  {
    id: 'feed_2',
    user: { name: 'Marcus Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
    activity: {
      type: 'CYCLING',
      title: 'Weekend Century Ride',
      distance: 102500,
      duration: 12600,
      calories: 1850,
      pace: 0,
      steps: 0,
      startTime: '2026-08-08T08:00:00Z',
    },
    likes: 47,
    liked: true,
    comments: 8,
    bookmarked: true,
  },
  {
    id: 'feed_3',
    user: { name: 'Aisha Patel', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
    activity: {
      type: 'HIKING',
      title: 'Muir Woods Trail Adventure',
      distance: 12500,
      duration: 7200,
      calories: 980,
      pace: 9.6,
      steps: 18500,
      startTime: '2026-08-07T10:15:00Z',
    },
    likes: 31,
    liked: false,
    comments: 5,
    bookmarked: false,
  },
];

export const FeedScreen: React.FC = () => {
  const [feed, setFeed] = useState<FeedItem[]>(DEMO_FEED);
  const unitSystem = 'METRIC';

  const toggleLike = (id: string) => {
    setFeed((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              liked: !item.liked,
              likes: item.liked ? item.likes - 1 : item.likes + 1,
            }
          : item,
      ),
    );
  };

  const toggleBookmark = (id: string) => {
    setFeed((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item,
      ),
    );
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} min`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'RUNNING':
        return <Zap size={22} color="#10b981" />;
      case 'WALKING':
        return <Footprints size={22} color="#06b6d4" />;
      case 'CYCLING':
        return <Bike size={22} color="#f97316" />;
      case 'HIKING':
        return <Mountain size={22} color="#a855f7" />;
      default:
        return null;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'RUNNING':
        return '#10b981';
      case 'WALKING':
        return '#06b6d4';
      case 'CYCLING':
        return '#f97316';
      case 'HIKING':
        return '#a855f7';
      default:
        return '#64748b';
    }
  };

  const distKm = (m: number) => (m / 1000).toFixed(1);
  const distMiles = (m: number) => (m / 1609.34).toFixed(2);
  const displayDist = (m: number) => unitSystem === 'IMPERIAL' ? distMiles(m) : distKm(m);
  const distUnit = unitSystem === 'IMPERIAL' ? 'mi' : 'km';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Activity Feed</Text>
      <Text style={styles.subtitle}>See what the community is up to</Text>

      <View style={styles.feedList}>
        {feed.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.user.name}</Text>
                <Text style={styles.timestamp}>
                  {new Date(item.activity.startTime).toLocaleString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.activityHeader}>
              <View style={[styles.activityIcon, { backgroundColor: getActivityColor(item.activity.type) + '20', borderColor: getActivityColor(item.activity.type) + '40' }]}>
                {getActivityIcon(item.activity.type)}
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{item.activity.title}</Text>
                <Text style={[styles.activityType, { color: getActivityColor(item.activity.type) }]}>
                  {item.activity.type}
                </Text>
              </View>
            </View>

            <View style={styles.metricsGrid}>
              <View style={styles.metricBox}>
                <Navigation size={16} color="#06b6d4" />
                <Text style={styles.metricValue}>{displayDist(item.activity.distance)}</Text>
                <Text style={styles.metricLabel}>{distUnit}</Text>
              </View>
              <View style={styles.metricBox}>
                <Clock size={16} color="#10b981" />
                <Text style={styles.metricValue}>{formatDuration(item.activity.duration)}</Text>
                <Text style={styles.metricLabel}>Time</Text>
              </View>
              <View style={styles.metricBox}>
                <Flame size={16} color="#f97316" />
                <Text style={styles.metricValue}>{item.activity.calories}</Text>
                <Text style={styles.metricLabel}>kcal</Text>
              </View>
              {item.activity.steps > 0 && (
                <View style={styles.metricBox}>
                  <Footprints size={16} color="#a855f7" />
                  <Text style={styles.metricValue}>{item.activity.steps.toLocaleString()}</Text>
                  <Text style={styles.metricLabel}>steps</Text>
                </View>
              )}
            </View>

            <View style={styles.actionRow}>
              <View style={styles.actionGroup}>
                <TouchableOpacity
                  style={[styles.actionBtn, item.liked && styles.likedBtn]}
                  onPress={() => toggleLike(item.id)}
                >
                  <Heart size={18} color={item.liked ? '#f43f5e' : '#94a3b8'} fill={item.liked ? '#f43f5e' : 'none'} />
                  <Text style={[styles.actionText, item.liked && styles.likedText]}>{item.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <MessageCircle size={18} color="#94a3b8" />
                  <Text style={styles.actionText}>{item.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Share2 size={18} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.actionBtn, item.bookmarked && styles.bookmarkedBtn]}
                onPress={() => toggleBookmark(item.id)}
              >
                <Bookmark size={18} color={item.bookmarked ? '#f59e0b' : '#94a3b8'} fill={item.bookmarked ? '#f59e0b' : 'none'} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#94a3b8', fontSize: 13, marginBottom: 20 },
  feedList: { gap: 16, paddingBottom: 24 },
  card: { backgroundColor: '#111827', borderRadius: 20, borderWidth: 1, borderColor: '#1f2937', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 12 },
  userInfo: { flex: 1 },
  userName: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  timestamp: { color: '#64748b', fontSize: 11, marginTop: 2 },
  activityHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12, marginBottom: 12 },
  activityIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  activityInfo: { flex: 1 },
  activityTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  activityType: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  metricsGrid: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  metricBox: { flex: 1, backgroundColor: '#0f172a', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  metricValue: { color: '#ffffff', fontSize: 14, fontWeight: '800', marginTop: 4 },
  metricLabel: { color: '#64748b', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#1e293b', marginTop: 12 },
  actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  likedBtn: { backgroundColor: '#f43f5e15' },
  likedText: { color: '#f43f5e' },
  bookmarkedBtn: { backgroundColor: '#f59e0b15' },
});

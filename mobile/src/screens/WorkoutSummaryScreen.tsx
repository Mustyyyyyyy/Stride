import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert, Platform } from 'react-native';
import { Svg, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
  Zap, Footprints, Bike, Mountain, Flame, Navigation, Gauge, Timer,
  MapPin, Share2, Trash2, Check, X
} from 'lucide-react-native';
import ViewShot from 'react-native-view-shot';
import { WorkoutActivity } from '../types';
import { useActivityStore } from '../store/useActivityStore';
import { useAuthStore } from '../store/useAuthStore';

type ActivityType = 'RUNNING' | 'WALKING' | 'CYCLING' | 'HIKING';

const ACTIVITY_META: Record<ActivityType, { icon: React.ReactNode; color: string; label: string }> = {
  RUNNING: { icon: <Zap size={28} color="#10b981" />, color: '#10b981', label: 'Running' },
  WALKING: { icon: <Footprints size={28} color="#06b6d4" />, color: '#06b6d4', label: 'Walking' },
  CYCLING: { icon: <Bike size={28} color="#f97316" />, color: '#f97316', label: 'Cycling' },
  HIKING: { icon: <Mountain size={28} color="#a855f7" />, color: '#a855f7', label: 'Hiking' },
};

function buildRoutePath(points: any[] = [], width: number = 340, height: number = 160): string | null {
  if (!points || points.length < 2) return null;

  const lats = points.map((p) => p.latitude);
  const lons = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const latRange = maxLat - minLat || 0.001;
  const lonRange = maxLon - minLon || 0.001;
  const padding = 16;

  const toX = (lon: number) => padding + ((lon - minLon) / lonRange) * (width - padding * 2);
  const toY = (lat: number) => padding + ((maxLat - lat) / latRange) * (height - padding * 2);

  const step = Math.max(1, Math.floor(points.length / 80));
  const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1);

  return sampled.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.longitude)} ${toY(p.latitude)}`).join(' ');
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h ${m}m ${s}s`;
  }
  return `${m}m ${s}s`;
}

function formatDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export const WorkoutSummaryScreen: React.FC<{
  workout?: WorkoutActivity | null;
  onDone: () => void;
  onShare?: (workout: WorkoutActivity) => void;
  onDiscard?: (workout: WorkoutActivity) => void;
}> = ({ workout: propWorkout, onDone, onShare, onDiscard }) => {
  const storeWorkout = useActivityStore((s) => s.lastCompletedWorkout);
  const clearLastCompleted = useActivityStore((s) => s.clearLastCompletedWorkout);
  const user = useAuthStore((s) => s.user);
  const [isCapturing, setIsCapturing] = useState(false);
  const shareCardRef = React.useRef<any>(null);

  const workout = propWorkout || storeWorkout;

  if (!workout) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Workout Data</Text>
        <Text style={styles.emptySub}>Finish a workout to see your summary here.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={onDone}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const meta = ACTIVITY_META[workout.type] || ACTIVITY_META['RUNNING'];
  const startInfo = formatDateTime(workout.startTime);
  const endInfo = formatDateTime(workout.endTime);
  const durationSecs = Math.round((new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / 1000);
  const distKm = (workout.distance / 1000).toFixed(2);
  const pace = workout.distance > 0 && workout.duration > 0 ? ((workout.duration / 60) / (workout.distance / 1000)).toFixed(2) : '0.00';
  const avgSpeedKmh = workout.duration > 0 ? ((workout.distance / 1000) / (workout.duration / 3600)).toFixed(1) : '0.0';
  const routePath = buildRoutePath(workout.gpsPoints);
  const gpsPointsCount = workout.gpsPoints?.length || 0;

  const startLocation = workout.gpsPoints?.[0];
  const endLocation = workout.gpsPoints?.[workout.gpsPoints.length - 1];

  // Pre-compute bounds for SVG markers
  const routeBounds = React.useMemo(() => {
    if (!workout.gpsPoints || workout.gpsPoints.length === 0) return null;
    const lats = workout.gpsPoints.map((p) => p.latitude);
    const lons = workout.gpsPoints.map((p) => p.longitude);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
    };
  }, [workout.gpsPoints]);

  const svgX = (lon: number, width = 340) => {
    if (!routeBounds) return 20;
    const padding = 16;
    const lonRange = routeBounds.maxLon - routeBounds.minLon || 0.001;
    return padding + ((lon - routeBounds.minLon) / lonRange) * (width - padding * 2);
  };
  const svgY = (lat: number, height = 160) => {
    if (!routeBounds) return 140;
    const padding = 16;
    const latRange = routeBounds.maxLat - routeBounds.minLat || 0.001;
    return padding + ((routeBounds.maxLat - lat) / latRange) * (height - padding * 2);
  };

  const handleShare = async () => {
    if (shareCardRef.current?.capture) {
      try {
        setIsCapturing(true);
        const uri = await shareCardRef.current.capture({ format: 'png', quality: 0.95, result: 'tmpfile' });
        if (uri) {
          const RNShare = require('react-native-share').default;
          const shareUrl = Platform.select({ ios: uri, android: 'file://' + uri });
          await RNShare.open({
            url: shareUrl,
            type: 'image/png',
            title: 'My Stride workout',
            subject: 'My Stride workout',
          });
          return;
        }
      } catch {
        // fallback to text share
      } finally {
        setIsCapturing(false);
      }
    }

    // Fallback text share
    const msg = [
      `${workout.title || 'Workout'} 🏃`,
      `📅 ${startInfo.date}`,
      `🕐 ${startInfo.time} → ${endInfo.time}`,
      `📏 ${distKm} km`,
      `⏱ ${formatDuration(workout.duration)}`,
      `⚡ ${pace} min/km`,
      `🔥 ${Math.round(workout.calories)} kcal`,
      `👟 ${(workout.steps || 0).toLocaleString()} steps`,
      `📍 ${gpsPointsCount} GPS points`,
      ``,
      `Proudly tracked with Stride`,
      `https://stride-six-sepia.vercel.app/`,
    ].join('\n');
    await Share.share({ message: msg, title: 'My Stride workout' } as any);
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Workout?',
      'This will permanently delete this workout from your history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            if (onDiscard) onDiscard(workout);
            clearLastCompleted();
            onDone();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { backgroundColor: meta.color + '20', borderColor: meta.color + '40' }]}>
              {meta.icon}
            </View>
            <View>
              <Text style={styles.title}>{workout.title || `${meta.label} Workout`}</Text>
              <Text style={styles.subtitle}>{startInfo.date} • {startInfo.time}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onDone}>
            <X size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Route Map */}
        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <Navigation size={16} color="#10b981" />
            <Text style={styles.mapTitle}>Route Map</Text>
            {gpsPointsCount > 0 && (
              <Text style={styles.mapBadge}>{gpsPointsCount} points</Text>
            )}
          </View>
          <View style={styles.mapBox}>
            {routePath ? (
              <Svg width="100%" height="100%" viewBox="0 0 340 160">
                <Defs>
                  <LinearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor={meta.color} stopOpacity="0.9" />
                    <Stop offset="1" stopColor={meta.color} stopOpacity="0.3" />
                  </LinearGradient>
                </Defs>
                <Path d={routePath} fill="none" stroke="url(#routeGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                {startLocation && (
                  <Circle cx={svgX(startLocation.longitude)} cy={svgY(startLocation.latitude)} r="6" fill={meta.color} />
                )}
                {endLocation && (
                  <Circle cx={svgX(endLocation.longitude)} cy={svgY(endLocation.latitude)} r="6" fill="#ef4444" />
                )}
              </Svg>
            ) : (
              <View style={styles.noRouteBox}>
                <MapPin size={24} color="#64748b" />
                <Text style={styles.noRouteText}>
                  {gpsPointsCount > 0 ? `${gpsPointsCount} GPS points recorded` : 'No route data available'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Time Details */}
        <View style={styles.timeCard}>
          <View style={styles.timeRow}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>STARTED</Text>
              <Text style={styles.timeValue}>{startInfo.date}</Text>
              <Text style={styles.timeValue}>{startInfo.time}</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>FINISHED</Text>
              <Text style={styles.timeValue}>{endInfo.date}</Text>
              <Text style={styles.timeValue}>{endInfo.time}</Text>
            </View>
          </View>
          <View style={styles.durationRow}>
            <Timer size={16} color="#f59e0b" />
            <Text style={styles.durationLabel}>DURATION</Text>
            <Text style={styles.durationValue}>{formatDuration(durationSecs > 0 ? durationSecs : workout.duration)}</Text>
          </View>
        </View>

        {/* Primary Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Navigation size={18} color="#06b6d4" />
            <Text style={styles.metricValue}>{distKm}</Text>
            <Text style={styles.metricLabel}>km</Text>
          </View>
          <View style={styles.metricCard}>
            <Gauge size={18} color="#f97316" />
            <Text style={styles.metricValue}>{avgSpeedKmh}</Text>
            <Text style={styles.metricLabel}>km/h avg</Text>
          </View>
          <View style={styles.metricCard}>
            <Timer size={18} color="#10b981" />
            <Text style={styles.metricValue}>{pace}</Text>
            <Text style={styles.metricLabel}>min/km</Text>
          </View>
          <View style={styles.metricCard}>
            <Flame size={18} color="#ef4444" />
            <Text style={styles.metricValue}>{Math.round(workout.calories)}</Text>
            <Text style={styles.metricLabel}>kcal</Text>
          </View>
        </View>

        {/* Secondary Stats */}
        <View style={styles.secondaryGrid}>
          <View style={styles.secondaryCard}>
            <Footprints size={16} color="#06b6d4" />
            <Text style={styles.secondaryValue}>{(workout.steps || 0).toLocaleString()}</Text>
            <Text style={styles.secondaryLabel}>steps</Text>
          </View>
          <View style={styles.secondaryCard}>
            <Gauge size={16} color="#f97316" />
            <Text style={styles.secondaryValue}>{workout.maxSpeed.toFixed(1)}</Text>
            <Text style={styles.secondaryLabel}>max km/h</Text>
          </View>
          <View style={styles.secondaryCard}>
            <Navigation size={16} color="#a855f7" />
            <Text style={styles.secondaryValue}>{gpsPointsCount}</Text>
            <Text style={styles.secondaryLabel}>GPS points</Text>
          </View>
        </View>

        {/* Location Info */}
        {(startLocation || endLocation) && (
          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>LOCATION DETAILS</Text>
            {startLocation && (
              <View style={styles.locationRow}>
                <View style={[styles.locationDot, { backgroundColor: '#10b981' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationLabel}>Start</Text>
                  <Text style={styles.locationCoords}>
                    {startLocation.latitude.toFixed(5)}, {startLocation.longitude.toFixed(5)}
                  </Text>
                  {startLocation.altitude && (
                    <Text style={styles.locationAlt}>Altitude: {Math.round(startLocation.altitude)}m</Text>
                  )}
                </View>
              </View>
            )}
            {endLocation && (
              <View style={styles.locationRow}>
                <View style={[styles.locationDot, { backgroundColor: '#ef4444' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationLabel}>End</Text>
                  <Text style={styles.locationCoords}>
                    {endLocation.latitude.toFixed(5)}, {endLocation.longitude.toFixed(5)}
                  </Text>
                  {endLocation.altitude && (
                    <Text style={styles.locationAlt}>Altitude: {Math.round(endLocation.altitude)}m</Text>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Hidden share card */}
        <View style={{ position: 'absolute', left: -2000, top: -2000 }}>
          <ViewShot ref={shareCardRef} options={{ format: 'png', quality: 0.95 }} style={{ width: 900, height: 520 }}>
            <View style={{ width: 900, height: 520, backgroundColor: '#090d16', padding: 28, borderRadius: 20, borderWidth: 1, borderColor: '#0f172a' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 20 }}>⚡</Text>
                  </View>
                  <Text style={{ color: '#10b981', fontSize: 32, fontWeight: '900', letterSpacing: 1 }}>STRIDE</Text>
                </View>
                <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '700' }}>Run. Walk. Thrive.</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18, marginBottom: 12 }}>
                <View style={[styles.activityIconBox, { borderColor: meta.color + '40', backgroundColor: meta.color + '15', width: 56, height: 56, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }]}>
                  {meta.icon}
                </View>
                <View>
                  <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '900', marginBottom: 2 }}>{workout.title || `${meta.label} Workout`}</Text>
                  <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>{startInfo.date} • {startInfo.time}</Text>
                </View>
              </View>
              {routePath ? (
                <View style={{ height: 180, backgroundColor: '#0f172a', borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden', marginBottom: 16 }}>
                  <Svg width="100%" height="100%" viewBox="0 0 900 180">
                    <Defs>
                      <LinearGradient id="routeGrad2" x1="0" y1="0" x2="1" y2="0">
                        <Stop offset="0" stopColor={meta.color} stopOpacity="0.8" />
                        <Stop offset="1" stopColor={meta.color} stopOpacity="0.3" />
                      </LinearGradient>
                    </Defs>
                    <Path d={routePath.replace(/340/g, '900').replace(/160/g, '180')} fill="none" stroke="url(#routeGrad2)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
              ) : (
                <View style={{ height: 180, backgroundColor: '#0f172a', borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginBottom: 16, flexDirection: 'row', gap: 8 }}>
                  <Navigation size={20} color="#64748b" />
                  <Text style={{ color: '#64748b', fontSize: 13, fontWeight: '600' }}>{gpsPointsCount > 0 ? `${gpsPointsCount} GPS points` : 'No route data'}</Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                {[
                  { value: distKm, label: 'km' },
                  { value: Math.round(workout.duration / 60), label: 'min' },
                  { value: pace, label: 'min/km' },
                  { value: Math.round(workout.calories), label: 'kcal' },
                  { value: (workout.steps || 0).toLocaleString(), label: 'steps' },
                ].map((m, i) => (
                  <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '800' }}>{m.value}</Text>
                    <Text style={{ color: '#94a3b8', fontSize: 10, marginTop: 6, fontWeight: '600', textTransform: 'uppercase' }}>{m.label}</Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTopWidth: 1, borderTopColor: '#1e293b' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#090d16', fontWeight: '900', fontSize: 14 }}>{(user?.fullName || 'U').charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '700' }}>{user?.fullName || 'Stride User'}</Text>
                </View>
                <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600' }}>https://stride-six-sepia.vercel.app/</Text>
              </View>
            </View>
          </ViewShot>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.discardBtn} onPress={handleDiscard}>
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} disabled={isCapturing}>
          <Share2 size={18} color="#090d16" />
          <Text style={styles.shareBtnText}>{isCapturing ? 'CAPTURING...' : 'SHARE'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneBtn} onPress={() => { clearLastCompleted(); onDone(); }}>
          <Check size={18} color="#090d16" />
          <Text style={styles.doneBtnText}>DONE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  emptyContainer: { flex: 1, backgroundColor: '#090d16', alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { color: '#ffffff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  emptySub: { color: '#64748b', fontSize: 14, textAlign: 'center', marginBottom: 20 },
  backBtn: { backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: '#090d16', fontWeight: '700', fontSize: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingBottom: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#ffffff', fontSize: 20, fontWeight: '800' },
  subtitle: { color: '#94a3b8', fontSize: 13, fontWeight: '600', marginTop: 2 },
  closeBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
  mapContainer: { paddingHorizontal: 16, marginBottom: 16 },
  mapHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  mapTitle: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  mapBadge: { marginLeft: 'auto', backgroundColor: 'rgba(16,185,129,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#10b98133' },
  mapBadgeText: { color: '#10b981', fontSize: 10, fontWeight: '700' },
  mapBox: { height: 180, backgroundColor: '#0f172a', borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden' },
  noRouteBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, flexDirection: 'row' },
  noRouteText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  timeCard: { backgroundColor: '#111827', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1f2937' },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  timeBlock: { flex: 1, alignItems: 'center' },
  timeLabel: { color: '#64748b', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginBottom: 6 },
  timeValue: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  timeDivider: { width: 1, height: 40, backgroundColor: '#1e293b', marginHorizontal: 16 },
  durationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1e293b' },
  durationLabel: { color: '#64748b', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  durationValue: { color: '#f59e0b', fontSize: 14, fontWeight: '800' },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  metricCard: { width: '48%', backgroundColor: '#111827', borderRadius: 14, padding: 14, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#1f2937' },
  metricValue: { color: '#ffffff', fontSize: 22, fontWeight: '800', marginTop: 8 },
  metricLabel: { color: '#64748b', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  secondaryGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16 },
  secondaryCard: { flex: 1, backgroundColor: '#111827', borderRadius: 12, padding: 12, marginHorizontal: 3, alignItems: 'center', borderWidth: 1, borderColor: '#1f2937' },
  secondaryValue: { color: '#ffffff', fontSize: 14, fontWeight: '700', marginTop: 4 },
  secondaryLabel: { color: '#64748b', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  locationCard: { backgroundColor: '#111827', borderRadius: 16, padding: 16, marginHorizontal: 16, marginBottom: 100, borderWidth: 1, borderColor: '#1f2937' },
  locationTitle: { color: '#64748b', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', marginBottom: 12 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  locationDot: { width: 10, height: 10, borderRadius: 5 },
  locationLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  locationCoords: { color: '#ffffff', fontSize: 13, fontWeight: '700', marginTop: 2 },
  locationAlt: { color: '#64748b', fontSize: 11, marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 24, backgroundColor: '#090d16', borderTopWidth: 1, borderTopColor: '#1e2937', position: 'absolute', bottom: 0, left: 0, right: 0 },
  discardBtn: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#ef444433', alignItems: 'center', justifyContent: 'center' },
  shareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, backgroundColor: '#06b6d4' },
  shareBtnText: { color: '#090d16', fontWeight: '700', fontSize: 14 },
  doneBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, backgroundColor: '#10b981' },
  doneBtnText: { color: '#090d16', fontWeight: '700', fontSize: 14 },
  activityIconBox: { alignItems: 'center', justifyContent: 'center' },
});


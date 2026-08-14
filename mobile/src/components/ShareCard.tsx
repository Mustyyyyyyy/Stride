import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Svg, Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Zap, Footprints, Bike, Mountain, Flame, Navigation, Gauge, Timer } from 'lucide-react-native';
import { WorkoutActivity } from '../types';

interface Props {
  workout: WorkoutActivity;
  userName?: string;
}

const ACTIVITY_META: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  RUNNING: { icon: <Zap size={28} color="#10b981" />, color: '#10b981', label: 'Running' },
  WALKING: { icon: <Footprints size={28} color="#06b6d4" />, color: '#06b6d4', label: 'Walking' },
  CYCLING: { icon: <Bike size={28} color="#f97316" />, color: '#f97316', label: 'Cycling' },
  HIKING: { icon: <Mountain size={28} color="#a855f7" />, color: '#a855f7', label: 'Hiking' },
};

export const ShareCard: React.FC<Props> = ({ workout, userName }) => {
  const meta = ACTIVITY_META[workout.type] || ACTIVITY_META['RUNNING'];
  const startDate = new Date(workout.startTime);
  const endDate = new Date(workout.endTime);
  const dateStr = startDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const durationMins = Math.round(workout.duration / 60);
  const distKm = (workout.distance / 1000).toFixed(2);
  const pace = workout.distance > 0 && workout.duration > 0 ? ((workout.duration / 60) / (workout.distance / 1000)).toFixed(2) : '0.00';
  const points = workout.gpsPoints?.length || 0;

  // Build a simple route polyline from GPS points (downsampled for the image)
  const routePath = buildRoutePath(workout.gpsPoints || [], 900, 180);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>⚡</Text>
          </View>
          <Text style={styles.logo}>STRIDE</Text>
        </View>
        <Text style={styles.tag}>Run. Walk. Thrive.</Text>
      </View>

      <View style={styles.activityHeader}>
        <View style={[styles.activityIconBox, { borderColor: meta.color + '40', backgroundColor: meta.color + '15' }]}>
          {meta.icon}
        </View>
        <View style={styles.activityText}>
          <Text style={styles.activityLabel}>{workout.title || `${meta.label} Workout`}</Text>
          <Text style={styles.activityMeta}>{dateStr} • {timeStr}</Text>
        </View>
      </View>

      {routePath ? (
        <View style={styles.routeContainer}>
          <Svg width="100%" height="100%" viewBox="0 0 900 180">
            <Defs>
              <LinearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={meta.color} stopOpacity="0.8" />
                <Stop offset="1" stopColor={meta.color} stopOpacity="0.3" />
              </LinearGradient>
            </Defs>
            <Path d={routePath} fill="none" stroke="url(#routeGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {workout.gpsPoints && workout.gpsPoints.length > 0 && (
              <Circle cx={parseSvgX(workout.gpsPoints[0])} cy={parseSvgY(workout.gpsPoints[0], 180)} r="6" fill={meta.color} />
            )}
          </Svg>
        </View>
      ) : (
        <View style={styles.noRouteBox}>
          <Navigation size={20} color="#64748b" />
          <Text style={styles.noRouteText}>{points > 0 ? `${points} GPS points recorded` : 'No route data'}</Text>
        </View>
      )}

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{distKm}</Text>
          <Text style={styles.metricLabel}>km</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{durationMins}</Text>
          <Text style={styles.metricLabel}>min</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{pace}</Text>
          <Text style={styles.metricLabel}>min/km</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{Math.round(workout.calories)}</Text>
          <Text style={styles.metricLabel}>kcal</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{(workout.steps || 0).toLocaleString()}</Text>
          <Text style={styles.metricLabel}>steps</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.userChip}>
          <Text style={styles.userInitial}>{(userName || 'U').charAt(0).toUpperCase()}</Text>
          <Text style={styles.userNameText}>{userName || 'Stride User'}</Text>
        </View>
        <Text style={styles.footerUrl}>https://stride-phi-one.vercel.app/</Text>
      </View>
    </View>
  );
};

function buildRoutePath(points: any[], width: number, height: number): string | null {
  if (!points || points.length < 2) return null;

  const lats = points.map((p) => p.latitude);
  const lons = points.map((p) => p.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  const latRange = maxLat - minLat || 0.001;
  const lonRange = maxLon - minLon || 0.001;
  const padding = 20;

  const toX = (lon: number) => padding + ((lon - minLon) / lonRange) * (width - padding * 2);
  const toY = (lat: number) => padding + ((maxLat - lat) / latRange) * (height - padding * 2);

  // Downsample to ~80 points for a clean line
  const step = Math.max(1, Math.floor(points.length / 80));
  const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1);

  return sampled.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.longitude)} ${toY(p.latitude)}`).join(' ');
}

function parseSvgX(point: any): number {
  return 20;
}

function parseSvgY(point: any, height: number): number {
  return height - 20;
}

const styles = StyleSheet.create({
  card: {
    width: 900,
    minHeight: 520,
    backgroundColor: '#090d16',
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0f172a',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 20 },
  logo: { color: '#10b981', fontSize: 32, fontWeight: '900', letterSpacing: 1 },
  tag: { color: '#94a3b8', fontSize: 13, fontWeight: '700' },
  activityHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18, marginBottom: 12 },
  activityIconBox: { width: 56, height: 56, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  activityText: { flex: 1 },
  activityLabel: { color: '#ffffff', fontSize: 22, fontWeight: '900', marginBottom: 2 },
  activityMeta: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  routeContainer: { height: 180, backgroundColor: '#0f172a', borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden', marginBottom: 16 },
  noRouteBox: { height: 180, backgroundColor: '#0f172a', borderRadius: 14, borderWidth: 1, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16, flexDirection: 'row' },
  noRouteText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  metric: { alignItems: 'center', flex: 1 },
  metricValue: { color: '#ffffff', fontSize: 22, fontWeight: '800' },
  metricLabel: { color: '#94a3b8', fontSize: 10, marginTop: 6, fontWeight: '600', textTransform: 'uppercase' },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTopWidth: 1, borderTopColor: '#1e293b' },
  userChip: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  userInitial: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#10b981', color: '#090d16', fontWeight: '900', fontSize: 14, textAlign: 'center', lineHeight: 28 },
  userNameText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  footerUrl: { color: '#64748b', fontSize: 11, fontWeight: '600' },
});

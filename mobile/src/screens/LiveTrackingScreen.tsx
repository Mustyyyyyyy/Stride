import React, { useEffect, useState, useRef } from 'react';
import { AppState, View, Text, StyleSheet, TouchableOpacity, Platform, PermissionsAndroid, ScrollView, Share } from 'react-native';
import { useActivityStore } from '../store/useActivityStore';
import { useAuthStore } from '../store/useAuthStore';
import { GpsEngine } from '../services/GpsEngine';
import { Timer, Navigation, Gauge, Activity, Pause, Play, Square, Zap, Footprints, Bike, Mountain, MapPin } from 'lucide-react-native';
import { ShareCard } from '../components/ShareCard';
import ViewShot from 'react-native-view-shot';
import { MAPBOX_CONFIG } from '../config/mapbox';

type ActivityType = 'RUNNING' | 'WALKING' | 'CYCLING' | 'HIKING';

const ACTIVITY_OPTIONS: Array<{ type: ActivityType; label: string; icon: React.ReactNode; color: string }> = [
  { type: 'RUNNING', label: 'Run', icon: <Zap size={28} color='#10b981' />, color: '#10b981' },
  { type: 'WALKING', label: 'Walk', icon: <Footprints size={28} color='#06b6d4' />, color: '#06b6d4' },
  { type: 'CYCLING', label: 'Ride', icon: <Bike size={28} color='#f97316' />, color: '#f97316' },
  { type: 'HIKING', label: 'Hike', icon: <Mountain size={28} color='#a855f7' />, color: '#a855f7' },
];

export const LiveTrackingScreen: React.FC<{ onWorkoutComplete?: () => void }> = ({ onWorkoutComplete }) => {
  const {
    isTracking,
    isPaused,
    selectedActivityType,
    elapsedSeconds,
    distanceMeters,
    currentSpeedMs,
    averagePaceMinKm,
    caloriesBurned,
    stepsCount,
    gpsPoints,
    pauseWorkout,
    resumeWorkout,
    finishWorkout,
    tickTimer,
    addGpsPoint,
    useRealSteps,
  } = useActivityStore();

  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [useRealGps, setUseRealGps] = useState(false);
  const [showActivitySelector, setShowActivitySelector] = useState(true);
  const gpsStartedRef = useRef(false);
  const shareCardRef = useRef<any>(null);

  const shareWorkoutImage = async (workout: any) => {
    try {
      if (shareCardRef.current?.capture) {
        const uri = await shareCardRef.current.capture({ format: 'png', quality: 0.95, result: 'tmpfile' });
        if (!uri) throw new Error('Capture returned empty URI');

        // Try react-native-share first (handles Android FileProvider properly)
        try {
          const RNShare = require('react-native-share').default;
          const shareUrl = Platform.select({ ios: uri, android: 'file://' + uri });
          await RNShare.open({
            url: shareUrl,
            type: 'image/png',
            title: 'My Stride workout',
            subject: 'My Stride workout',
          });
          return;
        } catch {
          // Fallback to built-in Share if react-native-share is not available
        }

        const shareUrl = uri.startsWith('file://') ? uri : 'file://' + uri;
        await Share.share({ url: shareUrl, title: 'My Stride workout' } as any);
        return;
      }
    } catch (e) {
      // Fallback to a richer text share if image capture fails
    }

    const pace = workout.distance > 0 && workout.duration > 0 ? ((workout.duration / 60) / (workout.distance / 1000)).toFixed(2) : '0.00';
    const msg = [
      `${workout.title || 'Workout'} 🏃`,
      `📅 ${new Date(workout.startTime).toLocaleString()}`,
      `📏 ${(workout.distance / 1000).toFixed(2)} km`,
      `⏱ ${Math.round(workout.duration / 60)} min`,
      `⚡ ${pace} min/km`,
      `🔥 ${Math.round(workout.calories)} kcal`,
      `👟 ${(workout.steps || 0).toLocaleString()} steps`,
      `📍 ${workout.gpsPoints?.length || 0} GPS points`,
      ``,
      `Proudly tracked with Stride`,
      `https://stride-six-sepia.vercel.app/`,
    ].join('\n');
    await Share.share({ message: msg, title: 'My Stride workout' } as any);
  };

  useEffect(() => {
    if (!isTracking || isPaused) return;
    const timer = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [isTracking, isPaused, tickTimer]);

  // Reset activity selector when workout finishes so user can pick another activity
  useEffect(() => {
    if (!isTracking) {
      setShowActivitySelector(true);
      setUseRealGps(false);
      setGpsAccuracy(null);
      gpsStartedRef.current = false;
    }
  }, [isTracking]);

  // Stop background GPS when workout is no longer tracking
  useEffect(() => {
    if (!isTracking) {
      try {
        const BackgroundGeolocation = require('react-native-background-geolocation').default;
        if (BackgroundGeolocation) {
          BackgroundGeolocation.stop();
          BackgroundGeolocation.removeAllListeners();
        }
      } catch {
        // ignore
      }
      gpsStartedRef.current = false;
      setUseRealGps(false);
      setGpsAccuracy(null);
    }
    return () => {
      try {
        const BackgroundGeolocation = require('react-native-background-geolocation').default;
        if (BackgroundGeolocation) {
          BackgroundGeolocation.stop();
          BackgroundGeolocation.removeAllListeners();
        }
      } catch {
        // ignore
      }
    };
  }, [isTracking]);

  useEffect(() => {
    if (!isTracking) return;
    let mounted = true;

    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Stride Location Permission',
              message: 'Stride needs access to your location for GPS tracking.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (mounted && granted === PermissionsAndroid.RESULTS.GRANTED) {
            startRealGps();
          }
        } catch {
          // Permission denied, simulation continues
        }
      } else {
        startRealGps();
      }
    };

    requestLocationPermission();

    return () => {
      mounted = false;
    };
  }, [isTracking]);

  useEffect(() => {
    if (!isTracking) {
      gpsStartedRef.current = false;
      setUseRealGps(false);
      setGpsAccuracy(null);
      return;
    }

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && isTracking) {
        // Restart GPS when app comes to foreground to ensure continuous tracking
        if (!gpsStartedRef.current) {
          startRealGps();
        } else {
          try {
            const BackgroundGeolocation = require('react-native-background-geolocation').default;
            if (BackgroundGeolocation) {
              BackgroundGeolocation.start({
                desiredAccuracy: 10,
                distanceFilter: 5,
                stationaryRadius: 25,
                notificationTitle: 'Stride GPS Tracking',
                notificationText: 'Tracking your activity in background',
                debug: false,
                pauseLocationUpdates: false,
                stopOnTerminate: false,
                startOnBoot: true,
                foregroundService: true,
                disableStopDetection: false,
                preventSuspend: true,
              });
            }
          } catch {
            // ignore
          }
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isTracking]);

  const startRealGps = () => {
    if (gpsStartedRef.current) return;

    try {
      const BackgroundGeolocation = require('react-native-background-geolocation').default;
      if (!BackgroundGeolocation) return;

      BackgroundGeolocation.on('location', (location: any) => {
        const state = useActivityStore.getState();
        if (!state.isTracking || state.isPaused || !location?.coords) return;

        addGpsPoint(
          location.coords.latitude,
          location.coords.longitude,
          location.coords.speed || 0,
          location.coords.accuracy || 5,
          location.coords.altitude || 0,
        );
        if (location.coords.accuracy) {
          setGpsAccuracy(location.coords.accuracy);
        }
      });

      BackgroundGeolocation.on('motionchange', (isMoving: boolean) => {
        // Could auto-pause when stationary
      });

      BackgroundGeolocation.on('providerchange', (provider: any) => {
        if (provider.enabled) {
          setGpsAccuracy(null);
        }
      });

      BackgroundGeolocation.start({
        desiredAccuracy: 10,
        distanceFilter: 5,
        stationaryRadius: 25,
        notificationTitle: 'Stride GPS Tracking',
        notificationText: 'Tracking your activity in background',
        debug: false,
        pauseLocationUpdates: false,
        stopOnTerminate: false,
        startOnBoot: true,
        foregroundService: true,
        disableStopDetection: false,
        preventSuspend: true,
        // Android foreground service configuration
        notification: {
          title: 'Stride GPS Tracking',
          text: 'Tracking your activity in background',
          icon: 'ic_location',
          channelId: 'stride-gps-channel',
          channelName: 'Stride GPS Tracking',
          channelDescription: 'Shows when Stride is tracking your location in the background',
          priority: 'LOW',
        },
      });

      gpsStartedRef.current = true;
      setUseRealGps(true);
    } catch (error) {
      setUseRealGps(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const h = Math.floor(secs / 3600);
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (showActivitySelector && !isTracking) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.recordTitle}>Record Activity</Text>
        <Text style={styles.recordSubtitle}>Choose an activity to start tracking</Text>
        <View style={styles.activityGrid}>
          {ACTIVITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.type}
              style={[styles.activityCard, { borderColor: opt.color + '40' }]}
              onPress={() => {
                const { setActivityType, startWorkout } = useActivityStore.getState();
                setActivityType(opt.type);
                startWorkout();
              }}
            >
              <View style={[styles.activityIconBox, { backgroundColor: opt.color + '15', borderColor: opt.color + '30' }]}>
                {opt.icon}
              </View>
              <Text style={styles.activityLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Placeholder / Live GPS Feed */}
      <View style={styles.mapMock}>
        <View style={styles.mapHeader}>
          <MapPin size={20} color="#10b981" />
          <Text style={styles.mapText}>
            {useRealGps ? 'Live GPS Tracking' : 'Simulated GPS Tracking'}
          </Text>
        </View>
        {MAPBOX_CONFIG.accessToken !== 'YOUR_MAPBOX_ACCESS_TOKEN_HERE' ? (
          <View style={styles.mapboxBadge}>
            <Text style={styles.mapboxBadgeText}>MAPBOX READY</Text>
          </View>
        ) : (
          <View style={[styles.mapboxBadge, styles.mapboxBadgeUnconfigured]}>
            <Text style={styles.mapboxBadgeTextUnconfigured}>ADD MAPBOX TOKEN IN config/mapbox.ts</Text>
          </View>
        )}
        {gpsAccuracy !== null && (
          <View style={styles.accuracyBadge}>
            <Text style={styles.accuracyText}>GPS ACC: {Math.round(gpsAccuracy)}M</Text>
          </View>
        )}
        {!useRealGps && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>SIMULATION MODE • NOISE FILTER ACTIVE</Text>
          </View>
        )}
        {useRealGps && (
          <View style={[styles.liveBadge, styles.realGpsBadge]}>
            <Text style={styles.liveBadgeText}>REAL GPS • {gpsPoints.length} POINTS</Text>
          </View>
        )}
        {useRealSteps && (
          <View style={[styles.liveBadge, styles.realStepsBadge]}>
            <Text style={styles.liveBadgeText}>REAL STEPS • {stepsCount.toLocaleString()}</Text>
          </View>
        )}

        {/* Hidden share card used for capturing a styled image */}
        <View style={{ position: 'absolute', left: -2000, top: -2000 }}>
          <ViewShot ref={shareCardRef} options={{ format: 'png', quality: 0.95 }} style={{ width: 900, height: 520 }}>
            <ShareCard
              workout={{
                id: 'preview',
                userId: '',
                type: selectedActivityType,
                title: `${selectedActivityType.charAt(0) + selectedActivityType.slice(1).toLowerCase()} Workout`,
                distance: distanceMeters,
                duration: elapsedSeconds,
                calories: caloriesBurned,
                averageSpeed: currentSpeedMs,
                maxSpeed: currentSpeedMs,
                averagePace: averagePaceMinKm,
                steps: stepsCount,
                startTime: new Date(Date.now() - elapsedSeconds * 1000).toISOString(),
                endTime: new Date().toISOString(),
                gpsPoints,
              }}
              userName={useAuthStore.getState().user?.fullName}
            />
          </ViewShot>
        </View>
      </View>

      {/* Primary Metrics Grid */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <View style={styles.metricIconBox}>
            <Timer size={18} color="#10b981" />
          </View>
          <Text style={styles.metricLabel}>ELAPSED TIME</Text>
          <Text style={styles.metricValue}>{formatTime(elapsedSeconds)}</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIconBox}>
            <Navigation size={18} color="#06b6d4" />
          </View>
          <Text style={styles.metricLabel}>DISTANCE</Text>
          <Text style={styles.metricValue}>{(distanceMeters / 1000).toFixed(2)} km</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIconBox}>
            <Gauge size={18} color="#f97316" />
          </View>
          <Text style={styles.metricLabel}>SPEED</Text>
          <Text style={styles.metricValue}>{(currentSpeedMs * 3.6).toFixed(1)} km/h</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIconBox}>
            <Activity size={18} color="#a855f7" />
          </View>
          <Text style={styles.metricLabel}>AVG PACE</Text>
          <Text style={styles.metricValue}>{averagePaceMinKm.toFixed(2)} min/km</Text>
        </View>
      </View>

      {/* Secondary Stats Row */}
      <View style={styles.secondaryRow}>
        <View style={styles.secondaryCard}>
          <Text style={styles.secondaryLabel}>Calories</Text>
          <Text style={styles.secondaryValue}>{Math.round(caloriesBurned)} kcal</Text>
        </View>
        <View style={styles.secondaryCard}>
          <Text style={styles.secondaryLabel}>Steps</Text>
          <Text style={styles.secondaryValue}>{stepsCount.toLocaleString()}</Text>
        </View>
        <View style={styles.secondaryCard}>
          <Text style={styles.secondaryLabel}>GPS Points</Text>
          <Text style={styles.secondaryValue}>{gpsPoints.length}</Text>
        </View>
      </View>


      {/* Action Buttons */}
      <View style={styles.actionRow}>
        {isPaused ? (
          <TouchableOpacity style={[styles.btn, styles.resumeBtn]} onPress={resumeWorkout}>
            <Play size={20} color="#090d16" fill="#090d16" />
            <Text style={styles.btnText}>RESUME</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.pauseBtn]} onPress={pauseWorkout}>
            <Pause size={20} color="#090d16" fill="#090d16" />
            <Text style={styles.btnText}>PAUSE</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.btn, styles.finishBtn]} onPress={async () => {
          await finishWorkout();
          if (onWorkoutComplete) onWorkoutComplete();
        }}>
          <Square size={18} color="#ffffff" fill="#ffffff" />
          <Text style={styles.finishBtnText}>FINISH & SAVE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  mapMock: { height: 280, backgroundColor: '#111827', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16, position: 'relative', borderWidth: 1, borderColor: '#1f2937' },
  mapHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 },
  mapText: { color: '#10b981', fontWeight: '700', fontSize: 14 },
  mapboxBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#10b98133' },
  mapboxBadgeText: { color: '#10b981', fontSize: 10, fontWeight: '700' },
  mapboxBadgeUnconfigured: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef444433' },
  mapboxBadgeTextUnconfigured: { color: '#ef4444', fontSize: 9, fontWeight: '700' },
  accuracyBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#10b98133' },
  accuracyText: { color: '#10b981', fontSize: 10, fontWeight: '700' },
  liveBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(245, 158, 11, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#f59e0b33' },
  liveBadgeText: { color: '#f59e0b', fontSize: 10, fontWeight: '700' },
  realGpsBadge: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b98133' },
  realStepsBadge: { backgroundColor: 'rgba(6, 182, 212, 0.15)', borderColor: '#06b6d433' },
  metricsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
  metricCard: { width: '48%', backgroundColor: '#111827', borderRadius: 14, padding: 14, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#1f2937' },
  metricIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  metricLabel: { color: '#64748b', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  metricValue: { color: '#ffffff', fontSize: 22, fontWeight: '800', marginTop: 2 },
  secondaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  secondaryCard: { flex: 1, backgroundColor: '#111827', borderRadius: 12, padding: 12, marginHorizontal: 3, alignItems: 'center', borderWidth: 1, borderColor: '#1f2937' },
  secondaryLabel: { color: '#64748b', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  secondaryValue: { color: '#ffffff', fontSize: 14, fontWeight: '700', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  pauseBtn: { backgroundColor: '#f59e0b' },
  resumeBtn: { backgroundColor: '#10b981' },
  finishBtn: { backgroundColor: '#e11d48' },
  btnText: { color: '#090d16', fontWeight: '700', fontSize: 13 },
  finishBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  recordTitle: { color: '#ffffff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginTop: 24, marginBottom: 4 },
  recordSubtitle: { color: '#64748b', fontSize: 13, textAlign: 'center', marginBottom: 24 },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 4 },
  activityCard: { width: '47%', backgroundColor: '#111827', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#1f2937', marginBottom: 12, alignItems: 'center' },
  activityIconBox: { width: 56, height: 56, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  activityLabel: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
});

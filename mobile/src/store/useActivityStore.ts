import { create } from 'zustand';
import { ActivityType, GpsPoint, WorkoutActivity } from '../types';
import { GpsEngine } from '../services/GpsEngine';
import { OfflineBuffer } from '../services/OfflineBuffer';
import { api } from '../services/api';

interface ActivityTrackingState {
  isTracking: boolean;
  isPaused: boolean;
  selectedActivityType: ActivityType;
  userId?: string;
  startTime: string | null;
  elapsedSeconds: number;
  distanceMeters: number;
  currentSpeedMs: number;
  maxSpeedMs: number;
  averagePaceMinKm: number;
  caloriesBurned: number;
  stepsCount: number;
  gpsPoints: GpsPoint[];
  recentActivities: WorkoutActivity[];
  isLoading: boolean;

  setActivityType: (type: ActivityType) => void;
  startWorkout: () => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  addGpsPoint: (lat: number, lon: number, speed?: number, accuracy?: number, alt?: number) => void;
  tickTimer: () => void;
  finishWorkout: () => WorkoutActivity;
  discardWorkout: () => void;
  hydrateFromApi: () => Promise<void>;
}

export const useActivityStore = create<ActivityTrackingState>((set, get) => ({
  isTracking: false,
  isPaused: false,
  selectedActivityType: 'RUNNING',
  userId: undefined,
  startTime: null,
  elapsedSeconds: 0,
  distanceMeters: 0,
  currentSpeedMs: 0,
  maxSpeedMs: 0,
  averagePaceMinKm: 0,
  caloriesBurned: 0,
  stepsCount: 0,
  gpsPoints: [],
  isLoading: false,
  recentActivities: [],

  hydrateFromApi: async () => {
    set({ isLoading: true });
    try {
      const activities = await api.getActivities();
      if (activities && activities.length > 0) {
        set({ recentActivities: activities, isLoading: false });
        return;
      }
    } catch {
      // API unavailable
    }
    set({ isLoading: false });
  },

  setActivityType: (type) => set({ selectedActivityType: type }),

  startWorkout: () => {
    set({
      isTracking: true,
      isPaused: false,
      startTime: new Date().toISOString(),
      elapsedSeconds: 0,
      distanceMeters: 0,
      currentSpeedMs: 0,
      maxSpeedMs: 0,
      averagePaceMinKm: 0,
      caloriesBurned: 0,
      stepsCount: 0,
      gpsPoints: [],
    });
  },

  pauseWorkout: () => set({ isPaused: true }),
  resumeWorkout: () => set({ isPaused: false }),

  addGpsPoint: (latitude, longitude, speed = 0, accuracy = 5, altitude = 0) => {
    const state = get();
    if (!state.isTracking || state.isPaused) return;

    const newPt: GpsPoint = {
      latitude,
      longitude,
      speed,
      accuracy,
      altitude,
      timestamp: new Date().toISOString(),
    };

    const lastPt = state.gpsPoints[state.gpsPoints.length - 1] || null;

    if (!GpsEngine.isPointValid(lastPt, newPt)) return;

    let addedDist = 0;
    if (lastPt) {
      addedDist = GpsEngine.haversineDistance(
        lastPt.latitude,
        lastPt.longitude,
        newPt.latitude,
        newPt.longitude,
      );
    }

    const newDist = state.distanceMeters + addedDist;
    const newMaxSpeed = Math.max(state.maxSpeedMs, speed);
    const newPace = GpsEngine.calculatePace(newDist, state.elapsedSeconds);
    const newCalories = GpsEngine.calculateCalories(state.selectedActivityType, state.elapsedSeconds, 70);
    const newSteps = GpsEngine.estimateSteps(state.selectedActivityType, newDist);

    set({
      gpsPoints: [...state.gpsPoints, newPt],
      distanceMeters: newDist,
      currentSpeedMs: speed,
      maxSpeedMs: newMaxSpeed,
      averagePaceMinKm: newPace,
      caloriesBurned: newCalories,
      stepsCount: newSteps,
    });
  },

  tickTimer: () => {
    const state = get();
    if (!state.isTracking || state.isPaused) return;
    const nextSecs = state.elapsedSeconds + 1;
    const nextPace = GpsEngine.calculatePace(state.distanceMeters, nextSecs);
    const nextCal = GpsEngine.calculateCalories(state.selectedActivityType, nextSecs, 70);

    set({
      elapsedSeconds: nextSecs,
      averagePaceMinKm: nextPace,
      caloriesBurned: nextCal,
    });
  },

  finishWorkout: async () => {
    const state = get();
    const endTime = new Date().toISOString();
    const typeLabel = state.selectedActivityType.charAt(0) + state.selectedActivityType.slice(1).toLowerCase();

    const workout: WorkoutActivity = {
      id: 'act_' + Date.now(),
      userId: state.userId || '',
      type: state.selectedActivityType,
      title: `${typeLabel} Workout`,
      distance: Math.round(state.distanceMeters),
      duration: state.elapsedSeconds,
      calories: state.caloriesBurned,
      averageSpeed: state.elapsedSeconds > 0 ? parseFloat((state.distanceMeters / state.elapsedSeconds).toFixed(2)) : 0,
      maxSpeed: parseFloat(state.maxSpeedMs.toFixed(2)),
      averagePace: state.averagePaceMinKm,
      steps: state.stepsCount,
      startTime: state.startTime || endTime,
      endTime,
      gpsPoints: state.gpsPoints,
    };

    OfflineBuffer.saveWorkoutLocally(workout);

    try {
      await api.createActivity(workout);

      const distKm = workout.distance / 1000;
      const durationMins = Math.round(workout.duration / 60);

      if (workout.calories >= 500) {
        api.createNotification({
          title: 'Great Burn! 🔥',
          body: `You burned ${workout.calories} kcal on your ${typeLabel}. Keep crushing it!`,
          type: 'ACHIEVEMENT',
        }).catch(() => {});
      }

      if (workout.distance >= 10000) {
        api.createNotification({
          title: 'Distance Champion! 🏆',
          body: `You covered ${distKm.toFixed(1)} km in your ${typeLabel}. Amazing distance!`,
          type: 'ACHIEVEMENT',
        }).catch(() => {});
      }

      if (workout.duration >= 3600) {
        api.createNotification({
          title: 'Endurance Beast! 💪',
          body: `You trained for ${durationMins} minutes. That's dedication!`,
          type: 'ACHIEVEMENT',
        }).catch(() => {});
      }
    } catch {
      // Workout saved locally; will sync when online
    }

    set({
      isTracking: false,
      isPaused: false,
      recentActivities: [workout, ...state.recentActivities],
    });

    return workout;
  },

  discardWorkout: () => {
    set({
      isTracking: false,
      isPaused: false,
      gpsPoints: [],
      elapsedSeconds: 0,
      distanceMeters: 0,
    });
  },
}));


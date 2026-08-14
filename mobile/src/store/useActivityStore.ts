import { create } from 'zustand';
import { ActivityType, GpsPoint, WorkoutActivity } from '../types';
import { GpsEngine } from '../services/GpsEngine';
import { OfflineBuffer } from '../services/OfflineBuffer';
import { stepCounter } from '../services/StepCounter';
import { Storage, KEYS } from '../services/Storage';
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
  useRealSteps: boolean;
  startPedometerSteps: number;
  workoutStepCallback?: (steps: number) => void;
  lastCompletedWorkout: WorkoutActivity | null;

  setActivityType: (type: ActivityType) => void;
  startWorkout: () => Promise<void>;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  addGpsPoint: (lat: number, lon: number, speed?: number, accuracy?: number, alt?: number) => void;
  tickTimer: () => void;
  finishWorkout: () => Promise<WorkoutActivity>;
  discardWorkout: () => void;
  hydrateFromApi: () => Promise<void>;
  clearLastCompletedWorkout: () => void;
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
  useRealSteps: false,
  startPedometerSteps: 0,
  workoutStepCallback: undefined,
  lastCompletedWorkout: null,

  clearLastCompletedWorkout: () => set({ lastCompletedWorkout: null }),

  hydrateFromApi: async () => {
    set({ isLoading: true });
    let localActivities: WorkoutActivity[] = [];
    try {
      const rawSaved = Storage.getString(KEYS.WORKOUT_HISTORY);
      if (rawSaved) {
        localActivities = JSON.parse(rawSaved) as WorkoutActivity[];
      }
    } catch {
      localActivities = [];
    }

    if (localActivities.length > 0) {
      set({ recentActivities: localActivities });
    }

    try {
      const activities = await api.getActivities();
      if (activities && activities.length > 0) {
        const merged = [...activities, ...localActivities].filter(
          (value, index, self) => self.findIndex((item) => item.id === value.id) === index,
        );
        set({ recentActivities: merged, isLoading: false });
        Storage.setString(KEYS.WORKOUT_HISTORY, JSON.stringify(merged));
        return;
      }
    } catch {
      // API unavailable, keep local activities
    }

    set({ isLoading: false });
  },

  addManualSteps: (delta: number) => {
    const state = get();
    if (!state.isTracking) return;
    const next = Math.max(0, state.stepsCount + Math.round(delta));
    set({ stepsCount: next });
  },

  setManualSteps: (value: number) => {
    const next = Math.max(0, Math.round(value));
    set({ stepsCount: next });
  },

  setActivityType: (type) => set({ selectedActivityType: type }),

  startWorkout: async () => {
    // Start the workout state immediately so the UI always transitions to live tracking.
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
      useRealSteps: false,
      startPedometerSteps: 0,
      workoutStepCallback: undefined,
    });

    let canUseRealSteps = false;
    let startPedometerSteps = 0;

    try {
      canUseRealSteps = await stepCounter.isStepCountingAvailable();
      if (canUseRealSteps) {
        startPedometerSteps = await stepCounter.getTodaySteps();
        const callback = (currentSteps: number) => {
          const state = get();
          if (!state.isTracking || state.isPaused) return;
          const delta = currentSteps - startPedometerSteps;
          if (delta >= 0) {
            set({ stepsCount: delta });
          }
        };
        stepCounter.startWatching(callback);
        set({ workoutStepCallback: callback, useRealSteps: true, startPedometerSteps });
        return;
      }
    } catch {
      canUseRealSteps = false;
    }

    set({
      useRealSteps: canUseRealSteps,
      startPedometerSteps,
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
      // If device pedometer is available and being used, preserve pedometer-derived steps.
      // Only use GPS-estimated steps as a fallback when pedometer isn't available.
      ...(state.useRealSteps ? {} : { stepsCount: newSteps }),
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

  finishWorkout: async (): Promise<WorkoutActivity> => {
    const state = get();
    const endTime = new Date().toISOString();
    const typeLabel = state.selectedActivityType.charAt(0) + state.selectedActivityType.slice(1).toLowerCase();

    let finalSteps = state.stepsCount;
    if (state.workoutStepCallback) {
      stepCounter.stopWatching(state.workoutStepCallback);
    }

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
      steps: finalSteps,
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

    const updatedActivities = [workout, ...state.recentActivities];
    Storage.setString(KEYS.WORKOUT_HISTORY, JSON.stringify(updatedActivities));

    set({
      isTracking: false,
      isPaused: false,
      stepsCount: finalSteps,
      recentActivities: updatedActivities,
      lastCompletedWorkout: workout,
    });

    return workout;
  },

  addManualActivity: async (payload: Partial<WorkoutActivity>) => {
    const state = get();
    const id = 'act_manual_' + Date.now();
    const now = new Date().toISOString();
    const workout: WorkoutActivity = {
      id,
      userId: state.userId || '',
      type: (payload.type as ActivityType) || 'WALKING',
      title: payload.title || `${((payload.type as ActivityType) || 'WALKING').charAt(0) + ((payload.type as ActivityType) || 'WALKING').slice(1).toLowerCase()} (Manual)` ,
      distance: Math.round(payload.distance || 0),
      duration: payload.duration || 0,
      calories: payload.calories || 0,
      averageSpeed: payload.averageSpeed || 0,
      maxSpeed: payload.maxSpeed || 0,
      averagePace: payload.averagePace || 0,
      steps: payload.steps || 0,
      startTime: payload.startTime || now,
      endTime: payload.endTime || now,
      gpsPoints: payload.gpsPoints || [],
    };

    const updated = [workout, ...state.recentActivities];
    Storage.setString(KEYS.WORKOUT_HISTORY, JSON.stringify(updated));
    set({ recentActivities: updated });

    // best-effort push to server
    try {
      await api.createActivity(workout);
    } catch {
      // will be synced later via OfflineBuffer
      OfflineBuffer.saveWorkoutLocally(workout);
    }

    return workout;
  },

  deleteActivity: async (id: string) => {
    const state = get();
    const remaining = state.recentActivities.filter((a) => a.id !== id);
    Storage.setString(KEYS.WORKOUT_HISTORY, JSON.stringify(remaining));
    set({ recentActivities: remaining });

    // best-effort delete on server
    try {
      if ((api as any).deleteActivity) {
        await (api as any).deleteActivity(id);
      }
    } catch {
      // ignore
    }
  },

  discardWorkout: () => {
    const state = get();
    if (state.workoutStepCallback) {
      stepCounter.stopWatching(state.workoutStepCallback);
    }
    set({
      isTracking: false,
      isPaused: false,
      gpsPoints: [],
      elapsedSeconds: 0,
      distanceMeters: 0,
      stepsCount: 0,
      useRealSteps: false,
      startPedometerSteps: 0,
      workoutStepCallback: undefined,
    });
  },
}));


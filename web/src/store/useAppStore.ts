import { create } from 'zustand';
import { ActivityType, GpsPoint, WorkoutActivity, UserProfile, FitnessGoal, Achievement } from '../types';
import { api } from '../services/api';
import { estimateSteps } from '../services/StepEstimator';
import { webBackgroundStepService } from '../services/WebBackgroundStepService';

export type PageView = 'dashboard' | 'live-activity' | 'history' | 'workout-detail' | 'workout-summary' | 'stats' | 'goals' | 'profile' | 'settings' | 'notifications' | 'feed' | 'challenges';

export type NotificationType = 'activity' | 'achievement' | 'goal' | 'reminder' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  timestamp: string;
  read: boolean;
  actionPage?: PageView;
}

interface AppState {
  activePage: PageView;
  selectedWorkoutId: string | null;
  theme: 'dark' | 'light';
  unitSystem: 'METRIC' | 'IMPERIAL';
  isOnline: boolean;
  isLoading: boolean;
  apiError: string | null;
  authError: string | null;
  isAuthenticated: boolean;
  user: UserProfile;

  // Live Tracking state
  isTracking: boolean;
  isPaused: boolean;
  selectedActivityType: ActivityType;
  startTime: string | null;
  elapsedSeconds: number;
  distanceMeters: number;
  currentSpeedMs: number;
  maxSpeedMs: number;
  averagePaceMinKm: number;
  caloriesBurned: number;
  stepsCount: number;
  gpsPoints: GpsPoint[];

  // Data lists
  activities: WorkoutActivity[];
  goals: FitnessGoal[];
  achievements: Achievement[];
  streakDays: number;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  feedItems: any[];

  // Actions
  setActivePage: (page: PageView, workoutId?: string) => void;
  toggleTheme: () => void;
  setUnitSystem: (unit: 'METRIC' | 'IMPERIAL') => void;
  toggleOnlineStatus: () => void;
  updateUser: (profile: Partial<UserProfile>) => Promise<void>;
  hydrateFromApi: () => Promise<void>;
  dismissApiError: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; fullName: string; weight?: number; height?: number }) => Promise<void>;
  logout: () => void;

  // Tracking actions
  setActivityType: (type: ActivityType) => void;
  startTracking: () => void;
  pauseTracking: () => void;
  resumeTracking: () => void;
  tickTracking: () => void;
  finishTracking: () => Promise<WorkoutActivity>;
  discardTracking: () => void;

  // Goals
  addGoal: (goal: Omit<FitnessGoal, 'id' | 'currentProgress' | 'completed'>) => Promise<void>;

  // Notifications
  pushNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const createEmptyUser = (): UserProfile => ({
  id: '',
  email: '',
  fullName: '',
  profilePhoto: '',
  height: 175,
  weight: 70,
  gender: '',
  unitSystem: 'METRIC',
  theme: 'DARK',
});

const normalizeUser = (user: any): UserProfile => ({
  id: user?.id || '',
  email: user?.email || '',
  fullName: user?.fullName || user?.name || '',
  profilePhoto: user?.profilePhoto || user?.avatarUrl || '',
  height: user?.height || 175,
  weight: user?.weight || 70,
  gender: user?.gender || '',
  unitSystem: user?.unitSystem?.toUpperCase() === 'IMPERIAL' ? 'IMPERIAL' : 'METRIC',
  theme: user?.theme?.toUpperCase() === 'LIGHT' ? 'LIGHT' : 'DARK',
});

const computeStreakDays = (activities: WorkoutActivity[]) => {
  if (!activities.length) return 0;

  const uniqueDays = Array.from(new Set(activities.map((activity) => new Date(activity.startTime).toISOString().slice(0, 10))));
  return Math.min(uniqueDays.length, 30);
};

export const useAppStore = create<AppState>((set, get) => ({
  activePage: 'dashboard',
  selectedWorkoutId: null,
  theme: 'dark',
  unitSystem: 'METRIC',
  isOnline: true,
  isLoading: false,
  apiError: null,
  authError: null,
  isAuthenticated: false,

  user: createEmptyUser(),

  isTracking: false,
  isPaused: false,
  selectedActivityType: 'RUNNING',
  startTime: null,
  elapsedSeconds: 0,
  distanceMeters: 0,
  currentSpeedMs: 0,
  maxSpeedMs: 0,
  averagePaceMinKm: 0,
  caloriesBurned: 0,
  stepsCount: 0,
  gpsPoints: [],
  streakDays: 0,

  activities: [],
  goals: [],
  achievements: [],
  notifications: [],
  unreadNotificationsCount: 0,
  feedItems: [],

  setActivePage: (page, workoutId) => {
    set({ activePage: page, selectedWorkoutId: workoutId || null });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: nextTheme });
    if (typeof document !== 'undefined') {
      if (nextTheme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light-theme');
      } else {
        document.documentElement.classList.remove('light-theme');
        document.documentElement.classList.add('dark');
      }
    }
  },

  setUnitSystem: (unit) => set({ unitSystem: unit }),
  toggleOnlineStatus: () => set((state) => ({ isOnline: !state.isOnline })),

  updateUser: async (profile) => {
    const state = get();
    const payload = {
      fullName: profile.fullName ?? state.user.fullName,
      weight: Number(profile.weight ?? state.user.weight),
      height: Number(profile.height ?? state.user.height),
      gender: profile.gender ?? state.user.gender,
      unitSystem: profile.unitSystem ?? state.user.unitSystem,
      theme: profile.theme ?? state.user.theme,
    };

    // Optimistically update local user state
    set({ user: normalizeUser({ ...state.user, ...payload }) });

    try {
      const updatedUser = await api.updateProfile(payload);
      if (updatedUser) {
        set({ user: normalizeUser(updatedUser) });
      }
    } catch (err) {
      // Local state is already updated optimistically
    }
  },

  hydrateFromApi: async () => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('stride_access_token') : null;
    if (!token) {
      set({ isAuthenticated: false, isLoading: false, apiError: null });
      return;
    }

    set({ isLoading: true, apiError: null });
    try {
      // Use allSettled so a single 404 endpoint doesn't block everything
      const [profileRes, activitiesRes, goalsRes, achievementsRes, unreadRes, feedRes, challengesRes] = await Promise.allSettled([
        api.getProfile(),
        api.getActivities(),
        api.getGoals(),
        api.getAchievements(),
        api.getUnreadCount().catch(() => 0), // optional endpoint, fallback 0
        api.getFeed().catch(() => []), // optional endpoint, fallback []
        api.getChallenges().catch(() => []), // optional endpoint, fallback []
      ]);

      // Check if any request failed with 401 Unauthorized (expired token)
      const results = [profileRes, activitiesRes, goalsRes, achievementsRes];
      const is401 = results.some(
        (r) => r.status === 'rejected' && (r.reason?.message?.includes('401') || r.reason?.message?.includes('Unauthorized'))
      );

      if (is401) {
        if (typeof localStorage !== 'undefined') localStorage.removeItem('stride_access_token');
        set({ isAuthenticated: false, isLoading: false, apiError: null });
        return;
      }

      if (profileRes.status === 'rejected') {
        set({ isLoading: false, apiError: 'Could not load profile. Check your connection.' });
        return;
      }

      let activities = activitiesRes.status === 'fulfilled' && Array.isArray(activitiesRes.value) ? activitiesRes.value : [];
      const goals = goalsRes.status === 'fulfilled' && Array.isArray(goalsRes.value) ? goalsRes.value : [];
      const achievements = achievementsRes.status === 'fulfilled' && Array.isArray(achievementsRes.value) ? achievementsRes.value : [];
      const unread = unreadRes.status === 'fulfilled' && typeof unreadRes.value === 'number' ? unreadRes.value : 0;
      const feed = feedRes.status === 'fulfilled' && Array.isArray(feedRes.value) ? feedRes.value : [];
      const challenges = challengesRes.status === 'fulfilled' && Array.isArray(challengesRes.value) ? challengesRes.value : [];

      // Ensure activities have sensible step values on web when the backend or source didn't provide them.
      activities = activities.map((a: WorkoutActivity) => ({
        ...a,
        steps: typeof a.steps === 'number' && a.steps > 0 ? a.steps : estimateSteps(a.type as ActivityType, a.distance || 0),
      }));

      set({
        user: normalizeUser(profileRes.value),
        activities,
        goals,
        achievements,
        streakDays: computeStreakDays(activities),
        unreadNotificationsCount: unread,
        feedItems: feed,
        isAuthenticated: true,
        isLoading: false,
        apiError: null,
      });
    } catch (err) {
      set({
        apiError: err instanceof Error ? err.message : 'Unable to reach Stride server.',
        isLoading: false,
      });
    }
  },

  dismissApiError: () => set({ apiError: null }),

  login: async (email, password) => {
    set({ isLoading: true, authError: null, apiError: null });
    try {
      const payload = await api.login({ email, password });
      if (payload?.accessToken) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('stride_access_token', payload.accessToken);
        }
      }
      set({ user: normalizeUser(payload?.user), isAuthenticated: true, isLoading: false });
      await get().hydrateFromApi();
    } catch (err) {
      set({ authError: err instanceof Error ? err.message : 'Unable to sign in.', apiError: null, isLoading: false });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, apiError: null });
    try {
      const response = await api.register(payload);
      if (response?.accessToken) {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('stride_access_token', response.accessToken);
        }
      }
      set({ user: normalizeUser(response?.user), isAuthenticated: true, isLoading: false });
      await get().hydrateFromApi();
    } catch (err) {
      set({ authError: err instanceof Error ? err.message : 'Unable to create account.', apiError: null, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('stride_access_token');
    }
    set({
      isAuthenticated: false,
      user: createEmptyUser(),
      activities: [],
      goals: [],
      achievements: [],
      streakDays: 0,
      apiError: null,
      authError: null,
      isTracking: false,
      isPaused: false,
      gpsPoints: [],
      elapsedSeconds: 0,
      distanceMeters: 0,
      currentSpeedMs: 0,
      maxSpeedMs: 0,
      averagePaceMinKm: 0,
      caloriesBurned: 0,
      stepsCount: 0,
    });
  },

  setActivityType: (type) => set({ selectedActivityType: type }),

  startTracking: () => {
    set({
      isTracking: true,
      isPaused: false,
      activePage: 'live-activity',
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

  pauseTracking: () => set({ isPaused: true }),
  resumeTracking: () => set({ isPaused: false }),

  tickTracking: () => {
    const state = get();
    if (!state.isTracking || state.isPaused) return;

    const nextSecs = state.elapsedSeconds + 1;
    const currentSpeed = state.selectedActivityType === 'CYCLING' ? 6.2 : state.selectedActivityType === 'RUNNING' ? 3.1 : 1.5;
    const nextDist = state.distanceMeters + currentSpeed * 0.8;
    const maxSpeed = Math.max(state.maxSpeedMs, currentSpeed);
    const distKm = nextDist / 1000;
    const durationMins = nextSecs / 60;
    const nextPace = distKm > 0 ? parseFloat((durationMins / distKm).toFixed(2)) : 0;
    const met = state.selectedActivityType === 'RUNNING' ? 9.8 : state.selectedActivityType === 'CYCLING' ? 7.5 : 3.8;
    const nextCalories = Math.round(met * (state.user.weight || 70) * (nextSecs / 3600));
    const nextSteps = estimateSteps(state.selectedActivityType, nextDist);

    set({
      elapsedSeconds: nextSecs,
      distanceMeters: nextDist,
      currentSpeedMs: currentSpeed,
      maxSpeedMs: maxSpeed,
      averagePaceMinKm: nextPace,
      caloriesBurned: nextCalories,
      stepsCount: nextSteps,
    });
  },

  finishTracking: async () => {
    const state = get();
    const endTime = new Date().toISOString();
    const typeLabel = state.selectedActivityType.charAt(0) + state.selectedActivityType.slice(1).toLowerCase();

    const newWorkout: WorkoutActivity = {
      id: 'act_' + Date.now(),
      userId: state.user.id,
      type: state.selectedActivityType,
      title: `${typeLabel} Workout`,
      distance: Math.round(state.distanceMeters),
      duration: state.elapsedSeconds,
      calories: state.caloriesBurned,
      averageSpeed: state.elapsedSeconds > 0 ? parseFloat((state.distanceMeters / state.elapsedSeconds).toFixed(2)) : 0,
      maxSpeed: parseFloat(state.maxSpeedMs.toFixed(2)),
      averagePace: state.averagePaceMinKm,
      steps: state.stepsCount,
      polyline: '',
      notes: 'Completed in Stride Live GPS Tracker',
      startTime: state.startTime || endTime,
      endTime,
    };

    try {
      const savedWorkout = await api.createActivity({
        ...newWorkout,
        gpsPoints: state.gpsPoints,
      });
      const persistedWorkout = savedWorkout || newWorkout;
      set({
        isTracking: false,
        isPaused: false,
        activities: [persistedWorkout, ...state.activities],
        activePage: 'workout-summary',
        selectedWorkoutId: persistedWorkout.id,
        streakDays: computeStreakDays([persistedWorkout, ...state.activities]),
      });

      // Sync steps with web background step service
      try {
        await webBackgroundStepService.syncWithActivity(state.selectedActivityType, state.distanceMeters);
      } catch {
        // ignore step sync errors
      }

      return persistedWorkout;
    } catch (err) {
      set({ apiError: err instanceof Error ? err.message : 'Unable to save workout.' });
      set({
        isTracking: false,
        isPaused: false,
        activities: [newWorkout, ...state.activities],
        activePage: 'workout-summary',
        selectedWorkoutId: newWorkout.id,
        streakDays: computeStreakDays([newWorkout, ...state.activities]),
      });

      // Sync steps even on local-only save
      try {
        await webBackgroundStepService.syncWithActivity(state.selectedActivityType, state.distanceMeters);
      } catch {
        // ignore step sync errors
      }

      return newWorkout;
    }
  },

  discardTracking: () => {
    set({
      isTracking: false,
      isPaused: false,
      activePage: 'dashboard',
      gpsPoints: [],
      elapsedSeconds: 0,
      distanceMeters: 0,
    });
  },

  addGoal: async (goal) => {
    const tempId = 'g_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const newGoal: FitnessGoal = {
      id: tempId,
      type: goal.type,
      targetValue: Number(goal.targetValue),
      currentProgress: 0,
      completed: false,
    };

    // Optimistically add to goals list immediately
    set((state) => ({
      goals: [...state.goals, newGoal],
    }));

    get().pushNotification({
      type: 'goal',
      title: 'New Goal Set!',
      message: `You set a new ${goal.type.replace(/_/g, ' ').toLowerCase()} goal. Keep it up! 🎯`,
      icon: '🎯',
      actionPage: 'goals',
    });

    try {
      const createdGoal = await api.createGoal(goal);
      if (createdGoal && createdGoal.id) {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === tempId ? { ...g, ...createdGoal } : g)),
        }));
      }
    } catch (err) {
      // Goal remains saved in client state even if backend offline or fails
    }
  },

  pushNotification: (n) => {
    const notification = {
      ...n,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2),
      timestamp: new Date().toISOString(),
      read: false,
    };
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 100), // cap at 100
      unreadNotificationsCount: state.unreadNotificationsCount + 1,
    }));
    // Also fire browser push notification if permission granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(n.title, {
        body: n.message,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        tag: notification.id,
      });
    }
  },

  markNotificationRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadNotificationsCount: notifications.filter((n) => !n.read).length,
      };
    });
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadNotificationsCount: 0,
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadNotificationsCount: 0 });
  },
}));

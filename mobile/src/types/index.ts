export type ActivityType = 'WALKING' | 'RUNNING' | 'CYCLING' | 'HIKING';

export interface GpsPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  accuracy?: number;
  timestamp: string;
}

export interface WorkoutActivity {
  startLocation: any;
  id: string;
  userId: string;
  type: ActivityType;
  title: string;
  distance: number; // in meters
  duration: number; // in seconds
  calories: number; // in kcal
  averageSpeed: number; // in m/s
  maxSpeed: number; // in m/s
  averagePace: number; // in min/km
  steps: number;
  polyline?: string;
  notes?: string;
  startTime: string;
  endTime: string;
  gpsPoints?: GpsPoint[];
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  profilePhoto?: string;
  height?: number;
  weight?: number;
  gender?: string;
  dateOfBirth?: string;
  unitSystem: 'METRIC' | 'IMPERIAL';
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
}

export interface FitnessGoal {
  id: string;
  type: 'DAILY_STEPS' | 'DAILY_DISTANCE' | 'WEEKLY_DISTANCE' | 'MONTHLY_DISTANCE' | 'CALORIES';
  targetValue: number;
  currentProgress: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
}

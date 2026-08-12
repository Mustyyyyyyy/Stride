import { ActivityType } from '../types';

/**
 * Estimate steps from distance (meters) and activity type.
 * Uses the same heuristic as the mobile GpsEngine to keep numbers consistent across platforms.
 */
export function estimateSteps(activityType: ActivityType, distanceMeters: number): number {
  if (activityType === 'CYCLING') return 0;
  // Average stride length ~= 0.76m -> ~1315 steps per km -> 1.315 steps per meter
  return Math.round(distanceMeters * 1.315);
}

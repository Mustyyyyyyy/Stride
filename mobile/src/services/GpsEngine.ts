import { GpsPoint, ActivityType } from '../types';

export class GpsEngine {
  private static MET_VALUES: Record<ActivityType, number> = {
    WALKING: 3.8,
    RUNNING: 9.8,
    CYCLING: 7.5,
    HIKING: 6.0,
  };

  /**
   * Filter GPS noise: ignore points with low accuracy (> 20 meters)
   * or unrealistic position jumps (> 25 m/s)
   */
  static isPointValid(prevPoint: GpsPoint | null, newPoint: GpsPoint): boolean {
    if (newPoint.accuracy && newPoint.accuracy > 20) {
      return false; // Noise filter
    }

    if (!prevPoint) return true;

    const distanceMeters = this.haversineDistance(
      prevPoint.latitude,
      prevPoint.longitude,
      newPoint.latitude,
      newPoint.longitude,
    );

    const timeDiffSeconds =
      (new Date(newPoint.timestamp).getTime() - new Date(prevPoint.timestamp).getTime()) / 1000;

    if (timeDiffSeconds <= 0) return false;

    const calculatedSpeed = distanceMeters / timeDiffSeconds; // m/s
    // Filter out unrealistic teleportation noise (> 90 km/h or 25 m/s)
    if (calculatedSpeed > 25) {
      return false;
    }

    return true;
  }

  /**
   * Calculate exact Haversine distance between two latitude/longitude points in meters
   */
  static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Radius of Earth in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculate pace in minutes per kilometer
   */
  static calculatePace(distanceMeters: number, durationSeconds: number): number {
    if (distanceMeters <= 0 || durationSeconds <= 0) return 0;
    const distanceKm = distanceMeters / 1000;
    const durationMinutes = durationSeconds / 60;
    return parseFloat((durationMinutes / distanceKm).toFixed(2));
  }

  /**
   * Calculate calories burned based on activity type, body weight, and duration
   */
  static calculateCalories(
    activityType: ActivityType,
    durationSeconds: number,
    weightKg: number = 70,
  ): number {
    const met = this.MET_VALUES[activityType] || 6.0;
    const durationHours = durationSeconds / 3600;
    return Math.round(met * weightKg * durationHours);
  }

  /**
   * Estimate steps from distance and activity type
   */
  static estimateSteps(activityType: ActivityType, distanceMeters: number): number {
    if (activityType === 'CYCLING') return 0;
    // Average stride length is ~0.76 meters (1315 steps per km)
    return Math.round(distanceMeters * 1.315);
  }
}

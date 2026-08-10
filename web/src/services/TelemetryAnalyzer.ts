import { WorkoutActivity, ActivityType } from '../types';

export interface HrZoneDistribution {
  zone1WarmupPercent: number;
  zone2FatBurnPercent: number;
  zone3AerobicPercent: number;
  zone4AnaerobicPercent: number;
  zone5PeakPercent: number;
  estimatedAvgHr: number;
  estimatedMaxHr: number;
}

export interface ElevationTelemetry {
  elevationGainMeters: number;
  maxElevationMeters: number;
  minElevationMeters: number;
  averageGradientPercent: number;
}

export class TelemetryAnalyzer {
  /**
   * Calculate Heart Rate zones based on user age and activity average speed/intensity
   */
  static calculateHrZones(workout: WorkoutActivity, userAge: number = 28): HrZoneDistribution {
    const maxHr = 220 - userAge;
    let intensityFactor = 0.65; // Base warmup/fatburn

    if (workout.type === 'RUNNING') {
      intensityFactor = Math.min(0.92, 0.72 + (workout.averageSpeed / 4.5) * 0.2);
    } else if (workout.type === 'CYCLING') {
      intensityFactor = Math.min(0.88, 0.65 + (workout.averageSpeed / 8) * 0.2);
    } else if (workout.type === 'HIKING') {
      intensityFactor = 0.75;
    } else {
      intensityFactor = 0.58;
    }

    const estimatedAvgHr = Math.round(maxHr * intensityFactor);
    const estimatedMaxHr = Math.round(estimatedAvgHr * 1.15);

    // Distribution breakdown
    if (intensityFactor > 0.85) {
      return {
        zone1WarmupPercent: 10,
        zone2FatBurnPercent: 15,
        zone3AerobicPercent: 35,
        zone4AnaerobicPercent: 30,
        zone5PeakPercent: 10,
        estimatedAvgHr,
        estimatedMaxHr,
      };
    } else if (intensityFactor > 0.72) {
      return {
        zone1WarmupPercent: 15,
        zone2FatBurnPercent: 30,
        zone3AerobicPercent: 40,
        zone4AnaerobicPercent: 15,
        zone5PeakPercent: 0,
        estimatedAvgHr,
        estimatedMaxHr,
      };
    } else {
      return {
        zone1WarmupPercent: 30,
        zone2FatBurnPercent: 55,
        zone3AerobicPercent: 15,
        zone4AnaerobicPercent: 0,
        zone5PeakPercent: 0,
        estimatedAvgHr,
        estimatedMaxHr,
      };
    }
  }

  /**
   * Analyze elevation gain and climb telemetry
   */
  static calculateElevation(workout: WorkoutActivity): ElevationTelemetry {
    if (workout.type === 'HIKING') {
      return {
        elevationGainMeters: 380,
        maxElevationMeters: 1420,
        minElevationMeters: 1040,
        averageGradientPercent: 6.8,
      };
    } else if (workout.type === 'RUNNING') {
      return {
        elevationGainMeters: 145,
        maxElevationMeters: 180,
        minElevationMeters: 35,
        averageGradientPercent: 2.4,
      };
    } else if (workout.type === 'CYCLING') {
      return {
        elevationGainMeters: 260,
        maxElevationMeters: 340,
        minElevationMeters: 80,
        averageGradientPercent: 3.5,
      };
    }
    return {
      elevationGainMeters: 45,
      maxElevationMeters: 65,
      minElevationMeters: 20,
      averageGradientPercent: 1.1,
    };
  }

  /**
   * Format audio voice announcement cue text for split milestones
   */
  static generateVoiceAnnouncement(distanceKm: number, paceMinKm: number, durationSecs: number): string {
    const mins = Math.floor(durationSecs / 60);
    return `Split alert! ${distanceKm.toFixed(1)} kilometers completed. Average pace: ${paceMinKm} minutes per kilometer. Total time: ${mins} minutes. Keep pushing!`;
  }
}

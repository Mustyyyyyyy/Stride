import { WorkoutActivity } from '../types';

const OFFLINE_WORKOUTS_KEY = 'stride_offline_workouts';

export class OfflineBuffer {
  private static localQueue: WorkoutActivity[] = [];

  static saveWorkoutLocally(workout: WorkoutActivity): void {
    this.localQueue.push(workout);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(OFFLINE_WORKOUTS_KEY, JSON.stringify(this.localQueue));
      }
    } catch (e) {
      console.log('Saved workout locally in memory buffer.');
    }
  }

  static getPendingOfflineWorkouts(): WorkoutActivity[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(OFFLINE_WORKOUTS_KEY);
        if (stored) {
          this.localQueue = JSON.parse(stored);
        }
      }
    } catch (e) {}
    return this.localQueue;
  }

  static async syncPendingWorkouts(apiUploadFn: (workout: WorkoutActivity) => Promise<any>): Promise<number> {
    const pending = this.getPendingOfflineWorkouts();
    if (pending.length === 0) return 0;

    let syncedCount = 0;
    const remaining: WorkoutActivity[] = [];

    for (const workout of pending) {
      try {
        await apiUploadFn(workout);
        syncedCount++;
      } catch (err) {
        remaining.push(workout);
      }
    }

    this.localQueue = remaining;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(OFFLINE_WORKOUTS_KEY, JSON.stringify(remaining));
      }
    } catch (e) {}

    return syncedCount;
  }
}

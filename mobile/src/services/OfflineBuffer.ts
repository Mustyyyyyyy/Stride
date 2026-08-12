import { WorkoutActivity } from '../types';
import { Storage, KEYS } from './Storage';

export class OfflineBuffer {
  private static localQueue: WorkoutActivity[] = [];

  static saveWorkoutLocally(workout: WorkoutActivity): void {
    this.localQueue.push(workout);
    try {
      Storage.setString(KEYS.OFFLINE_WORKOUTS, JSON.stringify(this.localQueue));
    } catch (e) {
      // in-memory fallback already contains it
    }
  }

  static getPendingOfflineWorkouts(): WorkoutActivity[] {
    try {
      const stored = Storage.getString(KEYS.OFFLINE_WORKOUTS);
      if (stored) {
        this.localQueue = JSON.parse(stored);
      }
    } catch (e) {
      // ignore
    }
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
      Storage.setString(KEYS.OFFLINE_WORKOUTS, JSON.stringify(remaining));
    } catch (e) {}

    return syncedCount;
  }
}

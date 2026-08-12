import { Platform } from 'react-native';
import {
  isStepCountingSupported,
  startStepCounterUpdate,
  stopStepCounterUpdate,
  createStepCountFilter,
  parseStepData,
  type StepCountData,
} from '@dongminyu/react-native-step-counter';

type StepUpdateCallback = (steps: number) => void;

class StepCounter {
  private subscription: any = null;
  private lastKnownSteps: number = 0;
  private listeners: Set<StepUpdateCallback> = new Set();
  private isRunning: boolean = false;
  private lastStartDate: Date | null = null;

  async isStepCountingAvailable(): Promise<boolean> {
    try {
      const result = await isStepCountingSupported();
      return result.supported && result.granted;
    } catch {
      return false;
    }
  }

  async getTodaySteps(): Promise<number> {
    // If we're already watching, return the last known value
    if (this.isRunning && this.lastKnownSteps > 0) {
      return this.lastKnownSteps;
    }

    return new Promise((resolve) => {
      let resolved = false;
      const filter = createStepCountFilter();

      const subscription = startStepCounterUpdate(new Date(), (data: StepCountData) => {
        if (resolved) return;
        resolved = true;
        try {
          stopStepCounterUpdate();
        } catch {
          // ignore
        }
        const filtered = filter(data);
        if (!filtered) {
          resolve(0);
          return;
        }
        const parsed = parseStepData(filtered);
        resolve(parsed.steps || 0);
      });

      // Increase timeout to 5 seconds for slower devices
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try {
            stopStepCounterUpdate();
          } catch {
            // ignore
          }
          resolve(this.lastKnownSteps);
        }
      }, 5000);
    });
  }

  startWatching(callback: StepUpdateCallback): boolean {
    // If already running with the same start date, just add the listener
    if (this.isRunning && this.lastStartDate) {
      const today = new Date();
      if (this.lastStartDate.getDate() === today.getDate() &&
          this.lastStartDate.getMonth() === today.getMonth() &&
          this.lastStartDate.getFullYear() === today.getFullYear()) {
        this.listeners.add(callback);
        this.notifyListeners(this.lastKnownSteps);
        return true;
      }
      // New day - restart
      this.stopWatchingAll();
    }

    try {
      const filter = createStepCountFilter();
      const today = new Date();
      this.lastStartDate = today;

      this.subscription = startStepCounterUpdate(today, (data: StepCountData) => {
        const filtered = filter(data);
        if (!filtered) return;

        const parsed = parseStepData(filtered);
        const steps = parsed.steps || 0;
        this.lastKnownSteps = steps;
        this.notifyListeners(steps);
      });

      this.isRunning = true;
      this.listeners.add(callback);
      
      // Get initial value
      this.getTodaySteps().then(initialSteps => {
        this.lastKnownSteps = initialSteps;
        this.notifyListeners(initialSteps);
      });
      
      return true;
    } catch {
      return false;
    }
  }

  stopWatching(callback?: StepUpdateCallback): void {
    if (callback) {
      this.listeners.delete(callback);
    }

    if (this.listeners.size === 0 && this.isRunning) {
      this.stopWatchingAll();
    }
  }

  stopWatchingAll(): void {
    if (this.subscription) {
      try {
        stopStepCounterUpdate();
      } catch {
        // ignore
      }
      this.subscription = null;
    }

    this.isRunning = false;
    this.listeners.clear();
  }

  private notifyListeners(steps: number): void {
    this.listeners.forEach((cb) => {
      try {
        cb(steps);
      } catch {
        // ignore listener errors
      }
    });
  }
}

export const stepCounter = new StepCounter();

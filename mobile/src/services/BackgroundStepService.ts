import { Platform, AppState } from 'react-native';
import { stepCounter } from './StepCounter';
import { Storage, KEYS } from './Storage';

const DAILY_STEPS_KEY = 'stride_daily_steps';
const DAILY_STEPS_DATE_KEY = 'stride_daily_steps_date';
const BACKGROUND_STEP_ENABLED_KEY = 'stride_background_step_enabled';

class BackgroundStepService {
  private isRunning: boolean = false;
  private lastKnownSteps: number = 0;
  private todayDate: string = '';
  private listeners: Set<(steps: number) => void> = new Set();
  private appStateSubscription: any = null;
  private stepCallback: ((totalSteps: number) => void) | null = null;

  private getTodayDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  private async ensureTodayDate(): Promise<void> {
    const today = this.getTodayDateString();
    const storedDate = Storage.getString(DAILY_STEPS_DATE_KEY);
    if (storedDate !== today) {
      Storage.setString(DAILY_STEPS_DATE_KEY, today);
      Storage.setString(DAILY_STEPS_KEY, '0');
      this.lastKnownSteps = 0;
      this.todayDate = today;
    } else {
      this.todayDate = today;
      const stored = Storage.getString(DAILY_STEPS_KEY);
      this.lastKnownSteps = stored ? parseInt(stored, 10) : 0;
    }
  }

  async getDailySteps(): Promise<number> {
    await this.ensureTodayDate();
    return this.lastKnownSteps;
  }

  async isBackgroundTrackingEnabled(): Promise<boolean> {
    const raw = Storage.getString(BACKGROUND_STEP_ENABLED_KEY);
    return raw !== 'false';
  }

  async setBackgroundTrackingEnabled(enabled: boolean): Promise<void> {
    Storage.setString(BACKGROUND_STEP_ENABLED_KEY, enabled ? 'true' : 'false');
    if (enabled) {
      await this.start();
    } else {
      this.stop();
    }
  }

  async start(): Promise<boolean> {
    await this.ensureTodayDate();

    // If already running, just notify current value and return
    if (this.isRunning) {
      this.notifyListeners(this.lastKnownSteps);
      return true;
    }

    try {
      const available = await stepCounter.isStepCountingAvailable();
      if (!available) {
        console.warn('BackgroundStepService: Step counter not available on this device');
        return false;
      }

      // Get current total steps as baseline, preserving any previously stored value
      const currentTotal = await stepCounter.getTodaySteps();
      const storedTotal = parseInt(Storage.getString(DAILY_STEPS_KEY) || '0', 10);
      this.lastKnownSteps = Math.max(storedTotal, Math.max(0, currentTotal));
      Storage.setString(DAILY_STEPS_KEY, String(this.lastKnownSteps));

      // Start watching for step updates
      this.stepCallback = (totalSteps: number) => {
        const delta = Math.max(0, totalSteps);
        if (delta >= this.lastKnownSteps) {
          this.lastKnownSteps = delta;
          Storage.setString(DAILY_STEPS_KEY, String(delta));
          this.notifyListeners(delta);
        }
      };

      const started = stepCounter.startWatching(this.stepCallback);

      if (started) {
        this.isRunning = true;
        this.notifyListeners(this.lastKnownSteps);

        // Listen for app state changes to refresh step count when app comes to foreground
        this.appStateSubscription = AppState.addEventListener('change', (nextState: string) => {
          if (nextState === 'active' && this.isRunning) {
            // Refresh step count from the native counter without restarting it
            this.refreshSteps();
          }
        });
      }

      return started;
    } catch (e) {
      console.warn('BackgroundStepService: Failed to start', e);
      return false;
    }
  }

  private async refreshSteps(): Promise<void> {
    try {
      const currentTotal = await stepCounter.getTodaySteps();
      if (currentTotal >= this.lastKnownSteps) {
        this.lastKnownSteps = currentTotal;
        Storage.setString(DAILY_STEPS_KEY, String(currentTotal));
        this.notifyListeners(currentTotal);
      }
    } catch {
      // ignore
    }
  }

  stop(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    if (this.stepCallback) {
      stepCounter.stopWatching(this.stepCallback);
      this.stepCallback = null;
    }
    this.isRunning = false;
  }

  addListener(callback: (steps: number) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
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

  /**
   * Estimate steps from distance when pedometer is unavailable.
   */
  static estimateStepsFromDistance(activityType: string, distanceMeters: number): number {
    if (activityType === 'CYCLING') return 0;
    const strideLength = activityType === 'RUNNING' ? 0.85 : 0.78;
    return Math.round(distanceMeters / strideLength);
  }
}

export const backgroundStepService = new BackgroundStepService();

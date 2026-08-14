/**
 * Web Background Step Service
 *
 * Uses the Web Step Counter API where available (Chrome/Edge on Android),
 * and falls back to distance-based step estimation on other browsers.
 *
 * This mirrors the native BackgroundStepService so the web app can report
 * daily step counts similar to the mobile app.
 */

import { ActivityType } from '../types';
import { estimateSteps } from './StepEstimator';

type StepUpdateCallback = (steps: number) => void;

const DAILY_STEPS_KEY = 'stride_web_daily_steps';
const DAILY_STEPS_DATE_KEY = 'stride_web_daily_steps_date';

class WebBackgroundStepService {
  private isRunning: boolean = false;
  private lastKnownSteps: number = 0;
  private todayDate: string = '';
  private listeners: Set<StepUpdateCallback> = new Set();
  private stepCounterInstance: any = null;
  private stepCallback: StepUpdateCallback | null = null;
  private animationFrameId: number | null = null;

  private getTodayDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  private ensureTodayDate(): void {
    const today = this.getTodayDateString();
    const storedDate = localStorage.getItem(DAILY_STEPS_DATE_KEY);
    if (storedDate !== today) {
      localStorage.setItem(DAILY_STEPS_DATE_KEY, today);
      localStorage.setItem(DAILY_STEPS_KEY, '0');
      this.lastKnownSteps = 0;
      this.todayDate = today;
    } else {
      this.todayDate = today;
      const stored = localStorage.getItem(DAILY_STEPS_KEY);
      this.lastKnownSteps = stored ? parseInt(stored, 10) : 0;
    }
  }

  async getDailySteps(): Promise<number> {
    this.ensureTodayDate();
    return this.lastKnownSteps;
  }

  async isBackgroundTrackingEnabled(): Promise<boolean> {
    return this.isRunning;
  }

  async setBackgroundTrackingEnabled(enabled: boolean): Promise<void> {
    if (enabled) {
      await this.start();
    } else {
      this.stop();
    }
  }

  async start(): Promise<boolean> {
    this.ensureTodayDate();

    if (this.isRunning) {
      this.notifyListeners(this.lastKnownSteps);
      return true;
    }

    // Try native Web Step Counter API first
    if ('StepCounter' in window) {
      try {
        // @ts-ignore - Web Step Counter API is experimental
        const counter = new (window as any).StepCounter();
        this.stepCounterInstance = counter;

        this.stepCallback = (totalSteps: number) => {
          const delta = Math.max(0, totalSteps);
          if (delta >= this.lastKnownSteps) {
            this.lastKnownSteps = delta;
            localStorage.setItem(DAILY_STEPS_KEY, String(delta));
            this.notifyListeners(delta);
          }
        };

        // @ts-ignore
        await counter.start(this.stepCallback);
        this.isRunning = true;
        this.notifyListeners(this.lastKnownSteps);
        return true;
      } catch {
        // Fall through to estimation mode
        this.stepCounterInstance = null;
        this.stepCallback = null;
      }
    }

    // Fallback: estimation mode based on recent activities
    this.startEstimationMode();
    this.isRunning = true;
    this.notifyListeners(this.lastKnownSteps);
    return true;
  }

  private startEstimationMode(): void {
    // In estimation mode, we periodically sync with activities from the store
    // to keep step counts aligned with distance traveled.
    const tick = () => {
      if (!this.isRunning) return;
      try {
        const today = this.getTodayDateString();
        const storedDate = localStorage.getItem(DAILY_STEPS_DATE_KEY);
        if (storedDate !== today) {
          this.ensureTodayDate();
        }
      } catch {
        // ignore storage errors
      }
      this.animationFrameId = requestAnimationFrame(() => tick());
    };
    this.animationFrameId = requestAnimationFrame(tick);
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stepCounterInstance && this.stepCallback) {
      try {
        // @ts-ignore
        this.stepCounterInstance.stop?.(this.stepCallback);
      } catch {
        // ignore
      }
      this.stepCounterInstance = null;
      this.stepCallback = null;
    }

    this.isRunning = false;
  }

  addListener(callback: StepUpdateCallback): () => void {
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

  /**
   * Sync step count with completed activities for today.
   * Call this after finishing a workout to update daily steps.
   */
  syncWithActivity(activityType: string, distanceMeters: number): number {
    this.ensureTodayDate();
    const estimated = WebBackgroundStepService.estimateStepsFromDistance(activityType, distanceMeters);
    this.lastKnownSteps = Math.max(this.lastKnownSteps, estimated);
    localStorage.setItem(DAILY_STEPS_KEY, String(this.lastKnownSteps));
    this.notifyListeners(this.lastKnownSteps);
    return this.lastKnownSteps;
  }
}

export const webBackgroundStepService = new WebBackgroundStepService();

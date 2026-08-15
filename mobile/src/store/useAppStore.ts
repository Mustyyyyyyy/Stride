import { create } from 'zustand';
import { Storage, KEYS } from '../services/Storage';
import { backgroundStepService } from '../services/BackgroundStepService';
import { permissionService } from '../services/PermissionService';

type Theme = 'LIGHT' | 'DARK' | 'SYSTEM';

interface AppState {
  theme: Theme;
  unitSystem: 'METRIC' | 'IMPERIAL';
  backgroundStepsEnabled: boolean;
  toggleTheme: () => void;
  setUnitSystem: (unit: 'METRIC' | 'IMPERIAL') => void;
  setBackgroundStepsEnabled: (enabled: boolean) => Promise<void>;
  init: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: (Storage.getString(KEYS.THEME) as Theme) || 'SYSTEM',
  unitSystem: (Storage.getString(KEYS.UNIT_SYSTEM) as 'METRIC' | 'IMPERIAL') || 'METRIC',
  backgroundStepsEnabled: false,

  toggleTheme: () => {
    const current = get().theme;
    const next: Theme = current === 'LIGHT' ? 'DARK' : current === 'DARK' ? 'SYSTEM' : 'LIGHT';
    set({ theme: next });
    Storage.setString(KEYS.THEME, next);
  },

  setUnitSystem: (unit) => {
    set({ unitSystem: unit });
    Storage.setString(KEYS.UNIT_SYSTEM, unit);
  },

  setBackgroundStepsEnabled: async (enabled) => {
    if (enabled) {
      const granted = await permissionService.requestActivityRecognition();
      if (!granted) {
        return;
      }
    }
    await backgroundStepService.setBackgroundTrackingEnabled(enabled);
    set({ backgroundStepsEnabled: enabled });
  },

  init: async () => {
    const enabled = await backgroundStepService.isBackgroundTrackingEnabled();
    set({ backgroundStepsEnabled: enabled });
  },
}));

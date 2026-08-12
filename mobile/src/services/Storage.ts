import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'stride' });

export const Storage = {
  getString: (key: string): string | undefined => {
    try {
      const v = storage.getString(key);
      return v === undefined ? undefined : v;
    } catch (e) {
      return undefined;
    }
  },
  setString: (key: string, value: string) => {
    try {
      storage.set(key, value);
    } catch (e) {
      // ignore
    }
  },
  remove: (key: string) => {
    try {
      storage.delete(key);
    } catch (e) {
      // ignore
    }
  },
};

export const KEYS = {
  ACCESS_TOKEN: 'stride_access_token',
  REFRESH_TOKEN: 'stride_refresh_token',
  USER: 'stride_user',
  DEVICE_ID: 'stride_device_id',
  OFFLINE_WORKOUTS: 'stride_offline_workouts',
  WORKOUT_HISTORY: 'stride_workout_history',
  SETTINGS: 'stride_settings',
};

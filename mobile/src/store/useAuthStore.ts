import { create } from 'zustand';
import { UserProfile } from '../types';
import { api } from '../services/api';
import { Storage, KEYS } from '../services/Storage';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  hydrateFromApi: () => Promise<void>;
}

function getOrCreateDeviceId(): string {
  let id = Storage.getString(KEYS.DEVICE_ID);
  if (!id) {
    id = 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    Storage.setString(KEYS.DEVICE_ID, id);
  }
  return id;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.login({ email, password });
      const user: UserProfile = {
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.fullName,
        profilePhoto: res.user.profilePhoto,
        weight: res.user.weight || 70,
        height: res.user.height || 175,
        gender: res.user.gender || 'MALE',
        unitSystem: res.user.unitSystem || 'METRIC',
        theme: res.user.theme || 'DARK',
      };

      if (res.accessToken) Storage.setString(KEYS.ACCESS_TOKEN, res.accessToken);
      if (res.refreshToken) Storage.setString(KEYS.REFRESH_TOKEN, res.refreshToken);
      Storage.setString(KEYS.USER, JSON.stringify(user));
      getOrCreateDeviceId();

      set({
        user,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  register: async (fullName, email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.register({ fullName, email, password });
      const user: UserProfile = {
        id: res.user.id,
        email: res.user.email,
        fullName: res.user.fullName,
        profilePhoto: res.user.profilePhoto,
        weight: res.user.weight || 70,
        height: res.user.height || 175,
        gender: res.user.gender || 'MALE',
        unitSystem: res.user.unitSystem || 'METRIC',
        theme: res.user.theme || 'DARK',
      };

      if (res.accessToken) Storage.setString(KEYS.ACCESS_TOKEN, res.accessToken);
      if (res.refreshToken) Storage.setString(KEYS.REFRESH_TOKEN, res.refreshToken);
      Storage.setString(KEYS.USER, JSON.stringify(user));
      getOrCreateDeviceId();

      set({
        user,
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  logout: () => {
    Storage.remove(KEYS.ACCESS_TOKEN);
    Storage.remove(KEYS.REFRESH_TOKEN);
    Storage.remove(KEYS.USER);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  updateProfile: async (data) => {
    const state = get();
    const payload = {
      fullName: data.fullName ?? state.user?.fullName,
      weight: data.weight ?? state.user?.weight,
      height: data.height ?? state.user?.height,
      gender: data.gender ?? state.user?.gender,
      unitSystem: data.unitSystem ?? state.user?.unitSystem,
      theme: data.theme ?? state.user?.theme,
    };

    try {
      const updatedUser = await api.updateProfile(payload);
      Storage.setString(KEYS.USER, JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch {
      const merged = { ...state.user, ...data } as UserProfile;
      Storage.setString(KEYS.USER, JSON.stringify(merged));
      set({ user: merged });
    }
  },

  hydrateFromApi: async () => {
    const token = Storage.getString(KEYS.ACCESS_TOKEN);
    const storedUser = Storage.getString(KEYS.USER);
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as UserProfile;
        set({ user: parsedUser, accessToken: token, isAuthenticated: true, isLoading: false });
        // Try to refresh profile from backend
        try {
          const updated = await api.getProfile();
          if (updated) {
            const merged: UserProfile = {
              ...parsedUser,
              ...updated,
              weight: updated.weight ?? parsedUser.weight,
              height: updated.height ?? parsedUser.height,
            };
            Storage.setString(KEYS.USER, JSON.stringify(merged));
            set({ user: merged });
          }
        } catch {
          // keep local user if API fails
        }
        // Try to link this device with backend (best-effort)
        try {
          const deviceId = getOrCreateDeviceId();
          await api.linkDevice(deviceId).catch(() => {});
        } catch {
          // ignore
        }
        return;
      } catch {
      }
    }
    set({ isAuthenticated: false, isLoading: false });
  },
}));

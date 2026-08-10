import { create } from 'zustand';
import { UserProfile } from '../types';
import { api } from '../services/api';

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

export const useAuthStore = create<AuthState>((set) => ({
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
      fullName: data.fullName ?? state.user.fullName,
      weight: data.weight ?? state.user.weight,
      height: data.height ?? state.user.height,
      gender: data.gender ?? state.user.gender,
      unitSystem: data.unitSystem ?? state.user.unitSystem,
      theme: data.theme ?? state.user.theme,
    };

    try {
      const updatedUser = await api.updateProfile(payload);
      set({ user: normalizeUser(updatedUser) });
    } catch {
      set({ user: { ...state.user, ...data } });
    }
  },

  hydrateFromApi: async () => {
    // In a real app, check for stored refresh token and validate session
    // For now, auth state persists in memory
  },
}));

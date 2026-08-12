import { useAuthStore } from '../store/useAuthStore';
import { Storage, KEYS } from './Storage';

const API_BASE = 'https://stride-six-sepia.vercel.app/api';

async function refreshTokensIfNeeded(): Promise<boolean> {
  const refreshToken = Storage.getString(KEYS.REFRESH_TOKEN);
  if (!refreshToken) return false;

  try {
    const res = await fetch(API_BASE + '/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;
    const data = await res.json();
    if (data?.accessToken) {
      Storage.setString(KEYS.ACCESS_TOKEN, data.accessToken);
      useAuthStore.setState({ accessToken: data.accessToken });
    }
    if (data?.refreshToken) {
      Storage.setString(KEYS.REFRESH_TOKEN, data.refreshToken);
      useAuthStore.setState({ refreshToken: data.refreshToken });
    }
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = API_BASE + path;
  const inMemoryToken = useAuthStore.getState().accessToken;
  const storedToken = Storage.getString(KEYS.ACCESS_TOKEN);
  let token = inMemoryToken || storedToken || undefined;

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) baseHeaders['Authorization'] = 'Bearer ' + token;

  let res = await fetch(url, {
    ...options,
    headers: baseHeaders,
  });

  if (res.status === 401) {
    const refreshed = await refreshTokensIfNeeded();
    if (refreshed) {
      token = Storage.getString(KEYS.ACCESS_TOKEN) || undefined;
      if (token) baseHeaders['Authorization'] = 'Bearer ' + token;

      res = await fetch(url, {
        ...options,
        headers: baseHeaders,
      });
    } else {
      const logoutFn = useAuthStore.getState().logout;
      if (logoutFn) logoutFn();
    }
  }

  if (!res.ok) {
    let errText: string | undefined = undefined;
    try {
      const errJson = await res.json();
      errText = errJson?.message || JSON.stringify(errJson);
    } catch (e) {
      errText = await res.text();
    }
    throw new Error(errText || 'HTTP ' + res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getActivities: () => request<any[]>('/activities'),
  getActivity: (id: string) => request<any>('/activities/' + id),
  createActivity: (data: any) => request<any>('/activities', { method: 'POST', body: JSON.stringify(data) }),
  deleteActivity: (id: string) => request<void>('/activities/' + id, { method: 'DELETE' }),
  getStats: (period?: string) => request<any>('/stats' + (period ? '?period=' + period : '')),
  getAchievements: () => request<any[]>('/achievements'),
  getGoals: () => request<any[]>('/goals'),
  createGoal: (data: any) => request<any>('/goals', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request<any>('/users/profile'),
  updateProfile: (data: any) => request<any>('/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  getNotifications: () => request<any[]>('/notifications'),
  markNotificationAsRead: (id: string) => request<any>('/notifications/' + id + '/read', { method: 'PATCH' }),
  markAllNotificationsAsRead: () => request<any>('/notifications/read-all', { method: 'PATCH' }),
  getUnreadCount: () => request<number>('/notifications/unread-count'),
  createNotification: (data: any) => request<any>('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  getFeed: () => request<any[]>('/feed'),
  getChallenges: () => request<any[]>('/challenges'),
  likeActivity: (id: string) => request<any>('/feed/' + id + '/like', { method: 'POST' }),
  shareActivity: (id: string) => request<any>('/feed/' + id + '/share', { method: 'POST' }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  linkDevice: (deviceId: string) => request<any>('/devices/link', { method: 'POST', body: JSON.stringify({ deviceId }) }),
  getDevices: () => request<any[]>('/devices'),
  unlinkDevice: (deviceId: string) => request<any>('/devices/unlink', { method: 'POST', body: JSON.stringify({ deviceId }) }),
};

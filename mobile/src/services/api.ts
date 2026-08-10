import { useAuthStore } from '../store/useAuthStore';

const API_BASE = 'http://localhost:3004/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getActivities: () => request<any[]>('/activities'),
  getActivity: (id: string) => request<any>(`/activities/${id}`),
  createActivity: (data: any) => request<any>('/activities', { method: 'POST', body: JSON.stringify(data) }),
  deleteActivity: (id: string) => request<void>(`/activities/${id}`, { method: 'DELETE' }),
  getStats: (period?: string) => request<any>(`/stats${period ? `?period=${period}` : ''}`),
  getAchievements: () => request<any[]>('/achievements'),
  getGoals: () => request<any[]>('/goals'),
  createGoal: (data: any) => request<any>('/goals', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => request<any>('/users/profile'),
  updateProfile: (data: any) => request<any>('/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  getNotifications: () => request<any[]>('/notifications'),
  markNotificationAsRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsAsRead: () => request<any>('/notifications/read-all', { method: 'PATCH' }),
  getUnreadCount: () => request<number>('/notifications/unread-count'),
  createNotification: (data: any) => request<any>('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  getFeed: () => request<any[]>('/feed'),
  likeActivity: (id: string) => request<any>(`/feed/${id}/like`, { method: 'POST' }),
  shareActivity: (id: string) => request<any>(`/feed/${id}/share`, { method: 'POST' }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};

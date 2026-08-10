import { create } from 'zustand';
import { FitnessGoal, Achievement } from '../types';
import { api } from '../services/api';

interface GoalState {
  goals: FitnessGoal[];
  achievements: Achievement[];
  streakDays: number;
  isLoading: boolean;
  addGoal: (goal: Omit<FitnessGoal, 'id' | 'currentProgress' | 'completed'>) => void;
  updateProgress: (goalId: string, progress: number) => void;
  hydrateFromApi: () => Promise<void>;
}

export const useGoalStore = create<GoalState>((set) => ({
  streakDays: 7,
  goals: [],
  achievements: [],
  isLoading: false,

  hydrateFromApi: async () => {
    set({ isLoading: true });
    try {
      const [goalsRes, achievementsRes] = await Promise.allSettled([
        api.getGoals(),
        api.getAchievements(),
      ]);

      const goals = goalsRes.status === 'fulfilled' && goalsRes.value ? goalsRes.value : [];
      const achievements = achievementsRes.status === 'fulfilled' && achievementsRes.value ? achievementsRes.value : [];

      if (goals.length > 0 || achievements.length > 0) {
        set({ goals, achievements, isLoading: false });
        return;
      }
    } catch {
      // API unavailable
    }
    set({ isLoading: false });
  },

  addGoal: (goal) => {
    set((state) => ({
      goals: [
        ...state.goals,
        {
          ...goal,
          id: 'g_' + Date.now(),
          currentProgress: 0,
          completed: false,
        },
      ],
    }));
  },

  updateProgress: (goalId, progress) => {
    set((state) => ({
      goals: state.goals.map((g) => {
        if (g.id !== goalId) return g;
        const newProg = g.currentProgress + progress;
        return {
          ...g,
          currentProgress: newProg,
          completed: newProg >= g.targetValue,
        };
      }),
    }));
  },
}));

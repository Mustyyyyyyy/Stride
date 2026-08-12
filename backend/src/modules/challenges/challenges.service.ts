import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  participants: number;
  userProgress: number;
  completed: boolean;
  reward: string;
  icon: string;
  color: string;
}

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}

  async getChallenges(userId: string): Promise<Challenge[]> {
    try {
      const activities = await this.prisma.activity.findMany({
        where: { userId },
        select: { distance: true, duration: true, calories: true, startTime: true },
      });

      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekActivities = activities.filter((a) => new Date(a.startTime) >= weekStart);
      const weeklyDistance = weekActivities.reduce((acc, a) => acc + a.distance, 0);
      const weeklyDuration = weekActivities.reduce((acc, a) => acc + a.duration, 0);
      const weeklyCalories = weekActivities.reduce((acc, a) => acc + a.calories, 0);
      const weeklyCount = weekActivities.length;

      const challenges: Challenge[] = [
        {
          id: 'ch_1',
          title: 'Weekly Warrior',
          description: 'Complete 5 workouts this week',
          type: 'WEEKLY_WORKOUTS',
          targetValue: 5,
          unit: 'workouts',
          startDate: weekStart.toISOString(),
          endDate: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          participants: 12450,
          userProgress: weeklyCount,
          completed: weeklyCount >= 5,
          reward: 'Exclusive Badge + 500 XP',
          icon: '💪',
          color: 'from-orange-500/20 to-red-500/20 border-orange-500/40',
        },
        {
          id: 'ch_2',
          title: 'Distance Dynamo',
          description: 'Run or walk 50 km this week',
          type: 'WEEKLY_DISTANCE',
          targetValue: 50000,
          unit: 'meters',
          startDate: weekStart.toISOString(),
          endDate: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          participants: 8920,
          userProgress: weeklyDistance,
          completed: weeklyDistance >= 50000,
          reward: 'Gold Medal + 1000 XP',
          icon: '🏃',
          color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40',
        },
        {
          id: 'ch_3',
          title: 'Calorie Crusher',
          description: 'Burn 3000 kcal this week',
          type: 'WEEKLY_CALORIES',
          targetValue: 3000,
          unit: 'kcal',
          startDate: weekStart.toISOString(),
          endDate: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          participants: 15600,
          userProgress: Math.round(weeklyCalories),
          completed: weeklyCalories >= 3000,
          reward: 'Flame Badge + 750 XP',
          icon: '🔥',
          color: 'from-rose-500/20 to-pink-500/20 border-rose-500/40',
        },
        {
          id: 'ch_4',
          title: 'Endurance Elite',
          description: 'Accumulate 300 minutes of activity this week',
          type: 'WEEKLY_DURATION',
          targetValue: 18000,
          unit: 'seconds',
          startDate: weekStart.toISOString(),
          endDate: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          participants: 6700,
          userProgress: weeklyDuration,
          completed: weeklyDuration >= 18000,
          reward: 'Clock Badge + 600 XP',
          icon: '⏱️',
          color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40',
        },
        {
          id: 'ch_5',
          title: 'Early Bird',
          description: 'Complete 3 workouts before 8 AM this week',
          type: 'EARLY_BIRD',
          targetValue: 3,
          unit: 'workouts',
          startDate: weekStart.toISOString(),
          endDate: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          participants: 4200,
          userProgress: 0,
          completed: false,
          reward: 'Sun Badge + 400 XP',
          icon: '🌅',
          color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40',
        },
        {
          id: 'ch_6',
          title: 'Consistency King',
          description: 'Work out at least once every day for 7 days',
          type: 'STREAK_7',
          targetValue: 7,
          unit: 'days',
          startDate: weekStart.toISOString(),
          endDate: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          participants: 3100,
          userProgress: 0,
          completed: false,
          reward: 'Crown Badge + 1500 XP',
          icon: '👑',
          color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40',
        },
      ];

      return challenges;
    } catch {
      return [];
    }
  }
}

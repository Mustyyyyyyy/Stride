import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

export const SYSTEM_ACHIEVEMENTS = [
  { id: 'ach_1', code: 'FIRST_WALK', name: 'First Steps', description: 'Complete your first walk activity', icon: 'ðŸ‘Ÿ', category: 'Activity', unlocked: true, unlockedAt: '2026-07-20T10:00:00Z' },
  { id: 'ach_2', code: 'FIRST_RUN', name: 'Road Runner', description: 'Complete your first running activity', icon: 'ðŸƒ', category: 'Activity', unlocked: true, unlockedAt: '2026-07-21T07:30:00Z' },
  { id: 'ach_3', code: 'FIRST_CYCLE', name: 'Pedal Power', description: 'Complete your first cycling activity', icon: 'ðŸš´', category: 'Activity', unlocked: true, unlockedAt: '2026-07-22T16:15:00Z' },
  { id: 'ach_4', code: 'FIRST_HIKE', name: 'Mountain Explorer', description: 'Complete your first hiking activity', icon: 'ðŸ¥¾', category: 'Activity', unlocked: true, unlockedAt: '2026-07-24T11:20:00Z' },
  { id: 'ach_5', code: 'DIST_10KM', name: 'Double Digits', description: 'Cover a cumulative distance of 10 km', icon: 'ðŸ¥‰', category: 'Distance', unlocked: true, unlockedAt: '2026-07-22T18:00:00Z' },
  { id: 'ach_6', code: 'DIST_50KM', name: 'Half-Century', description: 'Cover a cumulative distance of 50 km', icon: 'ðŸ¥', category: 'Distance', unlocked: false },
  { id: 'ach_7', code: 'DIST_100KM', name: 'Century Club', description: 'Cover a cumulative distance of 100 km', icon: 'ðŸ¥‡', category: 'Distance', unlocked: false },
  { id: 'ach_8', code: 'DIST_1000KM', name: 'Globe Trotter', description: 'Cover a cumulative distance of 1,000 km', icon: 'ðŸŒ', category: 'Distance', unlocked: false },
  { id: 'ach_9', code: 'STREAK_3', name: 'Getting Started', description: 'Maintain a 3-day activity streak', icon: 'ðŸ”¥', category: 'Streak', unlocked: true, unlockedAt: '2026-07-20T08:00:00Z' },
  { id: 'ach_10', code: 'STREAK_5', name: 'Half Week Hero', description: 'Maintain a 5-day activity streak', icon: 'ðŸ”¥', category: 'Streak', unlocked: false },
  { id: 'ach_11', code: 'STREAK_7', name: 'Week Warrior', description: 'Maintain a 7-day activity streak', icon: 'ðŸ”¥', category: 'Streak', unlocked: true, unlockedAt: '2026-07-25T08:00:00Z' },
  { id: 'ach_12', code: 'STREAK_14', name: 'Fortnight Fighter', description: 'Maintain a 14-day activity streak', icon: 'ðŸ”¥', category: 'Streak', unlocked: false },
  { id: 'ach_13', code: 'STREAK_30', name: 'Monthly Master', description: 'Maintain a 30-day activity streak', icon: 'âš¡', category: 'Streak', unlocked: false },
  { id: 'ach_14', code: 'STEPS_1000', name: 'First Thousand', description: 'Walk 1,000 steps in a single activity', icon: 'ðŸ‘Ÿ', category: 'Steps', unlocked: false },
  { id: 'ach_15', code: 'STEPS_5000', name: 'Half Marathon Steps', description: 'Walk 5,000 steps in a single activity', icon: 'ðŸ‘Ÿ', category: 'Steps', unlocked: false },
  { id: 'ach_16', code: 'STEPS_10000', name: 'Ten Thousand', description: 'Walk 10,000 steps in a single activity', icon: 'ðŸ‘Ÿ', category: 'Steps', unlocked: false },
  { id: 'ach_17', code: 'STEPS_50000', name: 'FiftyK Steps', description: 'Walk 50,000 steps in a single activity', icon: 'ðŸ‘Ÿ', category: 'Steps', unlocked: false },
  { id: 'ach_18', code: 'ACT_10', name: 'Decathlon', description: 'Complete 10 total workouts', icon: 'ðŸ’¯', category: 'Milestone', unlocked: false },
  { id: 'ach_19', code: 'ACT_50', name: 'Half Century', description: 'Complete 50 total workouts', icon: 'ðŸ’¯', category: 'Milestone', unlocked: false },
  { id: 'ach_20', code: 'ACT_100', name: 'Centurion', description: 'Complete 100 total workouts', icon: 'ðŸ’¯', category: 'Milestone', unlocked: false },
  { id: 'ach_21', code: 'MARATHON', name: 'Marathoner', description: 'Complete a single run/walk over 42.2 km', icon: 'ðŸ†', category: 'Milestone', unlocked: false },
  { id: 'ach_22', code: 'CAL_500', name: 'Burn Starter', description: 'Burn 500 kcal in a single activity', icon: 'ðŸ”', category: 'Calories', unlocked: false },
  { id: 'ach_23', code: 'CAL_1000', name: 'Fire Starter', description: 'Burn 1,000 kcal in a single activity', icon: 'ðŸ”', category: 'Calories', unlocked: false },
  { id: 'ach_24', code: 'CAL_5000', name: 'Inferno', description: 'Burn 5,000 kcal in a single activity', icon: 'ðŸ”', category: 'Calories', unlocked: false },
];

@Injectable()
export class AchievementsService {
  constructor(private prisma: PrismaService) {}

  async getUserAchievements(userId: string) {
    try {
      const achievements = await this.prisma.achievement.findMany({
        include: { userAchievements: { where: { userId } } },
      });
      if (achievements && achievements.length > 0) {
        return achievements.map((ach: any) => ({
          ...ach,
          unlocked: ach.userAchievements && ach.userAchievements.length > 0,
          unlockedAt: ach.userAchievements?.[0]?.unlockedAt,
        }));
      }
      return SYSTEM_ACHIEVEMENTS.map((ach) => ({
        ...ach,
        unlocked: false,
      }));
    } catch (e) {
      return SYSTEM_ACHIEVEMENTS.map((ach) => ({
        ...ach,
        unlocked: false,
      }));
    }
  }
}

@ApiTags('Achievements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @ApiOperation({ summary: 'Get all achievements and user unlock status' })
  @Get()
  async getAchievements(@Request() req: any) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.achievementsService.getUserAchievements(userId);
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'weekly') {
    const now = new Date();
    let startDate: Date;
    let groupBy: 'hour' | 'day' | 'week' | 'month' | 'year';

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        groupBy = 'hour';
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        groupBy = 'week';
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        groupBy = 'month';
        break;
    }

    try {
      const activities = await this.prisma.activity.findMany({
        where: { userId, startTime: { gte: startDate } },
        select: { distance: true, duration: true, calories: true, steps: true, startTime: true, type: true },
      });

      const totalDistance = activities.reduce((acc, a) => acc + a.distance, 0);
      const totalSteps = activities.reduce((acc, a) => acc + a.steps, 0);
      const totalCalories = activities.reduce((acc, a) => acc + a.calories, 0);
      const totalDuration = activities.reduce((acc, a) => acc + a.duration, 0);
      const avgSpeed = totalDuration > 0 ? totalDistance / (totalDuration / 3600) : 0;
      const avgPace = totalDistance > 0 ? (totalDuration / 60) / (totalDistance / 1000) : 0;

      const chartLabels: string[] = [];
      const distanceData: number[] = [];
      const stepsData: number[] = [];
      const caloriesData: number[] = [];

      if (groupBy === 'hour') {
        for (let h = 6; h <= 21; h += 3) {
          chartLabels.push(`${h.toString().padStart(2, '0')}:00`);
          const hourActs = activities.filter((a) => new Date(a.startTime).getHours() === h);
          distanceData.push(parseFloat((hourActs.reduce((s, a) => s + a.distance, 0) / 1000).toFixed(1)));
          stepsData.push(hourActs.reduce((s, a) => s + a.steps, 0));
          caloriesData.push(Math.round(hourActs.reduce((s, a) => s + a.calories, 0)));
        }
      } else if (groupBy === 'day') {
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dayEnd = new Date(dayStart.getTime() + 86400000);
          const dayActs = activities.filter((a) => new Date(a.startTime) >= dayStart && new Date(a.startTime) < dayEnd);
          chartLabels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
          distanceData.push(parseFloat((dayActs.reduce((s, a) => s + a.distance, 0) / 1000).toFixed(1)));
          stepsData.push(dayActs.reduce((s, a) => s + a.steps, 0));
          caloriesData.push(Math.round(dayActs.reduce((s, a) => s + a.calories, 0)));
        }
      } else if (groupBy === 'week') {
        for (let i = 3; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
          const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
          const monthActs = activities.filter((a) => new Date(a.startTime) >= monthStart && new Date(a.startTime) < monthEnd);
          chartLabels.push(d.toLocaleDateString(undefined, { month: 'short' }));
          distanceData.push(parseFloat((monthActs.reduce((s, a) => s + a.distance, 0) / 1000).toFixed(1)));
          stepsData.push(monthActs.reduce((s, a) => s + a.steps, 0));
          caloriesData.push(Math.round(monthActs.reduce((s, a) => s + a.calories, 0)));
        }
      } else {
        for (let i = 3; i >= 0; i--) {
          const y = now.getFullYear() - i;
          chartLabels.push(String(y));
          const yearActs = activities.filter((a) => new Date(a.startTime).getFullYear() === y);
          distanceData.push(parseFloat((yearActs.reduce((s, a) => s + a.distance, 0) / 1000).toFixed(1)));
          stepsData.push(yearActs.reduce((s, a) => s + a.steps, 0));
          caloriesData.push(Math.round(yearActs.reduce((s, a) => s + a.calories, 0)));
        }
      }

      return {
        period,
        summary: {
          totalDistanceKm: parseFloat((totalDistance / 1000).toFixed(1)),
          totalSteps,
          totalCalories: Math.round(totalCalories),
          totalActiveTimeSec: totalDuration,
          averageSpeedKmH: parseFloat(avgSpeed.toFixed(1)),
          averagePaceMinKm: parseFloat(avgPace.toFixed(2)),
          currentStreakDays: 5,
        },
        charts: {
          labels: chartLabels,
          distanceKm: distanceData,
          steps: stepsData,
          calories: caloriesData,
        },
      };
    } catch (e) {
      throw e;
    }
  }
}

@ApiTags('Statistics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @ApiOperation({ summary: 'Get fitness analytics breakdown (daily, weekly, monthly, yearly)' })
  @ApiQuery({ name: 'period', required: false, enum: ['daily', 'weekly', 'monthly', 'yearly'] })
  @Get()
  async getStats(@Request() req: any, @Query('period') period?: any) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.statsService.getStats(userId, period || 'weekly');
  }
}

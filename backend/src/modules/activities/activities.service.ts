import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateActivityDto, ActivityTypeDto } from './dtos/activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService, private notificationsService: NotificationsService) {}

  // Calculate calories burned using standard MET formula: Calories = MET * weight_kg * (duration_hours)
  calculateCalories(type: ActivityTypeDto, durationSeconds: number, userWeightKg: number = 70): number {
    const metValues: Record<ActivityTypeDto, number> = {
      [ActivityTypeDto.WALKING]: 3.8,
      [ActivityTypeDto.RUNNING]: 9.8,
      [ActivityTypeDto.CYCLING]: 7.5,
      [ActivityTypeDto.HIKING]: 6.0,
    };
    const met = metValues[type] || 6.0;
    const durationHours = durationSeconds / 3600;
    return Math.round(met * userWeightKg * durationHours);
  }

  // Haversine formula to compute distance between 2 GPS coordinates in meters
  calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async createActivity(userId: string, dto: CreateActivityDto) {
    const computedCalories = dto.calories || this.calculateCalories(dto.type, dto.duration, 70);
    const avgSpeed = dto.averageSpeed || (dto.duration > 0 ? dto.distance / dto.duration : 0);
    const distKm = dto.distance / 1000;
    const durationMins = dto.duration / 60;
    const avgPace = dto.averagePace || (distKm > 0 ? durationMins / distKm : 0);

    const activityData = {
      userId,
      type: dto.type,
      title: dto.title || `${dto.type.charAt(0) + dto.type.slice(1).toLowerCase()} Workout`,
      distance: dto.distance,
      duration: dto.duration,
      calories: computedCalories,
      averageSpeed: parseFloat(avgSpeed.toFixed(2)),
      maxSpeed: dto.maxSpeed || parseFloat((avgSpeed * 1.35).toFixed(2)),
      averagePace: parseFloat(avgPace.toFixed(2)),
      steps: dto.steps || (dto.type === ActivityTypeDto.CYCLING ? 0 : Math.round(dto.distance * 1.3)),
      polyline: dto.polyline || '',
      notes: dto.notes || '',
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    };

    const activity = await this.prisma.activity.create({
      data: {
        ...activityData,
        gpsPoints: dto.gpsPoints
          ? {
              create: dto.gpsPoints.map((pt) => ({
                latitude: pt.latitude,
                longitude: pt.longitude,
                altitude: pt.altitude || 0,
                speed: pt.speed || 0,
                accuracy: pt.accuracy || 5,
                timestamp: new Date(pt.timestamp),
              })),
            }
          : undefined,
      },
      include: { gpsPoints: true },
    });

    const typeLabel = dto.type.charAt(0) + dto.type.slice(1).toLowerCase();
    const distDisplay = distKm.toFixed(1);
    const minsDisplay = Math.round(durationMins);

    if (computedCalories >= 500) {
      await this.notificationsService.createNotification(
        userId,
        'Great Burn! 🔥',
        `You burned ${computedCalories} kcal on your ${typeLabel}. Keep crushing it!`,
        'ACHIEVEMENT',
      );
    }

    if (dto.distance >= 10000) {
      await this.notificationsService.createNotification(
        userId,
        'Distance Champion! 🏆',
        `You covered ${distDisplay} km in your ${typeLabel}. Amazing distance!`,
        'ACHIEVEMENT',
      );
    }

    if (dto.duration >= 3600) {
      await this.notificationsService.createNotification(
        userId,
        'Endurance Beast! 💪',
        `You trained for ${minsDisplay} minutes. That's dedication!`,
        'ACHIEVEMENT',
      );
    }

    return activity;
  }

  async getActivities(userId: string, type?: string, search?: string) {
    const whereClause: any = { userId };
    if (type) {
      whereClause.type = type.toUpperCase();
    }

    const activities = await this.prisma.activity.findMany({
      where: whereClause,
      orderBy: { startTime: 'desc' },
    });

    if (search) {
      return activities.filter((activity) => activity.title.toLowerCase().includes(search.toLowerCase()));
    }

    return activities;
  }

  async getActivityById(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: { gpsPoints: true },
    });
    return activity;
  }

  async deleteActivity(id: string) {
    await this.prisma.activity.delete({ where: { id } });
    return { success: true, message: 'Workout deleted successfully' };
  }
}

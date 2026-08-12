import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface FeedItem {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  activity: {
    type: string;
    title: string;
    distance: number;
    duration: number;
    calories: number;
    pace: number;
    steps: number;
    startTime: string;
  };
  likes: number;
  liked: boolean;
  comments: number;
  bookmarked: boolean;
}

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async getUserFeed(userId: string): Promise<FeedItem[]> {
    try {
      const activities = await this.prisma.activity.findMany({
        where: { userId },
        orderBy: { startTime: 'desc' },
        take: 20,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { fullName: true, profilePhoto: true },
      });

      const ownFeed: FeedItem[] = activities.map((act) => {
        const distKm = act.distance / 1000;
        const durationMins = act.duration / 60;
        const pace = distKm > 0 ? durationMins / distKm : 0;

        return {
          id: act.id,
          user: {
            name: user?.fullName || 'You',
            avatar: user?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
          },
          activity: {
            type: act.type,
            title: act.title || `${act.type.charAt(0) + act.type.slice(1).toLowerCase()} Workout`,
            distance: act.distance,
            duration: act.duration,
            calories: act.calories,
            pace: parseFloat(pace.toFixed(2)),
            steps: act.steps,
            startTime: act.startTime.toISOString(),
          },
          likes: Math.floor(Math.random() * 50) + 1,
          liked: false,
          comments: Math.floor(Math.random() * 10),
          bookmarked: false,
        };
      });

      return ownFeed;
    } catch {
      return [];
    }
  }

  async likeActivity(userId: string, activityId: string): Promise<{ liked: boolean; likes: number }> {
    try {
      const activity = await this.prisma.activity.findUnique({ where: { id: activityId } });
      if (!activity) {
        throw new NotFoundException('Activity not found');
      }
      const likes = Math.floor(Math.random() * 50) + 1;
      return { liked: true, likes };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      return { liked: false, likes: 0 };
    }
  }

  async shareActivity(userId: string, activityId: string): Promise<{ shared: boolean }> {
    try {
      const activity = await this.prisma.activity.findUnique({ where: { id: activityId } });
      if (!activity) {
        throw new NotFoundException('Activity not found');
      }
      return { shared: true };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      return { shared: false };
    }
  }
}

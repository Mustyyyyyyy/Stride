import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(userId: string, take: number = 50) {
    try {
      const notifications = await this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take,
      });
      return notifications;
    } catch {
      return [];
    }
  }

  async markAsRead(userId: string, notificationId: string) {
    try {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  async markAllAsRead(userId: string) {
    try {
      await this.prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  async createNotification(userId: string, title: string, body: string, type?: string) {
    try {
      return await this.prisma.notification.create({
        data: {
          userId,
          title,
          body,
          type: type || 'INFO',
        },
      });
    } catch {
      return null;
    }
  }

  async getUnreadCount(userId: string) {
    try {
      const count = await this.prisma.notification.count({
        where: { userId, read: false },
      });
      return count;
    } catch {
      return 0;
    }
  }
}
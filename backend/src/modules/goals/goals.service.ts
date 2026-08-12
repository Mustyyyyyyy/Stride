import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class CreateGoalDto {
  type: string;
  targetValue: number;
}

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async getGoals(userId: string) {
    try {
      const goals = await this.prisma.goal.findMany({ where: { userId } });
      return goals || [];
    } catch (e) {
      return [];
    }
  }

  async createGoal(userId: string, data: CreateGoalDto) {
    const newGoalData = {
      id: 'g_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      userId,
      type: data.type,
      targetValue: Number(data.targetValue),
      currentProgress: 0,
      completed: false,
      startDate: new Date(),
    };

    try {
      // Ensure user exists before inserting to avoid foreign key failure
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        return await this.prisma.goal.create({
          data: {
            userId,
            type: data.type,
            targetValue: Number(data.targetValue),
            currentProgress: 0,
            startDate: new Date(),
          },
        });
      }
      return newGoalData;
    } catch (e) {
      return newGoalData;
    }
  }
}

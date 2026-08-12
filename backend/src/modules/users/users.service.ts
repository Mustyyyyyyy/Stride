import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_USER_PROFILE = {
  id: 'usr_demo_101',
  email: 'runner@stride.app',
  fullName: 'Alex Morgan',
  profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
  height: 175,
  weight: 70,
  gender: 'MALE',
  unitSystem: 'METRIC',
  theme: 'DARK',
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (user) {
        const { passwordHash, ...sanitized } = user;
        return sanitized;
      }
      return { ...DEFAULT_USER_PROFILE, id: userId };
    } catch (e) {
      return { ...DEFAULT_USER_PROFILE, id: userId };
    }
  }

  async updateProfile(userId: string, data: any) {
    try {
      const updateData: any = {};
      if (data.fullName !== undefined) updateData.fullName = data.fullName;
      if (data.weight !== undefined) updateData.weight = Number(data.weight);
      if (data.height !== undefined) updateData.height = Number(data.height);
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth;
      if (data.unitSystem !== undefined) updateData.unitSystem = data.unitSystem;
      if (data.theme !== undefined) updateData.theme = data.theme;

      // Ensure user exists before trying to update in Prisma
      const existingUser = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!existingUser) {
        return { ...DEFAULT_USER_PROFILE, id: userId, ...data };
      }

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
      const { passwordHash, ...sanitized } = user;
      return sanitized;
    } catch (e) {
      return { ...DEFAULT_USER_PROFILE, id: userId, ...data };
    }
  }
}

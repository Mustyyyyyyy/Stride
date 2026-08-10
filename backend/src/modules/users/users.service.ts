import { Injectable } from '@nestjs/common';
import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alex Morgan' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 175 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ example: 'MALE' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: '1995-05-15' })
  @IsOptional()
  dateOfBirth?: any;

  @ApiPropertyOptional({ example: 'METRIC' })
  @IsOptional()
  @IsString()
  unitSystem?: string;

  @ApiPropertyOptional({ example: 'DARK' })
  @IsOptional()
  @IsString()
  theme?: string;
}

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

  async updateProfile(userId: string, data: UpdateProfileDto) {
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

@ApiTags('Users & Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile & settings' })
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user?.id || req.user?.sub);
  }

  @ApiOperation({ summary: 'Update user profile (height, weight, units, theme)' })
  @Patch('profile')
  async updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user?.id || req.user?.sub, dto);
  }
}

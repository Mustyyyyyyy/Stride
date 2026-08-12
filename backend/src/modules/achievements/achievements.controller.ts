import { Controller, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AchievementsService } from './achievements.service';

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

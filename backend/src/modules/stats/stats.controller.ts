import { Controller, Get, Query, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatsService } from './stats.service';

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

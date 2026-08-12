import { Controller, Get, Post, Body, UseGuards, Request, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './goals.service';

@ApiTags('Goals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @ApiOperation({ summary: 'Get current user goals' })
  @Get()
  async getGoals(@Request() req: any) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.goalsService.getGoals(userId);
  }

  @ApiOperation({ summary: 'Create a new fitness goal' })
  @Post()
  async createGoal(@Request() req: any, @Body() dto: CreateGoalDto) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    
    const validTypes = ['DAILY_STEPS', 'DAILY_DISTANCE', 'WEEKLY_DISTANCE', 'MONTHLY_DISTANCE', 'CALORIES'];
    if (!dto?.type || !validTypes.includes(dto.type)) {
      throw new BadRequestException('Invalid goal type');
    }
    if (!dto?.targetValue || isNaN(Number(dto.targetValue))) {
      throw new BadRequestException('Invalid target value');
    }
    return this.goalsService.createGoal(userId, dto);
  }
}

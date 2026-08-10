import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dtos/activity.dto';

@ApiTags('Activities & Workouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @ApiOperation({ summary: 'Save completed workout activity' })
  @Post()
  async createActivity(@Request() req: any, @Body() dto: CreateActivityDto) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.activitiesService.createActivity(userId, dto);
  }

  @ApiOperation({ summary: 'List user workout history with filters' })
  @ApiQuery({ name: 'type', required: false, enum: ['WALKING', 'RUNNING', 'CYCLING', 'HIKING'] })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  async getActivities(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.activitiesService.getActivities(userId, type, search);
  }

  @ApiOperation({ summary: 'Get detailed workout activity by ID' })
  @Get(':id')
  async getActivityById(@Param('id') id: string) {
    return this.activitiesService.getActivityById(id);
  }

  @ApiOperation({ summary: 'Delete workout activity' })
  @Delete(':id')
  async deleteActivity(@Param('id') id: string) {
    return this.activitiesService.deleteActivity(id);
  }
}

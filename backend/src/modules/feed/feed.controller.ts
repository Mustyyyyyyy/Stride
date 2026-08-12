import { Controller, Get, Post, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeedService } from './feed.service';

@ApiTags('Feed')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @ApiOperation({ summary: 'Get user activity feed' })
  @Get()
  async getFeed(@Request() req: any) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.feedService.getUserFeed(userId);
  }

  @ApiOperation({ summary: 'Like an activity in the feed' })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @Post(':id/like')
  async likeActivity(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.feedService.likeActivity(userId, id);
  }

  @ApiOperation({ summary: 'Share an activity from the feed' })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @Post(':id/share')
  async shareActivity(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.feedService.shareActivity(userId, id);
  }
}

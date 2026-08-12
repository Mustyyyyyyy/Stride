import { Controller, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChallengesService } from './challenges.service';

@ApiTags('Challenges')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @ApiOperation({ summary: 'Get all active challenges with user progress' })
  @Get()
  async getChallenges(@Request() req: any) {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.challengesService.getChallenges(userId);
  }
}

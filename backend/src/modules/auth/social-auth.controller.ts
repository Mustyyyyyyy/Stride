import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SocialAuthService } from './social-auth.service';
import { SocialAuthDto } from './dtos/social-auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class SocialAuthController {
  constructor(private readonly socialAuthService: SocialAuthService) {}

  @ApiOperation({ summary: 'Authenticate with Google or Apple using Firebase ID token' })
  @ApiResponse({ status: 200, description: 'User authenticated successfully with Stride JWT.' })
  @HttpCode(HttpStatus.OK)
  @Post('social')
  async socialLogin(@Body() dto: SocialAuthDto) {
    return this.socialAuthService.socialLogin(dto);
  }
}

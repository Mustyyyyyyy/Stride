import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';

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
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'METRIC' })
  @IsOptional()
  @IsString()
  unitSystem?: string;

  @ApiPropertyOptional({ example: 'DARK' })
  @IsOptional()
  @IsString()
  theme?: string;
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

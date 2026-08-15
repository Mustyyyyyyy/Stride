import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SocialAuthDto {
  @ApiProperty({ example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...' })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiPropertyOptional({ example: 'google' })
  @IsString()
  @IsOptional()
  provider?: 'google' | 'apple';
}

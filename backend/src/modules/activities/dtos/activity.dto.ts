import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ActivityTypeDto {
  WALKING = 'WALKING',
  RUNNING = 'RUNNING',
  CYCLING = 'CYCLING',
  HIKING = 'HIKING',
}

export class GpsPointDto {
  @ApiProperty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  altitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  speed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @ApiProperty()
  @IsNotEmpty()
  timestamp: string;
}

export class CreateActivityDto {
  @ApiProperty({ enum: ActivityTypeDto, example: 'RUNNING' })
  @IsEnum(ActivityTypeDto)
  type: ActivityTypeDto;

  @ApiPropertyOptional({ example: 'Morning Trail Run' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 5200, description: 'Distance in meters' })
  @IsNumber()
  distance: number;

  @ApiProperty({ example: 1800, description: 'Duration in seconds' })
  @IsNumber()
  duration: number;

  @ApiPropertyOptional({ example: 380 })
  @IsOptional()
  @IsNumber()
  calories?: number;

  @ApiPropertyOptional({ example: 2.88, description: 'Average speed in m/s' })
  @IsOptional()
  @IsNumber()
  averageSpeed?: number;

  @ApiPropertyOptional({ example: 4.2, description: 'Max speed in m/s' })
  @IsOptional()
  @IsNumber()
  maxSpeed?: number;

  @ApiPropertyOptional({ example: 5.75, description: 'Average pace in min/km' })
  @IsOptional()
  @IsNumber()
  averagePace?: number;

  @ApiPropertyOptional({ example: 6400 })
  @IsOptional()
  @IsNumber()
  steps?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  polyline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: '2026-07-26T06:00:00Z' })
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '2026-07-26T06:30:00Z' })
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({ type: [GpsPointDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GpsPointDto)
  gpsPoints?: GpsPointDto[];
}

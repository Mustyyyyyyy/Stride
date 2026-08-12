import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkDeviceDto {
  @ApiProperty({ example: 'dev_abc123xyz' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;
}

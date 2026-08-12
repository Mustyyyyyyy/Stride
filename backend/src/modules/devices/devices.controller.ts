import { Controller, Post, Body, Request, UseGuards, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DevicesService } from './devices.service';
import { LinkDeviceDto } from './device.dto';

@ApiTags('Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @ApiOperation({ summary: 'Link the current authenticated device to this user account' })
  @Post('link')
  async linkDevice(@Request() req: any, @Body() dto: LinkDeviceDto) {
    const userId = req.user?.id || req.user?.sub;
    return this.devicesService.linkDevice(userId, dto.deviceId);
  }

  @ApiOperation({ summary: 'List devices linked to current user' })
  @Get()
  async listDevices(@Request() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.devicesService.listDevices(userId);
  }

  @ApiOperation({ summary: 'Unlink a device from the current user' })
  @Post('unlink')
  async unlinkDevice(@Request() req: any, @Body() dto: LinkDeviceDto) {
    const userId = req.user?.id || req.user?.sub;
    return this.devicesService.unlinkDevice(userId, dto.deviceId);
  }
}

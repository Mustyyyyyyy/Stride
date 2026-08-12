import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  async linkDevice(userId: string, deviceId: string) {
    const device = await this.prisma.device.upsert({
      where: { deviceId },
      update: { userId, linkedAt: new Date() },
      create: { deviceId, userId, linkedAt: new Date() },
    });

    return {
      linked: true,
      deviceId: device.deviceId,
      linkedAt: device.linkedAt,
    };
  }

  async listDevices(userId: string) {
    const devices = await this.prisma.device.findMany({ where: { userId } });
    return devices.map((d) => ({ deviceId: d.deviceId, linkedAt: d.linkedAt }));
  }

  async unlinkDevice(userId: string, deviceId: string) {
    const device = await this.prisma.device.findUnique({ where: { deviceId } });
    if (!device) return { unlinked: false, reason: 'not_found' };
    if (device.userId !== userId) throw new ForbiddenException('Device does not belong to the current user');

    await this.prisma.device.delete({ where: { deviceId } });
    return { unlinked: true, deviceId };
  }
}

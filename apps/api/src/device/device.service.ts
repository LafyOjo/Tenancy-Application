import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { DeviceRepository } from './device.repository';
import { SmartDeviceProvider } from './smart-device.provider';
import { PrismaService } from '../prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class DeviceService {
  constructor(
    private readonly repo: DeviceRepository,
    private readonly provider: SmartDeviceProvider,
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  list(unitId: string) {
    return this.repo.findMany({ where: { unitId } });
  }

  register(unitId: string, data: any) {
    return this.repo.create({ ...data, unitId });
  }

  async lock(id: string) {
    const device = await this.repo.findUnique(id);
    await this.provider.lock(device);
    await this.log('lock', id);
    return { status: 'locked' };
  }

  async unlock(id: string) {
    const device = await this.repo.findUnique(id);
    await this.provider.unlock(device);
    await this.log('unlock', id);
    return { status: 'unlocked' };
  }

  async setTemperature(id: string, temperature: number) {
    const device = await this.repo.findUnique(id);
    await this.provider.setTemperature(device, temperature);
    await this.log(`set-temp:${temperature}`, id);
    return { status: 'temperature set' };
  }

  private log(action: string, deviceId: string) {
    const orgId = (this.request as any).orgId;
    const actorId = (this.request as any).user?.id;
    return this.prisma.auditLog.create({
      data: { orgId, actorId, action, target: deviceId },
    });
  }
}

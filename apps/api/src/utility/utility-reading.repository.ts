import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class UtilityReadingRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  private get orgId(): string {
    return (this.request as any).orgId;
  }

  findMany(args: any = {}) {
    return this.prisma.utilityReading.findMany({
      ...args,
      where: { ...(args.where || {}), orgId: this.orgId },
      orderBy: args.orderBy || { recordedAt: 'asc' },
    });
  }

  findUnique(id: string) {
    return this.prisma.utilityReading.findFirst({
      where: { id, orgId: this.orgId },
    });
  }

  create(data: any) {
    return this.prisma.utilityReading.create({
      data: { ...data, orgId: this.orgId },
    });
  }

  update(id: string, data: any) {
    return this.prisma.utilityReading.updateMany({
      where: { id, orgId: this.orgId },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.utilityReading.deleteMany({
      where: { id, orgId: this.orgId },
    });
  }
}

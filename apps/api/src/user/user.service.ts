import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  export() {
    const userId = (this.request as any).user?.id;
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async anonymize() {
    const userId = (this.request as any).user?.id;
    const orgId = (this.request as any).orgId;
    await this.prisma.user.update({
      where: { id: userId },
      data: { email: null, name: null, totpSecret: null, image: null },
    });
    await this.prisma.auditLog.create({
      data: {
        orgId,
        actorId: userId,
        action: 'anonymize_user',
        target: userId,
      },
    });
    return { status: 'anonymized' };
  }
}

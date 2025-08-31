import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from '../prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  list() {
    const userId = (this.request as any).user?.id;
    return this.prisma.session.findMany({ where: { userId } });
  }

  async revoke(id: string) {
    const userId = (this.request as any).user?.id;
    const orgId = (this.request as any).orgId;
    await this.prisma.session.delete({ where: { id } });
    await this.prisma.auditLog.create({
      data: { orgId, actorId: userId, action: 'revoke_session', target: id },
    });
    return { status: 'revoked' };
  }
}

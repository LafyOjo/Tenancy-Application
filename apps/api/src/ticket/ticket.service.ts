import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { TicketRepository } from './ticket.repository';
import { PrismaService } from '../prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class TicketService {
  constructor(
    private readonly repo: TicketRepository,
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  list() {
    return this.repo.findMany({ include: { category: true } });
  }

  get(id: string) {
    return this.repo.findUnique(id, { include: { category: true } });
  }

  create(data: any) {
    return this.repo.create(data);
  }

  async update(id: string, data: any) {
    const before = await this.repo.findUnique(id);
    const ticket = await this.repo.update(id, data);
    if (data.status && before?.status !== data.status) {
      await this.notifyTenants(before.unitId, `Ticket ${id} status updated to ${data.status}`);
    }
    return ticket;
  }

  private async notifyTenants(unitId: string, message: string) {
    const orgId = (this.request as any).orgId;
    const shares = await this.prisma.leaseShare.findMany({
      where: { lease: { unitId, orgId, status: 'active' } },
      include: { membership: true },
    });
    await Promise.all(
      shares.map((s) =>
        this.prisma.notification.create({
          data: { orgId, userId: s.membership.userId, message },
        }),
      ),
    );
  }
}

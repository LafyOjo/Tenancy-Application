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

  async create(data: any) {
    const orgId = (this.request as any).orgId;
    const userId = (this.request as any).user?.id;
    if (orgId && userId) {
      const membership = await this.prisma.membership.findFirst({
        where: { orgId, userId },
      });
      if (membership?.subscriptionPlan === 'priority_support') {
        data.priority = 'high';
      } else if (membership?.subscriptionPlan === 'discounted_repairs') {
        if (typeof data.partsCost === 'number') {
          data.partsCost = data.partsCost * 0.9;
        }
        if (typeof data.labourCost === 'number') {
          data.labourCost = data.labourCost * 0.9;
        }
      }
    }
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

  addSnapshot(id: string, image: string) {
    const orgId = (this.request as any).orgId;
    return this.prisma.document.create({
      data: { orgId, ticketId: id, url: image },
    });
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

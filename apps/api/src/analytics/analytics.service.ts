import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MarketDataService } from './market-data.service';

type Filters = {
  startDate?: Date;
  endDate?: Date;
  propertyId?: string;
  unitId?: string;
};

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private market: MarketDataService,
  ) {}

  private buildInvoiceWhere(filters: Filters) {
    const date: any = {};
    if (filters.startDate) date.gte = filters.startDate;
    if (filters.endDate) date.lte = filters.endDate;
    return {
      ...(filters.startDate || filters.endDate ? { dueDate: date } : {}),
      ...(filters.unitId || filters.propertyId
        ? {
            lease: {
              ...(filters.unitId ? { unitId: filters.unitId } : {}),
              ...(filters.propertyId
                ? { unit: { propertyId: filters.propertyId } }
                : {}),
            },
          }
        : {}),
    };
  }

  private buildTicketWhere(filters: Filters) {
    const date: any = {};
    if (filters.startDate) date.gte = filters.startDate;
    if (filters.endDate) date.lte = filters.endDate;
    return {
      status: 'completed',
      ...(filters.startDate || filters.endDate ? { createdAt: date } : {}),
      ...(filters.unitId ? { unitId: filters.unitId } : {}),
      ...(filters.propertyId ? { propertyId: filters.propertyId } : {}),
    };
  }

  private buildReadingWhere(filters: Filters) {
    const date: any = {};
    if (filters.startDate) date.gte = filters.startDate;
    if (filters.endDate) date.lte = filters.endDate;
    return {
      ...(filters.startDate || filters.endDate ? { recordedAt: date } : {}),
      ...(filters.unitId
        ? { unitId: filters.unitId }
        : filters.propertyId
        ? { unit: { propertyId: filters.propertyId } }
        : {}),
    };
  }

  async arrears(filters: Filters) {
    const invoices = await this.prisma.invoice.findMany({
      where: this.buildInvoiceWhere(filters),
      include: { payments: true },
    });
    let total = 0;
    for (const inv of invoices) {
      const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
      const outstanding = inv.amount - paid;
      if (outstanding > 0) total += outstanding;
    }
    return { arrears: total };
  }

  async dso(filters: Filters) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        ...this.buildInvoiceWhere(filters),
        paidAt: { not: null },
      },
    });
    const days = invoices.reduce((sum, inv) => {
      if (!inv.paidAt) return sum;
      const diff =
        (inv.paidAt.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24);
      return sum + diff;
    }, 0);
    const avg = invoices.length ? days / invoices.length : 0;
    return { dso: avg };
  }

  async onTimePaymentRate(filters: Filters) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        ...this.buildInvoiceWhere(filters),
        paidAt: { not: null },
      },
    });
    const onTime = invoices.filter(
      (inv) => inv.paidAt && inv.paidAt <= inv.dueDate,
    ).length;
    const rate = invoices.length ? onTime / invoices.length : 0;
    return { rate };
  }

  async mttr(filters: Filters) {
    const tickets = await this.prisma.ticket.findMany({
      where: this.buildTicketWhere(filters),
      include: { visits: true },
    });
    let total = 0;
    let count = 0;
    for (const ticket of tickets) {
      const visit = ticket.visits.find((v) => v.outcome === 'completed');
      if (visit) {
        const diff =
          (visit.scheduledAt.getTime() - ticket.createdAt.getTime()) /
          (1000 * 60 * 60);
        total += diff;
        count++;
      }
    }
    return { mttr: count ? total / count : 0 };
  }

  async utilityOverage(filters: Filters) {
    const readings = await this.prisma.utilityReading.findMany({
      where: this.buildReadingWhere(filters),
      include: {
        unit: {
          include: {
            leases: { where: { status: 'active' } },
          },
        },
      },
    });
    let overage = 0;
    for (const r of readings) {
      const lease = r.unit.leases[0];
      let allowance = 0;
      if (lease && lease.utilityAllowances) {
        const allowances = lease.utilityAllowances as any;
        allowance = allowances[r.type] ?? 0;
      }
      if (r.reading > allowance) {
        overage += r.reading - allowance;
      }
    }
    return { overage };
  }

  async marketComparison(area: string, yieldRate: number, vacancy: number) {
    return this.market.compare(area, yieldRate, vacancy);
  }
}


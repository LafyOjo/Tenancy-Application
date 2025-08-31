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
  private churnWeights = [0, 0, 0];

  constructor(
    private prisma: PrismaService,
    private market: MarketDataService,
  ) {
    this.trainChurnModel();
  }

  private sigmoid(z: number) {
    return 1 / (1 + Math.exp(-z));
  }

  private trainChurnModel() {
    const data = [
      { x: [0, 0], y: 0 },
      { x: [1, 0], y: 0 },
      { x: [0, 1], y: 0 },
      { x: [1, 1], y: 1 },
      { x: [2, 1], y: 1 },
      { x: [3, 2], y: 1 },
    ];
    const lr = 0.1;
    const iterations = 500;
    for (let i = 0; i < iterations; i++) {
      const grad = [0, 0, 0];
      for (const p of data) {
        const x = [1, ...p.x];
        const z =
          this.churnWeights[0] * x[0] +
          this.churnWeights[1] * x[1] +
          this.churnWeights[2] * x[2];
        const pred = this.sigmoid(z);
        const err = pred - p.y;
        grad[0] += err * x[0];
        grad[1] += err * x[1];
        grad[2] += err * x[2];
      }
      for (let j = 0; j < this.churnWeights.length; j++) {
        this.churnWeights[j] -= (lr * grad[j]) / data.length;
      }
    }
  }

  private predictChurn(features: number[]) {
    const z =
      this.churnWeights[0] +
      this.churnWeights[1] * features[0] +
      this.churnWeights[2] * features[1];
    return this.sigmoid(z);
  }

  private linearRegression(xs: number[], ys: number[]) {
    const n = xs.length;
    const xMean = xs.reduce((a, b) => a + b, 0) / n;
    const yMean = ys.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - xMean) * (ys[i] - yMean);
      den += (xs[i] - xMean) ** 2;
    }
    const slope = den === 0 ? 0 : num / den;
    const intercept = yMean - slope * xMean;
    return { slope, intercept };
  }

  private forecastMaintenance(tickets: any[]) {
    const costsByMonth = new Map<number, number>();
    for (const t of tickets) {
      if (t.status !== 'completed') continue;
      const month = t.createdAt.getFullYear() * 12 + t.createdAt.getMonth();
      const cost = (t.partsCost ?? 0) + (t.labourCost ?? 0);
      costsByMonth.set(month, (costsByMonth.get(month) ?? 0) + cost);
    }
    const data = Array.from(costsByMonth.entries()).sort((a, b) => a[0] - b[0]);
    if (data.length === 0) return 0;
    if (data.length === 1) return data[0][1];
    const xs = data.map(([m]) => m);
    const ys = data.map(([, c]) => c);
    const { slope, intercept } = this.linearRegression(xs, ys);
    const next = data[data.length - 1][0] + 1;
    return intercept + slope * next;
  }

  async risk(leaseId: string) {
    const lease = await this.prisma.lease.findUnique({
      where: { id: leaseId },
      include: { invoices: true, unit: { include: { tickets: true } } },
    });
    if (!lease) return { churnRisk: 0, maintenanceForecast: 0 };
    const late = lease.invoices.filter((inv) => {
      if (inv.paidAt) return inv.paidAt > inv.dueDate;
      return inv.dueDate < new Date();
    }).length;
    const maintenanceTickets = lease.unit.tickets.filter(
      (t: any) => t.status === 'completed',
    );
    const churnRisk = this.predictChurn([late, maintenanceTickets.length]);
    const maintenanceForecast = this.forecastMaintenance(lease.unit.tickets);
    return { churnRisk, maintenanceForecast };
  }

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


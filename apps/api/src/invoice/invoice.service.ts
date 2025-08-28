import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import {
  Lease,
  InvoiceData,
  generateInvoiceForDate,
} from './invoice.utils';

/**
 * Service responsible for generating invoices from leases.
 * Includes simple cron job that runs on the first of each month.
 */
@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  /** Cron that runs monthly to generate invoices for active leases. */
  @Cron('0 0 1 * *')
  async handleCron() {
    const leases: Lease[] = await this.prisma.lease.findMany({
      where: { status: 'active' },
    });
    const today = new Date();
    for (const lease of leases) {
      await this.generateCurrentInvoice(lease, today);
    }
  }

  /**
   * Generate the invoice covering the period that contains `date`.
   * For simplicity we do not check for existing invoices.
   */
  async generateCurrentInvoice(lease: Lease, date: Date): Promise<InvoiceData | null> {
    if (lease.rentFrequency === 'monthly') {
      const periodStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      if (periodEnd < lease.startDate) return null;
      if (lease.endDate && periodStart > lease.endDate) return null;
    }
    const invoice = generateInvoiceForDate(lease, date);
    const created = await this.prisma.invoice.create({
      data: {
        leaseId: lease.id,
        orgId: (await this.prisma.lease.findUnique({ where: { id: lease.id } })).orgId,
        dueDate: invoice.periodStart,
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        amount: invoice.total,
        lineItems: { create: invoice.lineItems },
      },
    });
    await this.createInvoiceShares(lease, created.id, invoice.total);
    return invoice;
  }

  private async createInvoiceShares(lease: Lease, invoiceId: string, total: number) {
    const household = await this.prisma.household.findUnique({
      where: { id: lease.householdId },
      include: { members: true },
    });
    const shares = await this.prisma.leaseShare.findMany({ where: { leaseId: lease.id } });
    let data: { membershipId: string; amount: number }[] = [];
    if (shares.length > 0) {
      for (const share of shares) {
        const amount =
          share.type === 'percentage' ? (total * share.value) / 100 : share.value;
        data.push({ membershipId: share.membershipId, amount });
      }
    } else if (household) {
      const equal = household.members.length
        ? total / household.members.length
        : 0;
      data = household.members.map(m => ({ membershipId: m.id, amount: equal }));
    }
    if (data.length) {
      const orgId = lease.orgId;
      await this.prisma.invoiceShare.createMany({
        data: data.map(d => ({ ...d, invoiceId, orgId })),
      });
    }
  }

  async getShares(id: string) {
    return this.prisma.invoiceShare.findMany({ where: { invoiceId: id } });
  }
}


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
      const invoice = generateInvoiceForDate(lease, date);
      await this.prisma.invoice.create({
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
      return invoice;
    } else {
      const invoice = generateInvoiceForDate(lease, date);
      await this.prisma.invoice.create({
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
      return invoice;
    }
  }
}


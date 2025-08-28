import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';

/**
 * Schedules reminders for upcoming and overdue invoices and
 * applies late fees as line items when thresholds are hit.
 */
@Injectable()
export class InvoiceReminderService {
  private readonly logger = new Logger(InvoiceReminderService.name);
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleCron() {
    const today = new Date();
    const invoices = await this.prisma.invoice.findMany({
      where: { paidAt: null },
      include: { lineItems: true },
    });
    for (const invoice of invoices) {
      const diff = Math.floor(
        (today.getTime() - invoice.dueDate.getTime()) / 86400000,
      );
      switch (diff) {
        case -3:
          this.logger.log(`Reminder: invoice ${invoice.id} due in 3 days`);
          break;
        case 0:
          this.logger.log(`Reminder: invoice ${invoice.id} due today`);
          break;
        case 3:
          this.logger.log(`Reminder: invoice ${invoice.id} 3 days overdue`);
          await this.addLateFee(invoice.id, invoice.lineItems, 1);
          break;
        case 7:
          this.logger.log(`Reminder: invoice ${invoice.id} 7 days overdue`);
          await this.addLateFee(invoice.id, invoice.lineItems, 2);
          break;
      }
    }
  }

  private async addLateFee(
    invoiceId: string,
    items: { description: string }[],
    stage: 1 | 2,
  ) {
    const description = stage === 1 ? 'Late Fee' : `Late Fee ${stage}`;
    const exists = items.some((i) => i.description === description);
    if (exists) return;
    await this.prisma.invoiceLineItem.create({
      data: { invoiceId, description, amount: 25 },
    });
    this.logger.log(`Applied ${description} to invoice ${invoiceId}`);
  }
}


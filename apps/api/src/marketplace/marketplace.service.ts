import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class MarketplaceService {
  constructor(
    private prisma: PrismaService,
    private ledger: LedgerService,
  ) {}

  /**
   * List tradespeople filtered by optional category or area.
   */
  listTradespeople(category?: string, area?: string) {
    return this.prisma.tradespersonProfile.findMany({
      where: {
        ...(category ? { categories: { has: category } } : {}),
        ...(area ? { coverageArea: { contains: area, mode: 'insensitive' } } : {}),
      },
    });
  }

  /**
   * Create a service job invitation from landlord to tradesperson.
   */
  async createJob(data: {
    orgId: string;
    tradespersonId: string;
    description: string;
    price: number;
  }) {
    const platformFee = this.computeFee(data.price);
    return this.prisma.serviceJob.create({
      data: {
        ...data,
        platformFee,
      },
    });
  }

  /**
   * Complete checkout for a job, recording ledger entries.
   */
  async checkout(jobId: string) {
    const job = await this.prisma.serviceJob.findUnique({ where: { id: jobId } });
    if (!job) throw new Error('Job not found');
    if (job.status === 'completed') return job;

    // Record payout to tradesperson
    await this.ledger.create({
      orgId: job.orgId,
      description: `Payout for job ${job.id}`,
      debitAccount: 'RepairsExpense',
      creditAccount: 'Cash',
      amount: job.price,
    });

    // Record platform fee
    await this.ledger.create({
      orgId: job.orgId,
      description: `Platform fee for job ${job.id}`,
      debitAccount: 'Cash',
      creditAccount: 'PlatformRevenue',
      amount: job.platformFee,
    });

    return this.prisma.serviceJob.update({
      where: { id: jobId },
      data: { status: 'completed', completedAt: new Date() },
    });
  }

  private computeFee(price: number) {
    const RATE = 0.1; // 10% platform fee
    return Math.round(price * RATE * 100) / 100;
  }
}


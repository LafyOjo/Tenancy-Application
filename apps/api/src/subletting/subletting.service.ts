import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class SublettingService {
  constructor(private prisma: PrismaService, private ledger: LedgerService) {}

  async approve(leaseId: string, revenueShare: number) {
    const lease = await this.prisma.lease.findUnique({ where: { id: leaseId } });
    if (!lease) throw new Error('Lease not found');
    const prisma = this.prisma as any;
    return prisma.sublettingApproval.create({
      data: { orgId: lease.orgId, leaseId, revenueShare },
    });
  }

  async integrateAirbnb(orgId: string, listingId: string) {
    const prisma = this.prisma as any;
    return prisma.airbnbIntegration.create({
      data: { orgId, listingId, active: true },
    });
  }

  async recordPayout(approvalId: string, amount: number) {
    const prisma = this.prisma as any;
    const approval = await prisma.sublettingApproval.findUnique({ where: { id: approvalId } });
    if (!approval) throw new Error('Approval not found');
    const platformFee = amount * approval.revenueShare;
    const payoutAmount = amount - platformFee;
    const payout = await prisma.sublettingPayout.create({
      data: {
        orgId: approval.orgId,
        approvalId,
        amount: payoutAmount,
        platformFee,
      },
    });
    await this.ledger.create({
      orgId: approval.orgId,
      date: new Date(),
      description: 'Subletting payout',
      debitAccount: 'subletting_payout',
      creditAccount: 'cash',
      amount: payoutAmount,
    });
    await this.ledger.create({
      orgId: approval.orgId,
      date: new Date(),
      description: 'Platform fee',
      debitAccount: 'cash',
      creditAccount: 'platform_fee_income',
      amount: platformFee,
    });
    return payout;
  }
}


import { Injectable, Scope } from '@nestjs/common';
import { LeaseRepository } from './lease.repository';
import { PdfService } from './pdf.service';
import { EsignService } from './esign.service';
import { PrismaService } from '../prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class LeaseService {
  constructor(
    private readonly repo: LeaseRepository,
    private readonly pdf: PdfService,
    private readonly esign: EsignService,
    private readonly prisma: PrismaService,
  ) {}

  create(data: {
    unitId: string;
    householdId: string;
    startDate: Date;
    endDate?: Date;
    rentAmount: number;
    rentFrequency: string;
    depositAmount?: number;
    utilityAllowances?: any;
    autoRenew?: boolean;
    breakClause?: string;
    status?: string;
  }) {
    return this.repo.create({
      ...data,
      autoRenew: data.autoRenew ?? false,
      status: data.status ?? 'draft',
    });
  }

  update(id: string, data: any) {
    return this.repo.update(id, data);
  }

  /** Generate a lease PDF and upload to S3. */
  async generatePdf(id: string) {
    const lease = await this.repo.findUnique(id, {
      include: { unit: true },
    });
    if (!lease) throw new Error('Lease not found');
    return this.pdf.generateLeasePdf(lease);
  }

  /** Start the e-sign process for a lease. */
  async startEsign(id: string) {
    const pdf = await this.generatePdf(id);
    const lease = await this.repo.findUnique(id);
    return this.esign.start(lease, pdf.url);
  }

  /** Handle webhook callback for e-sign completion. */
  async handleWebhook(body: any) {
    return this.esign.webhook(body);
  }

  getShares(leaseId: string) {
    return this.prisma.leaseShare.findMany({ where: { leaseId } });
  }

  async updateShares(
    leaseId: string,
    shares: { membershipId: string; type: string; value: number }[],
  ) {
    const lease = await this.repo.findUnique(leaseId);
    if (!lease) throw new Error('Lease not found');
    await this.prisma.leaseShare.deleteMany({ where: { leaseId } });
    if (shares.length) {
      await this.prisma.leaseShare.createMany({
        data: shares.map(s => ({ ...s, leaseId, orgId: lease.orgId })),
      });
    }
    return this.getShares(leaseId);
  }
}


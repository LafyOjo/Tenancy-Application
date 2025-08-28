import { Injectable, Scope } from '@nestjs/common';
import { AmendmentRepository } from './amendment.repository';
import { PdfService } from './pdf.service';
import { EsignService } from './esign.service';

@Injectable({ scope: Scope.REQUEST })
export class AmendmentService {
  constructor(
    private readonly repo: AmendmentRepository,
    private readonly pdf: PdfService,
    private readonly esign: EsignService,
  ) {}

  list(leaseId: string) {
    return this.repo.findMany({ where: { leaseId }, orderBy: { version: 'asc' } });
  }

  async propose(leaseId: string, content: any) {
    const [last] = await this.repo.findMany({
      where: { leaseId },
      orderBy: { version: 'desc' },
      take: 1,
    });
    const version = last ? last.version + 1 : 1;
    return this.repo.create({ leaseId, version, content });
  }

  async counter(id: string, content: any) {
    const existing = await this.repo.findUnique(id);
    if (!existing) throw new Error('Amendment not found');
    await this.repo.update(id, { status: 'countered' });
    const [last] = await this.repo.findMany({
      where: { leaseId: existing.leaseId },
      orderBy: { version: 'desc' },
      take: 1,
    });
    const version = last ? last.version + 1 : 1;
    return this.repo.create({ leaseId: existing.leaseId, version, content });
  }

  accept(id: string) {
    return this.repo.update(id, { status: 'accepted' });
  }

  async startEsign(id: string) {
    const amendment = await this.repo.findUnique(id);
    if (!amendment) throw new Error('Amendment not found');
    const pdf = await this.pdf.generateAmendmentPdf(amendment);
    await this.repo.update(id, { pdfUrl: pdf.url, redlineUrl: pdf.redlineUrl });
    return this.esign.start(amendment, pdf.url);
  }
}

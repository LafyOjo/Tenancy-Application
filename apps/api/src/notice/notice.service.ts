import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NoticeRepository } from './notice.repository';
import { NoticePdfService } from './pdf.service';

@Injectable()
export class NoticeService {
  constructor(
    private readonly repo: NoticeRepository,
    private readonly pdf: NoticePdfService,
  ) {}

  async create(data: {
    orgId: string;
    leaseId: string;
    type: 'section21' | 'hud';
    tenantName: string;
    issueDate: string;
    deadline: string;
  }) {
    const id = randomUUID();
    const { url } = await this.pdf.generate(id, data.type, data);
    return this.repo.create({
      id,
      orgId: data.orgId,
      leaseId: data.leaseId,
      type: data.type,
      pdfUrl: url,
    });
  }

  acknowledge(id: string) {
    return this.repo.update(id, { acknowledgedAt: new Date() });
  }
}

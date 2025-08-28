import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';
import PDFDocument from 'pdfkit';
import { S3Service } from '../s3.service';

@Injectable()
export class NoticePdfService {
  constructor(private readonly s3: S3Service) {}

  private templates: Record<string, string> = {
    section21:
      'Section 21 Notice\n\nTenant: {{tenantName}}\nIssued: {{issueDate}}\nVacate By: {{deadline}}',
    hud:
      'HUD Notice\n\nTenant: {{tenantName}}\nIssued: {{issueDate}}\nCompliance Date: {{deadline}}',
  };

  async generate(id: string, type: 'section21' | 'hud', data: any) {
    const template = Handlebars.compile(this.templates[type]);
    const content = template(data);

    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (d) => chunks.push(d));
    doc.text(content);
    doc.end();
    const buffer: Buffer = await new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    const key = `notices/${id}.pdf`;
    const { url } = await this.s3.upload(key, buffer, 'application/pdf');
    return { url };
  }
}

import { Injectable } from '@nestjs/common';
import Handlebars from 'handlebars';
import PDFDocument from 'pdfkit';
import { S3Service } from '../s3.service';

@Injectable()
export class PdfService {
  constructor(private readonly s3: S3Service) {}

  /** Generate a simple lease PDF using Handlebars and upload to S3. */
  async generateLeasePdf(lease: any) {
    const template = Handlebars.compile(
      `Lease Agreement\n\nUnit: {{unit.name}}\nHousehold: {{householdId}}\nStart: {{startDate}}\nEnd: {{endDate}}\nRent: {{rentAmount}} {{rentFrequency}}`
    );
    const content = template({
      ...lease,
      startDate: lease.startDate?.toISOString().slice(0, 10),
      endDate: lease.endDate?.toISOString().slice(0, 10) || '',
    });

    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (d) => chunks.push(d));
    doc.text(content);
    doc.end();
    const buffer: Buffer = await new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    const key = `leases/${lease.id}.pdf`;
    const { url } = await this.s3.upload(key, buffer, 'application/pdf');
    return { url };
  }
}

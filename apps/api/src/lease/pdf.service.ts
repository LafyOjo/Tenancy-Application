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

  /** Generate an amendment PDF and a placeholder redline. */
  async generateAmendmentPdf(amendment: any) {
    const template = Handlebars.compile(
      `Lease Amendment v${'{{version}}'}\n\n{{json content}}`
    );
    const content = template({
      version: amendment.version,
      content: amendment.content,
    });

    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on('data', (d) => chunks.push(d));
    doc.text(content);
    doc.end();
    const buffer: Buffer = await new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    const key = `leases/${amendment.leaseId}-amendment-${amendment.version}.pdf`;
    const { url } = await this.s3.upload(key, buffer, 'application/pdf');

    // Generate a trivial redline PDF as a placeholder
    const redlineDoc = new PDFDocument();
    const redlineChunks: Buffer[] = [];
    redlineDoc.on('data', (d) => redlineChunks.push(d));
    redlineDoc.text('Redline preview');
    redlineDoc.end();
    const redlineBuffer: Buffer = await new Promise((resolve) => {
      redlineDoc.on('end', () => resolve(Buffer.concat(redlineChunks)));
    });
    const redlineKey = `leases/${amendment.leaseId}-amendment-${amendment.version}-redline.pdf`;
    const { url: redlineUrl } = await this.s3.upload(
      redlineKey,
      redlineBuffer,
      'application/pdf',
    );

    return { url, redlineUrl };
  }
}

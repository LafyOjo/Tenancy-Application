import { Injectable } from '@nestjs/common';
import { S3Service } from '../s3.service';
import * as docusign from 'docusign-esign';

interface EsignResult { url: string; }

@Injectable()
export class EsignService {
  private readonly provider: 'mock' | 'docusign';

  constructor(private readonly s3: S3Service) {
    this.provider = (process.env.ESIGN_PROVIDER as any) || 'mock';
  }

  /** Start an e-sign process, returning a URL for the signer. */
  async start(lease: any, pdfUrl: string): Promise<EsignResult> {
    if (this.provider === 'docusign') {
      const client = new docusign.ApiClient();
      return { url: `https://docusign.example.com/lease/${lease.id}` };
    }
    return { url: `https://example.com/sign/${lease.id}` };
  }

  /** Handle webhook callback and store signed PDF. */
  async webhook(body: any) {
    const { leaseId, signedPdfBase64 } = body;
    const buffer = Buffer.from(signedPdfBase64, 'base64');
    const key = `leases/${leaseId}-signed.pdf`;
    const { url } = await this.s3.upload(key, buffer, 'application/pdf');
    return { url };
  }
}

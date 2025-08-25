import { Injectable } from '@nestjs/common';
import { CertificateRepository } from './certificate.repository';
import { Certificate, CertificateType } from '@prisma/client';

@Injectable()
export class CertificateService {
  constructor(private repo: CertificateRepository) {}

  create(data: {
    orgId: string;
    propertyId?: string;
    unitId?: string;
    type: CertificateType;
    expiryDate: Date;
    fileUrl?: string;
  }): Promise<Certificate> {
    return this.repo.create({ ...data });
  }

  listForProperty(propertyId: string) {
    return this.repo.findByProperty(propertyId);
  }

  listForUnit(unitId: string) {
    return this.repo.findByUnit(unitId);
  }

  expiringWithin(days: number) {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);
    return this.repo.findExpiringBetween(start, end);
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Certificate } from '@prisma/client';

@Injectable()
export class CertificateRepository {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.CertificateCreateInput) {
    return this.prisma.certificate.create({ data });
  }

  findByProperty(propertyId: string) {
    return this.prisma.certificate.findMany({ where: { propertyId } });
  }

  findByUnit(unitId: string) {
    return this.prisma.certificate.findMany({ where: { unitId } });
  }

  findExpiringBetween(start: Date, end: Date) {
    return this.prisma.certificate.findMany({
      where: {
        expiryDate: {
          gte: start,
          lte: end,
        },
      },
      include: { property: true, unit: true },
    });
  }
}

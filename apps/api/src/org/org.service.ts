import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  getTheme(orgId: string) {
    return this.prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        fontFamily: true,
        emailTemplate: true,
      },
    });
  }

  updateTheme(orgId: string, data: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    emailTemplate?: string;
  }) {
    return this.prisma.organization.update({
      where: { id: orgId },
      data,
      select: {
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        fontFamily: true,
        emailTemplate: true,
      },
    });
  }
}

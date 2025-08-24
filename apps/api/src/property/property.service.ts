import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

/** Service demonstrating organization scoped queries. */
@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}

  list(orgId: string) {
    return this.prisma.property.findMany({ where: { orgId } });
  }
}

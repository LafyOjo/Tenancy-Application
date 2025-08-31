import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  list(filter: { orgId?: string; actorId?: string; action?: string }) {
    return this.prisma.auditLog.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, scopes: string[], quota: number) {
    const key = randomBytes(32).toString('hex');
    return this.prisma.apiKey.create({
      data: { orgId, key, scopes, quota },
    });
  }

  async validate(key: string) {
    return this.prisma.apiKey.findUnique({ where: { key } });
  }

  async incrementUsage(id: string) {
    return this.prisma.apiKey.update({
      where: { id },
      data: { usage: { increment: 1 }, lastUsedAt: new Date() },
    });
  }

  async list(orgId: string) {
    return this.prisma.apiKey.findMany({ where: { orgId } });
  }

  async getUsage(id: string) {
    return this.prisma.apiKey.findUnique({
      where: { id },
      select: { usage: true, quota: true },
    });
  }
}

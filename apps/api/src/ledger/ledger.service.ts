import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LedgerEntry } from '@prisma/client';

interface CreateLedgerDto {
  orgId: string;
  leaseId?: string;
  date?: Date;
  description?: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
}

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLedgerDto): Promise<LedgerEntry> {
    return this.prisma.ledgerEntry.create({ data });
  }

  async getEntries(orgId: string, leaseId: string | undefined, start: Date, end: Date): Promise<LedgerEntry[]> {
    return this.prisma.ledgerEntry.findMany({
      where: {
        orgId,
        ...(leaseId ? { leaseId } : {}),
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });
  }

  async exportCsv(orgId: string, leaseId: string | undefined, start: Date, end: Date): Promise<string> {
    const entries = await this.getEntries(orgId, leaseId, start, end);
    const header = 'date,description,debitAccount,creditAccount,amount';
    const rows = entries.map(e =>
      `${e.date.toISOString()},${e.description ?? ''},${e.debitAccount},${e.creditAccount},${e.amount}`,
    );
    return [header, ...rows].join('\n');
  }
}

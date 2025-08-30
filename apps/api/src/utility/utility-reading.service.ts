import { Injectable, Scope } from '@nestjs/common';
import { UtilityReadingRepository } from './utility-reading.repository';

interface ImportRow {
  type: string;
  reading: number;
  recordedAt?: Date;
}

@Injectable({ scope: Scope.REQUEST })
export class UtilityReadingService {
  constructor(private readonly repo: UtilityReadingRepository) {}

  list(unitId: string, type?: string) {
    const where: any = { unitId };
    if (type) where.type = type;
    return this.repo.findMany({ where });
  }

  get(id: string) {
    return this.repo.findUnique(id);
  }

  create(data: { unitId: string; type: string; reading: number; recordedAt?: Date }) {
    return this.repo.create(data);
  }

  update(id: string, data: any) {
    return this.repo.update(id, data);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }

  async importCsv(unitId: string, csv: string) {
    const lines = csv.trim().split(/\r?\n/);
    for (const line of lines) {
      const [type, readingStr, recordedAtStr] = line.split(',');
      if (!type || !readingStr) continue;
      const reading = parseFloat(readingStr);
      const recordedAt = recordedAtStr ? new Date(recordedAtStr) : undefined;
      await this.create({ unitId, type: type.trim(), reading, recordedAt });
    }
  }

  async getConsumption(unitId: string, type: string, start: Date, end: Date) {
    const readings = await this.repo.findMany({
      where: {
        unitId,
        type,
        recordedAt: { gte: start, lte: end },
      },
      orderBy: { recordedAt: 'asc' },
    });
    if (readings.length < 2) return 0;
    const first = readings[0].reading;
    const last = readings[readings.length - 1].reading;
    return last - first;
  }
}

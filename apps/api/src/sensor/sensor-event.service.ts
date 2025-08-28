import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma.service';

interface SensorEventJob {
  unitId: string;
  type: 'leak' | 'temp';
  value?: number;
}

@Injectable()
export class SensorEventService {
  constructor(
    @InjectQueue('sensor-events') private readonly queue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async enqueue(data: SensorEventJob) {
    await this.queue.add('ingest', data);
    return { queued: true };
  }

  list(unitId: string) {
    return this.prisma.sensorEvent.findMany({
      where: { unitId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

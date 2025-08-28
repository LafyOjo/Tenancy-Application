import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma.service';
import { TicketPriority, TicketType } from '@prisma/client';

interface SensorEventJob {
  unitId: string;
  type: 'leak' | 'temp';
  value?: number;
}

@Processor('sensor-events')
export class SensorEventProcessor {
  constructor(private readonly prisma: PrismaService) {}

  @Process('ingest')
  async handle(job: Job<SensorEventJob>) {
    const { unitId, type, value } = job.data;
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) return;

    const { risk, action } = this.evaluate(type, value);

    await this.prisma.sensorEvent.create({
      data: {
        orgId: unit.orgId,
        unitId,
        type,
        value,
        riskScore: risk,
        action,
      },
    });

    await this.prisma.ticket.create({
      data: {
        orgId: unit.orgId,
        unitId,
        description: `${type} event${value !== undefined ? ` value ${value}` : ''}. Recommended action: ${action}`,
        type: TicketType.maintenance,
        priority: risk > 70 ? TicketPriority.high : TicketPriority.medium,
      },
    });
  }

  private evaluate(type: 'leak' | 'temp', value?: number) {
    if (type === 'leak') {
      return { risk: 90, action: 'Dispatch plumber to investigate leak' };
    }
    const temp = value ?? 0;
    if (temp > 30) {
      return { risk: 70, action: 'Check HVAC for overheating' };
    }
    if (temp < 5) {
      return { risk: 60, action: 'Check heating system for issues' };
    }
    return { risk: 10, action: 'Monitor temperature' };
  }
}

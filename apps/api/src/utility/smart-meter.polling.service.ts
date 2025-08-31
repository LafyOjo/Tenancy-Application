import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { SmartMeterAdapter, MeterReading } from './smart-meter.adapter';

interface UsagePoint {
  timestamp: Date;
  reading: number;
}

/**
 * Periodically polls the configured smart meter connector to collect
 * readings for usage graphs and raises alerts when spikes are detected.
 */
@Injectable()
export class SmartMeterPollingService {
  private readonly logger = new Logger(SmartMeterPollingService.name);
  private readonly history: Record<string, UsagePoint[]> = {};
  private readonly lastReading: Record<string, number> = {};

  constructor(private readonly adapter: SmartMeterAdapter) {}

  @Interval(60000)
  async poll() {
    // In a real scenario the service would iterate over many units.
    const unitId = 'demo-unit';
    const reading: MeterReading = await this.adapter.read(unitId);
    this.store(reading);
    this.detectSpike(reading);
  }

  private store(reading: MeterReading) {
    if (!this.history[reading.unitId]) {
      this.history[reading.unitId] = [];
    }
    this.history[reading.unitId].push({
      timestamp: reading.recordedAt,
      reading: reading.reading,
    });
    // limit in-memory history for demo purposes
    if (this.history[reading.unitId].length > 100) {
      this.history[reading.unitId].shift();
    }
  }

  private detectSpike(reading: MeterReading) {
    const last = this.lastReading[reading.unitId];
    if (last !== undefined && reading.reading - last > 100) {
      this.logger.warn(
        `Usage spike detected for ${reading.unitId}: ${reading.reading - last}`,
      );
    }
    this.lastReading[reading.unitId] = reading.reading;
  }

  /**
   * Retrieve usage data points for rendering graphs in the UI.
   */
  getUsageGraph(unitId: string): UsagePoint[] {
    return this.history[unitId] || [];
  }
}

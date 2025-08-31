import { Inject, Injectable } from '@nestjs/common';
import {
  SMART_METER_CONNECTOR,
  SmartMeterConnector,
} from './smart-meter.connector';

export interface MeterReading {
  unitId: string;
  reading: number;
  recordedAt: Date;
}

/**
 * Adapter layer wrapping the low level connector and
 * returning a normalized reading structure.
 */
@Injectable()
export class SmartMeterAdapter {
  constructor(
    @Inject(SMART_METER_CONNECTOR)
    private readonly connector: SmartMeterConnector,
  ) {}

  async read(unitId: string): Promise<MeterReading> {
    const reading = await this.connector.getReading(unitId);
    return { unitId, reading, recordedAt: new Date() };
  }
}

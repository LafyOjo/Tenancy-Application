export interface SmartMeterConnector {
  /**
   * Retrieve the latest usage reading for a given unit
   * @param unitId Identifier of the unit being metered
   */
  getReading(unitId: string): Promise<number>;
}

export const SMART_METER_CONNECTOR = 'SMART_METER_CONNECTOR';

/**
 * Mock connector used for development and tests. Generates
 * pseudo-random readings to emulate a physical smart meter.
 */
export class MockSmartMeterConnector implements SmartMeterConnector {
  async getReading(): Promise<number> {
    // return value between 0 and 999
    return Math.floor(Math.random() * 1000);
  }
}

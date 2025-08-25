import { Injectable } from '@nestjs/common';
import { Device, DeviceType } from '@prisma/client';

export interface SmartDeviceAdapter {
  lock?(device: Device): Promise<void>;
  unlock?(device: Device): Promise<void>;
  setTemperature?(device: Device, temperature: number): Promise<void>;
}

class MockAdapter implements SmartDeviceAdapter {
  async lock(device: Device) {
    console.log(`Mock lock ${device.id}`);
  }
  async unlock(device: Device) {
    console.log(`Mock unlock ${device.id}`);
  }
  async setTemperature(device: Device, temperature: number) {
    console.log(`Mock set temp ${temperature} on ${device.id}`);
  }
}

class LockyAdapter implements SmartDeviceAdapter {
  async lock(device: Device) {
    // Placeholder for Locky API call
    console.log(`Locky lock ${device.externalId}`);
  }
  async unlock(device: Device) {
    // Placeholder for Locky API call
    console.log(`Locky unlock ${device.externalId}`);
  }
}

class ThermixAdapter implements SmartDeviceAdapter {
  async setTemperature(device: Device, temperature: number) {
    // Placeholder for Thermix API call
    console.log(`ThermiX set temp ${temperature} on ${device.externalId}`);
  }
}

@Injectable()
export class SmartDeviceProvider {
  private readonly adapters: Record<string, SmartDeviceAdapter>;

  constructor() {
    this.adapters = {
      mock: new MockAdapter(),
      locky: new LockyAdapter(),
      thermix: new ThermixAdapter(),
    };
  }

  private getAdapter(device: Device): SmartDeviceAdapter {
    return this.adapters[device.adapter] || this.adapters['mock'];
  }

  lock(device: Device) {
    if (device.type !== DeviceType.lock) return Promise.resolve();
    return this.getAdapter(device).lock?.(device);
  }

  unlock(device: Device) {
    if (device.type !== DeviceType.lock) return Promise.resolve();
    return this.getAdapter(device).unlock?.(device);
  }

  setTemperature(device: Device, temperature: number) {
    if (device.type !== DeviceType.thermostat) return Promise.resolve();
    return this.getAdapter(device).setTemperature?.(device, temperature);
  }
}

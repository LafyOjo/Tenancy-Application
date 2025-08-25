import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { DeviceService } from './device.service';

const RegisterDevice = z.object({
  type: z.enum(['lock', 'thermostat']),
  adapter: z.enum(['mock', 'locky', 'thermix']),
  externalId: z.string(),
  name: z.string().optional(),
});

const SetTemp = z.object({
  temperature: z.number(),
});

@ApiTags('devices')
@Controller('units/:unitId/devices')
export class DeviceController {
  constructor(private readonly service: DeviceService) {}

  @Get()
  list(@Param('unitId') unitId: string) {
    return this.service.list(unitId);
  }

  @Post()
  register(@Param('unitId') unitId: string, @Body() body: any) {
    const data = RegisterDevice.parse(body);
    return this.service.register(unitId, data);
  }

  @Post(':deviceId/lock')
  lock(@Param('deviceId') id: string) {
    return this.service.lock(id);
  }

  @Post(':deviceId/unlock')
  unlock(@Param('deviceId') id: string) {
    return this.service.unlock(id);
  }

  @Post(':deviceId/set-temp')
  setTemp(@Param('deviceId') id: string, @Body() body: any) {
    const { temperature } = SetTemp.parse(body);
    return this.service.setTemperature(id, temperature);
  }
}

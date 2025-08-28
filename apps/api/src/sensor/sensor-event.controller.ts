import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SensorEventService } from './sensor-event.service';
import { z } from 'zod';

const EventSchema = z.object({
  unitId: z.string(),
  type: z.enum(['leak', 'temp']),
  value: z.number().optional(),
});

@Controller()
export class SensorEventController {
  constructor(private readonly service: SensorEventService) {}

  @Post('webhooks/sensor')
  webhook(@Body() body: any) {
    const data = EventSchema.parse(body);
    return this.service.enqueue(data);
  }

  @Get('units/:id/events')
  list(@Param('id') id: string) {
    return this.service.list(id);
  }
}

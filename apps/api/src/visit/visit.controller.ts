import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { VisitService } from './visit.service';

const VisitCreate = z.object({
  propertyId: z.string().optional(),
  unitId: z.string().optional(),
  ticketId: z.string().optional(),
  scheduledAt: z.coerce.date(),
  type: z.enum(['inspection', 'engineer']),
  notes: z.string().optional(),
  attendeeEmail: z.string().email().optional(),
  attendeePhone: z.string().optional(),
});

const VisitUpdate = z.object({
  outcome: z.enum(['completed', 'no_show', 'follow_up_required']).optional(),
  followUpAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

@ApiTags('visits')
@Controller('visits')
export class VisitController {
  constructor(private readonly service: VisitService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() body: any) {
    const data = VisitCreate.parse(body);
    return this.service.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data = VisitUpdate.parse(body);
    return this.service.update(id, data);
  }

  @Post(':id/snapshot')
  addSnapshot(@Param('id') id: string, @Body() body: any) {
    const data = z.object({ image: z.string() }).parse(body);
    return this.service.addSnapshot(id, data.image);
  }
}


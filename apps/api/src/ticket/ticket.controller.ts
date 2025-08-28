import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { TicketService } from './ticket.service';

const TicketCreate = z.object({
  unitId: z.string(),
  description: z.string(),
  type: z.enum(['maintenance', 'support', 'other']),
  priority: z.enum(['low', 'medium', 'high']),
  categoryId: z.string().optional(),
});

const TicketUpdate = z.object({
  status: z.enum(['open', 'in_progress', 'completed']).optional(),
  assignedToId: z.string().optional(),
  assignmentStatus: z.enum(['pending', 'accepted', 'declined']).optional(),
  eta: z.coerce.date().optional(),
  partsCost: z.number().optional(),
  labourCost: z.number().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  review: z.string().optional(),
});

@ApiTags('tickets')
@Controller('tickets')
export class TicketController {
  constructor(private readonly service: TicketService) {}

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
    const data = TicketCreate.parse(body);
    return this.service.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data = TicketUpdate.parse(body);
    return this.service.update(id, data);
  }

  @Post(':id/snapshot')
  addSnapshot(@Param('id') id: string, @Body() body: any) {
    const data = z.object({ image: z.string() }).parse(body);
    return this.service.addSnapshot(id, data.image);
  }
}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { AmendmentService } from './amendment.service';

const AmendmentCreate = z.object({ content: z.any().optional() });

@ApiTags('lease-amendments')
@Controller('leases/:leaseId/amendments')
export class AmendmentController {
  constructor(private readonly service: AmendmentService) {}

  @Get()
  list(@Param('leaseId') leaseId: string) {
    return this.service.list(leaseId);
  }

  @Post()
  create(@Param('leaseId') leaseId: string, @Body() body: any) {
    const data = AmendmentCreate.parse(body);
    return this.service.propose(leaseId, data.content);
  }

  @Post(':id/counter')
  counter(
    @Param('leaseId') leaseId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const data = AmendmentCreate.parse(body);
    return this.service.counter(id, data.content);
  }

  @Post(':id/accept')
  accept(@Param('id') id: string) {
    return this.service.accept(id);
  }

  @Post(':id/esign/start')
  startEsign(@Param('id') id: string) {
    return this.service.startEsign(id);
  }
}

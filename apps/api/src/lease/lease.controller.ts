import { Body, Controller, Get, Param, Post, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { LeaseService } from './lease.service';

const LeaseCreate = z.object({
  unitId: z.string(),
  householdId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  rentAmount: z.number(),
  rentFrequency: z.enum(['weekly', 'monthly', 'yearly']),
  depositAmount: z.number().optional(),
  utilityAllowances: z.any().optional(),
  autoRenew: z.boolean().optional(),
  breakClause: z.string().optional(),
  status: z.enum(['draft', 'active', 'renewing', 'ended']).optional(),
});

const LeaseUpdate = LeaseCreate.partial();

@ApiTags('leases')
@Controller('leases')
export class LeaseController {
  constructor(private readonly service: LeaseService) {}

  @Post()
  create(@Body() body: any) {
    const data = LeaseCreate.parse(body);
    return this.service.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data = LeaseUpdate.parse(body);
    return this.service.update(id, data);
  }

  /** Generate and return a lease PDF URL. */
  @Get(':id/pdf')
  pdf(@Param('id') id: string) {
    return this.service.generatePdf(id);
  }

  /** Start e-sign process for the lease. */
  @Post(':id/esign/start')
  startEsign(@Param('id') id: string) {
    return this.service.startEsign(id);
  }

  /** Webhook endpoint for e-sign completion. */
  @Post('esign/webhook')
  esignWebhook(@Body() body: any) {
    return this.service.handleWebhook(body);
  }
}


import { Body, Controller, Post } from '@nestjs/common';
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
}


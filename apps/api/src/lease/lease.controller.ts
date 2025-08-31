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

const LeaseShareSchema = z.object({
  membershipId: z.string(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number(),
});

const DepositCreate = z.object({
  amount: z.number(),
  receivedAt: z.string().datetime(),
  schemeRef: z.string().optional(),
  protectedAt: z.string().datetime().optional(),
});

const MoveOut = z.object({
  deductionAmount: z.number().optional(),
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

  @Get(':id/shares')
  getShares(@Param('id') id: string) {
    return this.service.getShares(id);
  }

  @Patch(':id/shares')
  updateShares(@Param('id') id: string, @Body() body: any) {
    const shares = z.array(LeaseShareSchema).parse(body);
    return this.service.updateShares(id, shares);
  }

  @Get(':id/deposit')
  getDeposit(@Param('id') id: string) {
    return this.service.getDeposit(id);
  }

  @Post(':id/deposit')
  createDeposit(@Param('id') id: string, @Body() body: any) {
    const data = DepositCreate.parse(body);
    return this.service.createDeposit(id, {
      ...data,
      receivedAt: new Date(data.receivedAt),
      protectedAt: data.protectedAt ? new Date(data.protectedAt) : undefined,
    });
  }

  @Post(':id/move-out')
  moveOut(@Param('id') id: string, @Body() body: any) {
    const data = MoveOut.parse(body);
    return this.service.recordMoveOut(id, data.deductionAmount);
  }

  @Post(':id/move-out/approve')
  approveMoveOut(@Param('id') id: string) {
    return this.service.approveMoveOut(id);
  }

  /** Webhook endpoint for e-sign completion. */
  @Post('esign/webhook')
  esignWebhook(@Body() body: any) {
    return this.service.handleWebhook(body);
  }
}


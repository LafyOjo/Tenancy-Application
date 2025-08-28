import { Controller, Get, Query, Post, Body, Res } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { Response } from 'express';

@Controller('ledger')
export class LedgerController {
  constructor(private ledgerService: LedgerService) {}

  @Get()
  async getEntries(
    @Query('orgId') orgId: string,
    @Query('leaseId') leaseId: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const startDate = start ? new Date(start) : new Date(0);
    const endDate = end ? new Date(end) : new Date();
    return this.ledgerService.getEntries(orgId, leaseId, startDate, endDate);
  }

  @Get('export')
  async exportCsv(
    @Query('orgId') orgId: string,
    @Query('leaseId') leaseId: string,
    @Query('start') start: string,
    @Query('end') end: string,
    @Res() res: Response,
  ) {
    const csv = await this.ledgerService.exportCsv(orgId, leaseId, new Date(start), new Date(end));
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  }

  @Post()
  async create(
    @Body()
    body: {
      orgId: string;
      leaseId?: string;
      date?: Date;
      description?: string;
      debitAccount: string;
      creditAccount: string;
      amount: number;
    },
  ) {
    return this.ledgerService.create(body);
  }
}

import { Body, Controller, Param, Post } from '@nestjs/common';
import { SublettingService } from './subletting.service';

@Controller('subletting')
export class SublettingController {
  constructor(private readonly sublettingService: SublettingService) {}

  @Post(':leaseId/approval')
  approve(
    @Param('leaseId') leaseId: string,
    @Body('revenueShare') revenueShare: number,
  ) {
    return this.sublettingService.approve(leaseId, revenueShare);
  }

  @Post('airbnb/:orgId')
  integrateAirbnb(
    @Param('orgId') orgId: string,
    @Body('listingId') listingId: string,
  ) {
    return this.sublettingService.integrateAirbnb(orgId, listingId);
  }

  @Post('payout/:approvalId')
  payout(
    @Param('approvalId') approvalId: string,
    @Body('amount') amount: number,
  ) {
    return this.sublettingService.recordPayout(approvalId, amount);
  }
}


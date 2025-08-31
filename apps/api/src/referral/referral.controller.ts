import { Controller, Post, Body, Get } from '@nestjs/common';
import { ReferralService } from './referral.service';

@Controller('referrals')
export class ReferralController {
  constructor(private readonly service: ReferralService) {}

  @Post('generate')
  generate(@Body('providerId') providerId: string) {
    return this.service.generateLink(providerId);
  }

  @Post('track')
  track(@Body('code') code: string) {
    const result = this.service.trackReferral(code);
    return result ?? { error: 'Invalid code' };
  }

  @Get('ledger')
  ledger() {
    return this.service.getLedger();
  }
}

import { Controller, Get, Post, Body } from '@nestjs/common';
import { UtilityProviderService } from './utility-provider.service';

@Controller('utility-providers')
export class UtilityProviderController {
  constructor(private readonly service: UtilityProviderService) {}

  @Get()
  list() {
    return this.service.listProviders();
  }

  @Post('switch')
  switch(@Body('providerId') providerId: string) {
    this.service.switchProvider(providerId);
    return { success: true };
  }

  @Get('referrals')
  referrals() {
    return this.service.getReferralCommissions();
  }
}

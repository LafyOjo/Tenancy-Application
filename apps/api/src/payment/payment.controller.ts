import { Body, Controller, Param, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { SubscriptionPlan } from '@tenancy/types';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('mandate/:leaseId')
  createMandate(@Param('leaseId') leaseId: string, @Body('provider') provider: string) {
    return this.paymentService.createMandate(leaseId, provider);
  }

  @Post('invoice/:invoiceId/link')
  createLink(@Param('invoiceId') invoiceId: string, @Body('provider') provider: string) {
    return this.paymentService.createPaymentLink(invoiceId, provider);
  }

  @Post('subscription/:membershipId')
  createSubscription(
    @Param('membershipId') membershipId: string,
    @Body('provider') provider: string,
    @Body('plan') plan: SubscriptionPlan,
  ) {
    return this.paymentService.createSubscription(membershipId, provider, plan);
  }

  @Post('webhook/:provider')
  handleWebhook(@Param('provider') provider: string, @Body() payload: any) {
    return this.paymentService.handleWebhook(provider, payload);
  }
}

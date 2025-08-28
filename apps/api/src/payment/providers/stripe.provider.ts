import { Injectable } from '@nestjs/common';
import { PaymentProvider } from './payment-provider.interface';

@Injectable()
export class StripeProvider implements PaymentProvider {
  name = 'stripe';

  async createMandate(leaseId: string) {
    return {
      id: `stripe-mandate-${leaseId}`,
      url: `https://stripe.example/mandate/${leaseId}`,
    };
  }

  async createOneOffLink(invoiceId: string) {
    return { url: `https://stripe.example/pay/${invoiceId}` };
  }

  async parseWebhook(payload: any) {
    return {
      id: payload.id,
      invoiceId: payload.invoiceId,
      amount: payload.amount,
      type: payload.type,
    };
  }
}

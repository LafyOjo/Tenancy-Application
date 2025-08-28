import { Injectable } from '@nestjs/common';
import { PaymentProvider } from './payment-provider.interface';

@Injectable()
export class PaypalProvider implements PaymentProvider {
  name = 'paypal';

  async createMandate(leaseId: string) {
    return {
      id: `paypal-mandate-${leaseId}`,
      url: `https://paypal.example/mandate/${leaseId}`,
    };
  }

  async createOneOffLink(invoiceId: string) {
    return { url: `https://paypal.example/pay/${invoiceId}` };
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

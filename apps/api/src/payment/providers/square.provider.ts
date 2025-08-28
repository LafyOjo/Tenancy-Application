import { Injectable } from '@nestjs/common';
import { PaymentProvider } from './payment-provider.interface';

@Injectable()
export class SquareProvider implements PaymentProvider {
  name = 'square';

  async createMandate(leaseId: string) {
    return {
      id: `square-mandate-${leaseId}`,
      url: `https://square.example/mandate/${leaseId}`,
    };
  }

  async createOneOffLink(invoiceId: string) {
    return { url: `https://square.example/pay/${invoiceId}` };
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

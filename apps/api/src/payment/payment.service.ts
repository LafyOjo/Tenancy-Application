import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PaymentProvider } from './providers/payment-provider.interface';
import { StripeProvider } from './providers/stripe.provider';
import { PaypalProvider } from './providers/paypal.provider';
import { SquareProvider } from './providers/square.provider';
import { SubscriptionPlan } from '@tenancy/types';

@Injectable()
export class PaymentService {
  private providers: Record<string, PaymentProvider>;

  constructor(
    private prisma: PrismaService,
    stripe: StripeProvider,
    paypal: PaypalProvider,
    square: SquareProvider,
  ) {
    this.providers = {
      [stripe.name]: stripe,
      [paypal.name]: paypal,
      [square.name]: square,
    };
  }

  async createMandate(leaseId: string, providerKey: string) {
    const provider = this.providers[providerKey];
    if (!provider) throw new Error('Unknown provider');
    const mandate = await provider.createMandate(leaseId);
    const lease = await this.prisma.lease.findUnique({ where: { id: leaseId } });
    if (!lease) throw new Error('Lease not found');
    await this.prisma.paymentMandate.create({
      data: {
        leaseId,
        orgId: lease.orgId,
        provider: providerKey,
        externalId: mandate.id,
      },
    });
    return mandate;
  }

  async createPaymentLink(invoiceId: string, providerKey: string) {
    const provider = this.providers[providerKey];
    if (!provider) throw new Error('Unknown provider');
    return provider.createOneOffLink(invoiceId);
  }

  async createSubscription(
    membershipId: string,
    providerKey: string,
    plan: SubscriptionPlan,
  ) {
    const provider = this.providers[providerKey];
    if (!provider) throw new Error('Unknown provider');
    const session = await provider.createSubscription(plan);
    await this.prisma.membership.update({
      where: { id: membershipId },
      data: { subscriptionPlan: plan },
    });
    return session;
  }

  async handleWebhook(providerKey: string, payload: any) {
    const provider = this.providers[providerKey];
    if (!provider) throw new Error('Unknown provider');
    const event = await provider.parseWebhook(payload);
    if (event.type === 'payment.succeeded') {
      const invoice = await this.prisma.invoice.findUnique({ where: { id: event.invoiceId } });
      if (!invoice) return;
      await this.prisma.payment.create({
        data: {
          orgId: invoice.orgId,
          invoiceId: invoice.id,
          provider: providerKey,
          externalId: event.id,
          amount: event.amount,
        },
      });
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { paidAt: new Date() },
      });
      await this.prisma.auditLog.create({
        data: {
          orgId: invoice.orgId,
          action: 'payment_received',
          target: `invoice:${invoice.id}`,
        },
      });
    }
  }
}

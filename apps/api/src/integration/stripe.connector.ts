import { Injectable } from '@nestjs/common';
import { OAuthConnector } from './connector.interface';
import { SecretService } from './secret.service';

@Injectable()
export class StripeConnector implements OAuthConnector {
  name = 'stripe';

  constructor(private readonly secrets: SecretService) {}

  getAuthUrl(): string {
    const clientId = this.secrets.get('STRIPE_CLIENT_ID');
    return `https://connect.stripe.com/oauth/authorize?client_id=${clientId}`;
  }

  async handleCallback(code: string): Promise<void> {
    this.secrets.set('STRIPE_TOKEN', `token-${code}`);
  }

  async isHealthy(): Promise<boolean> {
    return !!this.secrets.get('STRIPE_TOKEN');
  }
}

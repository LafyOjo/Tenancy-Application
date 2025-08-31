import { Injectable } from '@nestjs/common';
import { OAuthConnector } from './connector.interface';
import { SecretService } from './secret.service';

@Injectable()
export class PayPalConnector implements OAuthConnector {
  name = 'paypal';

  constructor(private readonly secrets: SecretService) {}

  getAuthUrl(): string {
    const clientId = this.secrets.get('PAYPAL_CLIENT_ID');
    return `https://www.paypal.com/connect?flowEntry=static&client_id=${clientId}`;
  }

  async handleCallback(code: string): Promise<void> {
    this.secrets.set('PAYPAL_TOKEN', `token-${code}`);
  }

  async isHealthy(): Promise<boolean> {
    return !!this.secrets.get('PAYPAL_TOKEN');
  }
}

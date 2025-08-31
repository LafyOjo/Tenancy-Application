import { Injectable } from '@nestjs/common';
import { OAuthConnector } from './connector.interface';
import { SecretService } from './secret.service';

@Injectable()
export class QuickBooksConnector implements OAuthConnector {
  name = 'quickbooks';

  constructor(private readonly secrets: SecretService) {}

  getAuthUrl(): string {
    const clientId = this.secrets.get('QUICKBOOKS_CLIENT_ID');
    return `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}`;
  }

  async handleCallback(code: string): Promise<void> {
    this.secrets.set('QUICKBOOKS_TOKEN', `token-${code}`);
  }

  async isHealthy(): Promise<boolean> {
    return !!this.secrets.get('QUICKBOOKS_TOKEN');
  }
}

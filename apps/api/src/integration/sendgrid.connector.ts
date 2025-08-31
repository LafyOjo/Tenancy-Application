import { Injectable } from '@nestjs/common';
import { OAuthConnector } from './connector.interface';
import { SecretService } from './secret.service';

@Injectable()
export class SendGridConnector implements OAuthConnector {
  name = 'sendgrid';

  constructor(private readonly secrets: SecretService) {}

  getAuthUrl(): string {
    const clientId = this.secrets.get('SENDGRID_CLIENT_ID');
    return `https://sendgrid.com/oauth/authorize?client_id=${clientId}`;
  }

  async handleCallback(code: string): Promise<void> {
    this.secrets.set('SENDGRID_TOKEN', `token-${code}`);
  }

  async isHealthy(): Promise<boolean> {
    return !!this.secrets.get('SENDGRID_TOKEN');
  }
}

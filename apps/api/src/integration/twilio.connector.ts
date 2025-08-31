import { Injectable } from '@nestjs/common';
import { OAuthConnector } from './connector.interface';
import { SecretService } from './secret.service';

@Injectable()
export class TwilioConnector implements OAuthConnector {
  name = 'twilio';

  constructor(private readonly secrets: SecretService) {}

  getAuthUrl(): string {
    const clientId = this.secrets.get('TWILIO_CLIENT_ID');
    return `https://login.twilio.com/oauth/authorize?client_id=${clientId}`;
  }

  async handleCallback(code: string): Promise<void> {
    this.secrets.set('TWILIO_TOKEN', `token-${code}`);
  }

  async isHealthy(): Promise<boolean> {
    return !!this.secrets.get('TWILIO_TOKEN');
  }
}

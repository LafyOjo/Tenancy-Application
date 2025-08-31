import { Injectable } from '@nestjs/common';
import { OAuthConnector } from './connector.interface';
import { SecretService } from './secret.service';

@Injectable()
export class GoCardlessConnector implements OAuthConnector {
  name = 'gocardless';

  constructor(private readonly secrets: SecretService) {}

  getAuthUrl(): string {
    const clientId = this.secrets.get('GOCARDLESS_CLIENT_ID');
    return `https://connect.gocardless.com/oauth/authorize?client_id=${clientId}`;
  }

  async handleCallback(code: string): Promise<void> {
    this.secrets.set('GOCARDLESS_TOKEN', `token-${code}`);
  }

  async isHealthy(): Promise<boolean> {
    return !!this.secrets.get('GOCARDLESS_TOKEN');
  }
}

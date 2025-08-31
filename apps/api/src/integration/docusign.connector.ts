import { Injectable } from '@nestjs/common';
import { OAuthConnector } from './connector.interface';
import { SecretService } from './secret.service';

@Injectable()
export class DocuSignConnector implements OAuthConnector {
  name = 'docusign';

  constructor(private readonly secrets: SecretService) {}

  getAuthUrl(): string {
    const clientId = this.secrets.get('DOCUSIGN_CLIENT_ID');
    return `https://account.docusign.com/oauth/auth?response_type=code&client_id=${clientId}`;
  }

  async handleCallback(code: string): Promise<void> {
    this.secrets.set('DOCUSIGN_TOKEN', `token-${code}`);
  }

  async isHealthy(): Promise<boolean> {
    return !!this.secrets.get('DOCUSIGN_TOKEN');
  }
}

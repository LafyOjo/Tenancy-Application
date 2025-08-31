import { Inject, Injectable } from '@nestjs/common';
import { OAuthConnector } from '../integration/connector.interface';
import { OAUTH_CONNECTORS } from '../integration/integration.module';

@Injectable()
export class HealthService {
  constructor(
    @Inject(OAUTH_CONNECTORS) private readonly connectors: OAuthConnector[]
  ) {}

  async check() {
    const connectors = await Promise.all(
      this.connectors.map(async (c) => ({
        name: c.name,
        healthy: await c.isHealthy(),
      }))
    );
    return { status: 'ok', connectors };
  }
}

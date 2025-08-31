import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.headers['x-api-key'];
    if (!key) throw new UnauthorizedException('API key missing');
    const record = await this.apiKeyService.validate(key);
    if (!record) throw new UnauthorizedException('Invalid API key');
    if (record.usage >= record.quota) {
      throw new ForbiddenException('Quota exceeded');
    }
    await this.apiKeyService.incrementUsage(record.id);
    request.orgId = record.orgId;
    return true;
  }
}

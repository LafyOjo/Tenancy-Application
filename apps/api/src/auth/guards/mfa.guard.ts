import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class MfaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: any }>();
    // Skip MFA for auth routes
    if (req.path.startsWith('/auth')) {
      return true;
    }
    const user = req.user;
    // If user has MFA enabled, require x-mfa-verified header
    if (user?.totpEnabled && req.headers['x-mfa-verified'] !== 'true') {
      throw new ForbiddenException('MFA required');
    }
    return true;
  }
}

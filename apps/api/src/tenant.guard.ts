import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

/**
 * TenantGuard extracts the organization id from the authenticated user's JWT
 * and attaches it to the request object. Repositories can then automatically
 * scope their queries to the current organization.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const orgId = request.user?.orgId;

    if (!orgId) {
      throw new ForbiddenException('Organization missing in token');
    }

    // make orgId available to downstream providers and repositories
    request.orgId = orgId;
    return true;
  }
}

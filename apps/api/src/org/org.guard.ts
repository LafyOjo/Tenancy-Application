import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

/**
 * OrgGuard enforces that the current user has access to the requested organization.
 * It mimics row level security by validating membership before allowing the request
 * to proceed. The handler can rely on `req.orgId` for scoping queries.
 */
@Injectable()
export class OrgGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const orgId: string | undefined = request.params.orgId || request.body.orgId;
    const userId: string | undefined = request.user?.id;

    if (!orgId || !userId) {
      throw new ForbiddenException('Missing organization or user information');
    }

    const membership = await this.prisma.membership.findFirst({
      where: { orgId, userId },
    });

    if (!membership) {
      throw new ForbiddenException('Access denied to organization');
    }

    request.orgId = orgId;
    return true;
  }
}

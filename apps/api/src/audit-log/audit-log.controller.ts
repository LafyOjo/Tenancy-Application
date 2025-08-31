import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly service: AuditLogService) {}

  @Get()
  list(
    @Query('orgId') orgId?: string,
    @Query('actorId') actorId?: string,
    @Query('action') action?: string
  ) {
    return this.service.list({ orgId, actorId, action });
  }
}

import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto';

@ApiTags('api-keys')
@Controller('api-keys')
export class ApiKeyController {
  constructor(private apiKeyService: ApiKeyService) {}

  @Post()
  create(@Body() dto: CreateApiKeyDto) {
    const orgId = dto.orgId ?? 'default-org';
    return this.apiKeyService.create(orgId, dto.scopes, dto.quota);
  }

  @Get()
  list(@Query('orgId') orgId: string) {
    return this.apiKeyService.list(orgId);
  }

  @Get(':id/usage')
  usage(@Param('id') id: string) {
    return this.apiKeyService.getUsage(id);
  }
}

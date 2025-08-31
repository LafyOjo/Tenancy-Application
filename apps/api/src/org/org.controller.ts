import { Controller, Get, Param, Put, Body } from '@nestjs/common';
import { OrgService } from './org.service';

@Controller('org')
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Get(':id/theme')
  getTheme(@Param('id') id: string) {
    return this.orgService.getTheme(id);
  }

  @Put(':id/theme')
  updateTheme(@Param('id') id: string, @Body() body: any) {
    return this.orgService.updateTheme(id, body);
  }
}

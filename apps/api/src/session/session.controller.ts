import { Controller, Get, Delete, Param } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('sessions')
export class SessionController {
  constructor(private readonly service: SessionService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Delete(':id')
  revoke(@Param('id') id: string) {
    return this.service.revoke(id);
  }
}

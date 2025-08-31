import { Controller, Get } from '@nestjs/common';
import { DisputeService } from './dispute.service';

@Controller('disputes')
export class DisputeController {
  constructor(private readonly service: DisputeService) {}

  @Get()
  list() {
    return this.service.list();
  }
}

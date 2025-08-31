import { Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get('export')
  export() {
    return this.service.export();
  }

  @Post('anonymize')
  anonymize() {
    return this.service.anonymize();
  }
}

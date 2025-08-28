import { Body, Controller, Param, Post } from '@nestjs/common';
import { NoticeService } from './notice.service';

@Controller('notice')
export class NoticeController {
  constructor(private readonly service: NoticeService) {}

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Post(':id/acknowledge')
  acknowledge(@Param('id') id: string) {
    return this.service.acknowledge(id);
  }
}

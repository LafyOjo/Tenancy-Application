import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get(':userId')
  inbox(@Param('userId') userId: string) {
    return this.service.getInbox(userId);
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }

  @Post('preferences/:userId/:event')
  setPref(
    @Param('userId') userId: string,
    @Param('event') event: string,
    @Body() body: any
  ) {
    return this.service.setPreference(userId, event, body);
  }

  @Post('push-subscription/:userId')
  subscribe(@Param('userId') userId: string, @Body() body: any) {
    return this.service.registerSubscription(userId, body);
  }
}

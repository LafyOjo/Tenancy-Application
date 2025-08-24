import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { z } from 'zod';

const HelloQuery = z.object({ name: z.string().optional() });

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello(@Query() query: Record<string, any>): string {
    const { name } = HelloQuery.parse(query);
    return `${this.appService.getHello()}${name ? ', ' + name : ''}`;
  }
}

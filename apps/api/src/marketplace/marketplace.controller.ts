import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MarketplaceService } from './marketplace.service';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly service: MarketplaceService) {}

  @Get('tradespeople')
  list(
    @Query('category') category?: string,
    @Query('area') area?: string,
  ) {
    return this.service.listTradespeople(category, area);
  }

  @Post('jobs')
  createJob(
    @Body() body: { orgId: string; tradespersonId: string; description: string; price: number },
  ) {
    return this.service.createJob(body);
  }

  @Post('jobs/:id/checkout')
  checkout(@Param('id') id: string) {
    return this.service.checkout(id);
  }
}


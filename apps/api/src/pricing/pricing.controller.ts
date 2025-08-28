import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { PricingService } from './pricing.service';

const SuggestQuery = z.object({ unitId: z.string() });

@ApiTags('pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly service: PricingService) {}

  @Get('suggestions')
  suggestions(@Query() query: any) {
    const { unitId } = SuggestQuery.parse(query);
    return this.service.suggest(unitId);
  }
}

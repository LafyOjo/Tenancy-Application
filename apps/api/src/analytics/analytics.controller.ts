import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { AnalyticsService } from './analytics.service';

const Filters = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  propertyId: z.string().optional(),
  unitId: z.string().optional(),
});

const Market = z.object({
  area: z.string().optional(),
  yield: z.coerce.number(),
  vacancy: z.coerce.number(),
});

function parseFilters(query: any) {
  const { startDate, endDate, propertyId, unitId } = Filters.parse(query);
  return {
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    propertyId,
    unitId,
  };
}

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('arrears')
  arrears(@Query() query: any) {
    return this.service.arrears(parseFilters(query));
  }

  @Get('dso')
  dso(@Query() query: any) {
    return this.service.dso(parseFilters(query));
  }

  @Get('on-time-rate')
  onTime(@Query() query: any) {
    return this.service.onTimePaymentRate(parseFilters(query));
  }

  @Get('mttr')
  mttr(@Query() query: any) {
    return this.service.mttr(parseFilters(query));
  }

  @Get('utility-overage')
  overage(@Query() query: any) {
    return this.service.utilityOverage(parseFilters(query));
  }

  @Get('market-comparison')
  market(@Query() query: any) {
    const { area, yield: y, vacancy } = Market.parse(query);
    return this.service.marketComparison(area ?? '', y, vacancy);
  }

  @Get('risk/:leaseId')
  risk(@Param('leaseId') id: string) {
    return this.service.risk(id);
  }
}


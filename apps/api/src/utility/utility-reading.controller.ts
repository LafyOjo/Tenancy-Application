import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { UtilityReadingService } from './utility-reading.service';

const ReadingCreate = z.object({
  unitId: z.string(),
  type: z.string(),
  reading: z.number(),
  recordedAt: z.string().datetime().optional(),
});

const ReadingUpdate = ReadingCreate.partial();

const ImportCsv = z.object({
  unitId: z.string(),
  csv: z.string(),
});

@ApiTags('utility-readings')
@Controller('utility-readings')
export class UtilityReadingController {
  constructor(private readonly service: UtilityReadingService) {}

  @Get()
  list(@Query('unitId') unitId: string, @Query('type') type?: string) {
    return this.service.list(unitId, type);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() body: any) {
    const data = ReadingCreate.parse(body);
    return this.service.create({
      ...data,
      recordedAt: data.recordedAt ? new Date(data.recordedAt) : undefined,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data = ReadingUpdate.parse(body);
    return this.service.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post('import')
  importCsv(@Body() body: any) {
    const { unitId, csv } = ImportCsv.parse(body);
    return this.service.importCsv(unitId, csv);
  }
}

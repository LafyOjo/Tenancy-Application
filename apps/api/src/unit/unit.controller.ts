import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { UnitService } from './unit.service';
import { GreenService } from '../green/green.service';
import { PricingService } from '../pricing/pricing.service';
import { Response } from 'express';

const UnitCreate = z.object({
  name: z.string(),
  propertyId: z.string(),
  virtualTourEmbedUrl: z.string().url().optional(),
});

const UnitUpdate = UnitCreate.partial();

const UploadPhoto = z.object({
  filename: z.string(),
  contentType: z.string(),
});

@ApiTags('units')
@Controller('units')
export class UnitController {
  constructor(
    private readonly service: UnitService,
    private readonly green: GreenService,
    private readonly pricing: PricingService,
  ) {}

  @Get()
  list(@Query('propertyId') propertyId: string) {
    return this.service.list(propertyId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() body: any) {
    const data = UnitCreate.parse(body);
    return this.service.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data = UnitUpdate.parse(body);
    return this.service.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/photo')
  uploadPhoto(@Param('id') id: string, @Body() body: any) {
    const { filename, contentType } = UploadPhoto.parse(body);
    return this.service.createPhotoUpload(id, filename, contentType);
  }

  @Post(':id/virtual-tour/photo')
  uploadVirtualTourPhoto(@Param('id') id: string, @Body() body: any) {
    const { filename, contentType } = UploadPhoto.parse(body);
    return this.service.createVirtualTourImageUpload(id, filename, contentType);
  }

  @Get(':id/green-score')
  async greenScore(@Param('id') id: string) {
    const { score, trend } = await this.green.getScore(id);
    const pricing = await this.pricing.suggest(id);
    return { score, trend, premiumRent: pricing.suggestedRent };
  }

  @Get(':id/green-report')
  async greenReport(@Param('id') id: string, @Res() res: Response) {
    const pdf = await this.green.generateReport(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="green-report.pdf"',
    });
    res.send(pdf);
  }
}


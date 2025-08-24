import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { z } from 'zod';
import { ApiTags } from '@nestjs/swagger';
import { PropertyService } from './property.service';

const PropertyCreate = z.object({
  name: z.string(),
  address: z.string().optional(),
});

const PropertyUpdate = PropertyCreate.partial();

const UploadPhoto = z.object({
  filename: z.string(),
  contentType: z.string(),
});

@ApiTags('properties')
@Controller('properties')
export class PropertyController {
  constructor(private readonly service: PropertyService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post()
  create(@Body() body: any) {
    const data = PropertyCreate.parse(body);
    return this.service.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data = PropertyUpdate.parse(body);
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
}


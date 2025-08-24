import { Controller, Post, Get, UploadedFile, UseInterceptors, Query, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PropertyService } from './property.service';
import { Response } from 'express';

@Controller()
export class PropertyImportExportController {
  constructor(private readonly service: PropertyService) {}

  @Post('properties:import')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
    @Query('commit') commit?: string,
  ) {
    const text = file.buffer.toString();
    return this.service.importCsv(text, commit === 'true');
  }

  @Get('properties:export')
  async exportCsv(@Res() res: Response) {
    const csv = await this.service.exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="properties.csv"');
    res.send(csv);
  }
}

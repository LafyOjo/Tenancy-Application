import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InvoiceService } from './invoice.service';

@ApiTags('invoices')
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly service: InvoiceService) {}

  @Get(':id/shares')
  getShares(@Param('id') id: string) {
    return this.service.getShares(id);
  }
}

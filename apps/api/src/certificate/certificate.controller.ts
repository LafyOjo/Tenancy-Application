import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { S3Service } from '../s3.service';
import { CertificateType } from '@prisma/client';

@Controller('certificates')
export class CertificateController {
  constructor(
    private readonly certificates: CertificateService,
    private readonly s3: S3Service,
  ) {}

  @Post('upload-url')
  getUploadUrl(@Body() body: { filename: string; contentType: string }) {
    const key = `certificates/${Date.now()}-${body.filename}`;
    return this.s3.getSignedUploadUrl(key, body.contentType);
  }

  @Post()
  create(
    @Body()
    body: {
      orgId: string;
      propertyId?: string;
      unitId?: string;
      type: CertificateType;
      expiryDate: string;
      fileUrl?: string;
    },
  ) {
    return this.certificates.create({
      ...body,
      expiryDate: new Date(body.expiryDate),
    });
  }

  @Get('property/:propertyId')
  listForProperty(@Param('propertyId') propertyId: string) {
    return this.certificates.listForProperty(propertyId);
  }

  @Get('unit/:unitId')
  listForUnit(@Param('unitId') unitId: string) {
    return this.certificates.listForUnit(unitId);
  }
}

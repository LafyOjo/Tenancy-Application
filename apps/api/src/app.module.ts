import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { PropertyService } from './property/property.service';
import { PropertyRepository } from './property/property.repository';
import { PropertyController } from './property/property.controller';
import { PropertyImportExportController } from './property/property-import-export.controller';
import { TenantGuard } from './tenant.guard';
import { AuthModule } from './auth/auth.module';
import { S3Service } from './s3.service';
import { UnitRepository } from './unit/unit.repository';
import { UnitService } from './unit/unit.service';
import { UnitController } from './unit/unit.controller';
import { DeviceController } from './device/device.controller';
import { DeviceRepository } from './device/device.repository';
import { DeviceService } from './device/device.service';
import { SmartDeviceProvider } from './device/smart-device.provider';
import { LeaseController } from './lease/lease.controller';
import { LeaseRepository } from './lease/lease.repository';
import { LeaseService } from './lease/lease.service';
import { PdfService } from './lease/pdf.service';
import { EsignService } from './lease/esign.service';
import { AmendmentController } from './lease/amendment.controller';
import { AmendmentRepository } from './lease/amendment.repository';
import { AmendmentService } from './lease/amendment.service';
import { CertificateController } from './certificate/certificate.controller';
import { CertificateService } from './certificate/certificate.service';
import { CertificateRepository } from './certificate/certificate.repository';
import { CertificateReminderService } from './certificate/certificate.scheduler';
import { PricingController } from './pricing/pricing.controller';
import { PricingService } from './pricing/pricing.service';
import { NoticeController } from './notice/notice.controller';
import { NoticeRepository } from './notice/notice.repository';
import { NoticeService } from './notice/notice.service';
import { NoticePdfService } from './notice/pdf.service';
import { InvoiceService } from './invoice/invoice.service';
import { PaymentController } from './payment/payment.controller';
import { PaymentService } from './payment/payment.service';
import { StripeProvider } from './payment/providers/stripe.provider';
import { PaypalProvider } from './payment/providers/paypal.provider';
import { SquareProvider } from './payment/providers/square.provider';

@Module({
  imports: [AuthModule, ScheduleModule.forRoot()],
  controllers: [
    AppController,
    PropertyController,
    UnitController,
    PropertyImportExportController,
    DeviceController,
    LeaseController,
    AmendmentController,
    PricingController,
    CertificateController,
    NoticeController,
    PaymentController,
  ],
  providers: [
    AppService,
    PrismaService,
    S3Service,
    PropertyRepository,
    PropertyService,
    UnitRepository,
    UnitService,
    DeviceRepository,
    DeviceService,
    SmartDeviceProvider,
    LeaseRepository,
    LeaseService,
    AmendmentRepository,
    AmendmentService,
    PdfService,
    EsignService,
    TenantGuard,
    PricingService,
    CertificateRepository,
    CertificateService,
    CertificateReminderService,
    NoticeRepository,
    NoticeService,
    NoticePdfService,
    InvoiceService,
    PaymentService,
    StripeProvider,
    PaypalProvider,
    SquareProvider,
  ],
})
export class AppModule {}

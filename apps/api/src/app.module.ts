import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
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
import { InvoiceReminderService } from './invoice/invoice.scheduler';
import { InvoiceController } from './invoice/invoice.controller';
import { PaymentController } from './payment/payment.controller';
import { PaymentService } from './payment/payment.service';
import { PaymentPlanService } from './payment/payment-plan.service';
import { StripeProvider } from './payment/providers/stripe.provider';
import { PaypalProvider } from './payment/providers/paypal.provider';
import { SquareProvider } from './payment/providers/square.provider';
import { LedgerController } from './ledger/ledger.controller';
import { LedgerService } from './ledger/ledger.service';
import { SublettingController } from './subletting/subletting.controller';
import { SublettingService } from './subletting/subletting.service';
import { TicketController } from './ticket/ticket.controller';
import { TicketRepository } from './ticket/ticket.repository';
import { TicketService } from './ticket/ticket.service';
import { SensorEventService } from './sensor/sensor-event.service';
import { SensorEventController } from './sensor/sensor-event.controller';
import { SensorEventProcessor } from './sensor/sensor-event.processor';
import { MarketplaceController } from './marketplace/marketplace.controller';
import { MarketplaceService } from './marketplace/marketplace.service';
import { VisitController } from './visit/visit.controller';
import { VisitRepository } from './visit/visit.repository';
import { VisitService } from './visit/visit.service';

@Module({
  imports: [
    AuthModule,
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: +(process.env.REDIS_PORT || 6379),
      },
    }),
    BullModule.registerQueue({ name: 'sensor-events' }),
  ],
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
    InvoiceController,
    PaymentController,
    LedgerController,
    SublettingController,
    TicketController,
    VisitController,
    SensorEventController,
    MarketplaceController,
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
    InvoiceReminderService,
    PaymentService,
    PaymentPlanService,
    StripeProvider,
    PaypalProvider,
    SquareProvider,
    LedgerService,
    SublettingService,
    TicketRepository,
    TicketService,
    VisitRepository,
    VisitService,
    SensorEventService,
    SensorEventProcessor,
    MarketplaceService,
  ],
})
export class AppModule {}

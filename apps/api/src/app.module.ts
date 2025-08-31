import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
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
import { AssessmentController } from './assessment/assessment.controller';
import { AssessmentService } from './assessment/assessment.service';
import { UtilityReadingController } from './utility/utility-reading.controller';
import { UtilityReadingRepository } from './utility/utility-reading.repository';
import { UtilityReadingService } from './utility/utility-reading.service';
import { SmartMeterAdapter } from './utility/smart-meter.adapter';
import {
  SMART_METER_CONNECTOR,
  MockSmartMeterConnector,
} from './utility/smart-meter.connector';
import { SmartMeterPollingService } from './utility/smart-meter.polling.service';
import { GreenScoreRepository } from './green/green-score.repository';
import { GreenService } from './green/green.service';
import { UtilityProviderController } from './utility-provider/utility-provider.controller';
import { UtilityProviderService } from './utility-provider/utility-provider.service';
import { AnalyticsController } from './analytics/analytics.controller';
import { AnalyticsService } from './analytics/analytics.service';
import { MarketDataService } from './analytics/market-data.service';
import { IntegrationModule } from './integration/integration.module';
import { HealthModule } from './health/health.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { OrgController } from './org/org.controller';
import { OrgService } from './org/org.service';
import { ReferralController } from './referral/referral.controller';
import { ReferralService } from './referral/referral.service';
import { DisputeController } from './dispute/dispute.controller';
import { DisputeService } from './dispute/dispute.service';

@Module({
  imports: [
    AuthModule,
    ApiKeyModule,
    ThrottlerModule.forRoot({ ttl: 60, limit: 100 }),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: +(process.env.REDIS_PORT || 6379),
      },
    }),
    BullModule.registerQueue({ name: 'sensor-events' }),
    IntegrationModule,
    HealthModule,
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
    AssessmentController,
    UtilityReadingController,
    UtilityProviderController,
    ReferralController,
    DisputeController,
    AnalyticsController,
    OrgController,
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
    AssessmentService,
    UtilityReadingRepository,
    UtilityReadingService,
    SmartMeterAdapter,
    SmartMeterPollingService,
    GreenScoreRepository,
    GreenService,
    UtilityProviderService,
    ReferralService,
    DisputeService,
    AnalyticsService,
    MarketDataService,
    OrgService,
    {
      provide: SMART_METER_CONNECTOR,
      useClass: MockSmartMeterConnector,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

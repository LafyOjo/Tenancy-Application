import { Module } from '@nestjs/common';
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

@Module({
  imports: [AuthModule],
  controllers: [
    AppController,
    PropertyController,
    UnitController,
    PropertyImportExportController,
    DeviceController,
    LeaseController,
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
    TenantGuard,
  ],
})
export class AppModule {}

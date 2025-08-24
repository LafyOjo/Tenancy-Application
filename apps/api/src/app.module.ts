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

@Module({
  imports: [AuthModule],
  controllers: [
    AppController,
    PropertyController,
    UnitController,
    PropertyImportExportController,
  ],
  providers: [
    AppService,
    PrismaService,
    S3Service,
    PropertyRepository,
    PropertyService,
    UnitRepository,
    UnitService,
    TenantGuard,
  ],
})
export class AppModule {}

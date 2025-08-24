import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { PropertyService } from './property/property.service';
import { PropertyRepository } from './property/property.repository';
import { TenantGuard } from './tenant.guard';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    PropertyRepository,
    PropertyService,
    TenantGuard,
  ],
})
export class AppModule {}

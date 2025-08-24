import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { PropertyService } from './property/property.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService, PropertyService],
})
export class AppModule {}

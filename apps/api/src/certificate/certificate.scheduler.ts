import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CertificateService } from './certificate.service';

@Injectable()
export class CertificateReminderService {
  private readonly logger = new Logger(CertificateReminderService.name);
  constructor(private readonly certificates: CertificateService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCron() {
    const now = new Date();
    for (const days of [30, 7, 1]) {
      const upcoming = await this.certificates.expiringWithin(days);
      upcoming.forEach((c) => {
        const diff = Math.ceil(
          (c.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diff === days) {
          // TODO: Send email/SMS/WhatsApp reminder
          this.logger.log(
            `Certificate ${c.id} expiring in ${diff} days`,
          );
        }
      });
    }
  }
}

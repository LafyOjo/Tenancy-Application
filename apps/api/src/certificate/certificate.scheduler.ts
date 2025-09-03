import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CertificateService } from './certificate.service';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CertificateReminderService {
  private readonly logger = new Logger(CertificateReminderService.name);
  constructor(
    private readonly certificates: CertificateService,
    private readonly notifications: NotificationService,
    private readonly prisma: PrismaService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCron() {
    const now = new Date();
    for (const days of [30, 7, 1]) {
      const upcoming = await this.certificates.expiringWithin(days);
      for (const c of upcoming) {
        const diff = Math.ceil(
          (c.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diff === days) {
          const members = await this.prisma.membership.findMany({
            where: { orgId: c.orgId },
          });
          await Promise.all(
            members.map((m) =>
              this.notifications.create({
                orgId: c.orgId,
                userId: m.userId,
                event: 'certificate.expiry',
                message: `Certificate ${c.type} for ${
                  c.property?.name || c.unit?.name || 'unknown'
                } expires in ${diff} days`,
              }),
            ),
          );
          this.logger.log(
            `Certificate ${c.id} expiring in ${diff} days`,
          );
        }
      }
    }
  }
}

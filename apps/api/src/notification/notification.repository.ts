import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private prisma: PrismaService) {}

  createNotification(data: any) {
    return this.prisma.notification.create({ data });
  }

  findNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  markRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  upsertPreference(data: any) {
    return this.prisma.notificationPreference.upsert({
      where: { userId_event: { userId: data.userId, event: data.event } },
      update: data,
      create: data,
    });
  }

  findPreference(userId: string, event: string) {
    return this.prisma.notificationPreference.findUnique({
      where: { userId_event: { userId, event } },
    });
  }

  upsertSubscription(
    userId: string,
    sub: { endpoint: string; keys: { p256dh: string; auth: string } }
  ) {
    return this.prisma.pushSubscription.upsert({
      where: { userId_endpoint: { userId, endpoint: sub.endpoint } },
      update: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      create: {
        userId,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
    });
  }

  findSubscriptions(userId: string) {
    return this.prisma.pushSubscription.findMany({ where: { userId } });
  }
}

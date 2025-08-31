import { Injectable } from '@nestjs/common';
import webpush from 'web-push';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class WebPushService {
  constructor(private readonly repo: NotificationRepository) {
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        'mailto:example@example.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    }
  }

  async send(userId: string, payload: any) {
    const subs = await this.repo.findSubscriptions(userId);
    const message = JSON.stringify(payload);
    await Promise.all(
      subs.map((s) =>
        webpush
          .sendNotification(
            { endpoint: s.endpoint, keys: { auth: s.auth, p256dh: s.p256dh } },
            message
          )
          .catch(() => undefined)
      )
    );
  }
}

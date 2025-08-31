import { Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { WebPushService } from './web-push.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly repo: NotificationRepository,
    private readonly push: WebPushService
  ) {}

  getInbox(userId: string) {
    return this.repo.findNotifications(userId);
  }

  markRead(id: string) {
    return this.repo.markRead(id);
  }

  async create(data: {
    orgId: string;
    userId: string;
    event: string;
    message: string;
  }) {
    const notification = await this.repo.createNotification(data);
    const pref = await this.repo.findPreference(data.userId, data.event);
    if (pref?.push && !this.inQuietHours(pref)) {
      await this.push.send(data.userId, {
        title: data.event,
        body: data.message,
      });
    }
    return notification;
  }

  setPreference(
    userId: string,
    event: string,
    pref: {
      email?: boolean;
      sms?: boolean;
      whatsapp?: boolean;
      push?: boolean;
      frequency?: string;
      quietStart?: string | null;
      quietEnd?: string | null;
    }
  ) {
    return this.repo.upsertPreference({ userId, event, ...pref });
  }

  registerSubscription(userId: string, sub: any) {
    return this.repo.upsertSubscription(userId, sub);
  }

  private inQuietHours(pref: {
    quietStart?: string | null;
    quietEnd?: string | null;
  }) {
    if (!pref.quietStart || !pref.quietEnd) return false;
    const now = new Date();
    const [sH, sM] = pref.quietStart.split(':').map(Number);
    const [eH, eM] = pref.quietEnd.split(':').map(Number);
    const start = new Date();
    start.setHours(sH, sM, 0, 0);
    const end = new Date();
    end.setHours(eH, eM, 0, 0);
    if (start <= end) return now >= start && now <= end;
    return now >= start || now <= end;
  }
}

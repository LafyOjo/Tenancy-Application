import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { createEvent } from 'ics';
import { VisitRepository } from './visit.repository';

@Injectable({ scope: Scope.REQUEST })
export class VisitService {
  constructor(
    private readonly repo: VisitRepository,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  list() {
    return this.repo.findMany();
  }

  get(id: string) {
    return this.repo.findUnique(id);
  }

  async create(data: any) {
    const { attendeeEmail, attendeePhone, ...rest } = data;
    const visit = await this.repo.create(rest);
    await this.sendNotifications(visit, attendeeEmail, attendeePhone);
    return visit;
  }

  update(id: string, data: any) {
    return this.repo.update(id, data);
  }

  private async sendNotifications(
    visit: any,
    email?: string,
    phone?: string,
  ) {
    if (email) {
      await this.sendEmail(email, visit);
    }
    if (phone) {
      await this.sendSmsWhatsApp(phone, visit);
    }
  }

  private async sendEmail(email: string, visit: any) {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST) return;
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: +(SMTP_PORT || 587),
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
    const start: [number, number, number, number, number] = [
      visit.scheduledAt.getUTCFullYear(),
      visit.scheduledAt.getUTCMonth() + 1,
      visit.scheduledAt.getUTCDate(),
      visit.scheduledAt.getUTCHours(),
      visit.scheduledAt.getUTCMinutes(),
    ];
    const { value } = createEvent({
      title: `Visit (${visit.type})`,
      start,
      duration: { hours: 1 },
    });
    await transporter.sendMail({
      to: email,
      subject: 'Visit scheduled',
      text: `Visit scheduled at ${visit.scheduledAt.toISOString()}`,
      icalEvent: { filename: 'visit.ics', method: 'REQUEST', content: value },
    });
  }

  private async sendSmsWhatsApp(phone: string, visit: any) {
    const {
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_FROM_SMS,
      TWILIO_FROM_WHATSAPP,
    } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return;
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const body = `Visit (${visit.type}) scheduled at ${visit.scheduledAt.toISOString()}`;
    if (TWILIO_FROM_SMS) {
      await client.messages
        .create({ from: TWILIO_FROM_SMS, to: phone, body })
        .catch(() => null);
    }
    if (TWILIO_FROM_WHATSAPP) {
      await client.messages
        .create({
          from: `whatsapp:${TWILIO_FROM_WHATSAPP}`,
          to: `whatsapp:${phone}`,
          body,
        })
        .catch(() => null);
    }
  }
}


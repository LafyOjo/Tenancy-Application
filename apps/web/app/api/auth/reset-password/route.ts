import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = randomUUID();
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
    try {
      const url = process.env.EMAIL_WEBHOOK_URL;
      if (url) {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: 'Reset your password',
            body: `Use this token to reset your password: ${token}`,
          }),
        });
      } else {
        console.log('Password reset token for', email, token);
      }
    } catch (e) {
      console.error('Failed to send password reset email', e);
    }
  }
  return NextResponse.json({ ok: true });
}

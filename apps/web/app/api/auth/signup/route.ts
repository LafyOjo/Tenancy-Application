import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
  }
  const hashed = await hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed } });
  const token = randomUUID();
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
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
          subject: 'Verify your email',
          body: `Use this token to verify your email: ${token}`,
        }),
      });
    } else {
      console.log('Verification token for', email, token);
    }
  } catch (e) {
    console.error('Failed to send verification email', e);
  }
  return NextResponse.json({ id: user.id, email: user.email });
}

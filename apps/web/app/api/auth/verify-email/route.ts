import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { token } = await req.json();
  // Placeholder verification using VerificationToken table
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
  await prisma.user.update({ where: { email: record.identifier }, data: { emailVerified: new Date() } });
  await prisma.verificationToken.delete({ where: { token } });
  return NextResponse.json({ ok: true });
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const secret = speakeasy.generateSecret({ name: 'Tenancy App' });
  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { totpSecret: secret.base32, totpEnabled: false },
  });
  return NextResponse.json({ secret: secret.base32, otpauthUrl: secret.otpauth_url });
}

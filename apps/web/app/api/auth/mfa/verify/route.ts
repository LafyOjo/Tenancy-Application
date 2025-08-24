import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { code } = await req.json();
  const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
  if (!user?.totpSecret) {
    return NextResponse.json({ error: 'No secret' }, { status: 400 });
  }
  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: 'base32',
    token: code,
  });
  if (verified) {
    await prisma.user.update({ where: { id: user.id }, data: { totpEnabled: true } });
  }
  return NextResponse.json({ verified });
}

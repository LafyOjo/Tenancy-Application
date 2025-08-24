import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { NextResponse } from 'next/server';

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
  // TODO: send verification email
  return NextResponse.json({ id: user.id, email: user.email });
}

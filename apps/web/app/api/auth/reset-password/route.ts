import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // TODO: implement password reset email
  return NextResponse.json({ ok: true });
}

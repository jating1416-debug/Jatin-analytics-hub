import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession } from '@/lib/auth';

// POST /api/auth/login  { password: "..." }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = String(body?.password || '');

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'ADMIN_PASSWORD env var set nahi hai' }, { status: 500 });
    }

    if (password === process.env.ADMIN_PASSWORD) {
      await createAdminSession();
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Galat password' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/passwords';

// POST /api/auth/login  { password }
// Password check: (1) env ADMIN_PASSWORD  ya  (2) DB admin user ka password (reset ke baad)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = String(body?.password || '');

    // 1. env password check
    if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
      await createAdminSession();
      return NextResponse.json({ ok: true });
    }

    // 2. DB password check (forgot password se update hua hota hai)
    try {
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (admin && admin.password && admin.password.includes(':') && verifyPassword(password, admin.password)) {
        await createAdminSession();
        return NextResponse.json({ ok: true });
      }
    } catch {
      // DB unavailable - env password hi chalega
    }

    return NextResponse.json({ error: 'Galat password' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

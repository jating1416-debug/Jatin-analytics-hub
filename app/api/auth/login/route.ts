import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { createAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/passwords';

// POST /api/auth/login  { password }
// Password check: (1) env ADMIN_PASSWORD  ya  (2) DB admin user ka password (reset ke baad)
export async function POST(req: NextRequest) {
  try {
  // RATE LIMIT - 10 login attempts per 10 min per IP (brute force protection)
  const rl = rateLimit(req, { limit: 10, keyPrefix: 'login' });
  if (!rl.ok) return NextResponse.json({ error: 'Bahut zyada attempts — 10 min baad try karo' }, { status: 429 });

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

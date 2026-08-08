import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DIAGNOSTIC: /api/debug - DB connection test + exact error message
// Ye page sab kuch bata dega - Supabase paused? env missing? koi aur error?
export const dynamic = 'force-dynamic';

export async function GET() {
  const info: Record<string, any> = {
    time: new Date().toISOString(),
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseHost: (process.env.DATABASE_URL || '').match(/@([^:/]+)/)?.[1] || 'N/A',
      hasAdminPassword: !!process.env.ADMIN_PASSWORD,
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasAdminEmail: !!process.env.ADMIN_EMAIL,
    },
    dbTest: null as any,
  };

  try {
    // DB connection test with timeout
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1 as ok, now() as time`,
      new Promise((_, rej) => setTimeout(() => rej(new Error('DB connection TIMEOUT (15s) - Supabase paused ya network issue)')), 15000)),
    ]);
    info.dbTest = { ok: true, result };
  } catch (e: any) {
    info.dbTest = {
      ok: false,
      error: e.message || String(e),
      hint: e.message?.includes('Can\'t reach') || e.message?.includes('timeout') || e.message?.includes('ECONNREFUSED')
        ? '⚠️ Database reach nahi ho raha — Supabase project PAUSED ho sakta hai. Supabase dashboard kholo → Restore. Aur UptimeRobot laga do!'
        : e.message?.includes('password') || e.message?.includes('auth')
          ? '⚠️ Database password galat hai — Supabase → Settings → Database → Reset password → naya URL .env/Vercel mein'
          : '⚠️ Koi aur DB error — upar wala message copy karke batao',
    };
  }

  try {
    const count = await Promise.race([
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      new Promise((_, rej) => setTimeout(() => rej(new Error('Count query timeout')), 10000)),
    ]);
    info.articleCount = count;
  } catch (e: any) {
    info.articleCount = 'ERROR: ' + (e.message || String(e));
  }

  return NextResponse.json(info);
}

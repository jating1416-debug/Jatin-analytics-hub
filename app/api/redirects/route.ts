import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// /api/redirects
// GET  -> public redirect list (cached 60s) - middleware ke liye
// POST -> admin: pura redirect list replace karo { redirects: [{from,to,enabled}] }

export async function GET() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: 'redirects' } });
    let redirects: any[] = [];
    if (row) {
      try { redirects = JSON.parse(row.value); } catch { redirects = []; }
    }
    return NextResponse.json({ redirects }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json({ redirects: [] });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const list = Array.isArray(body?.redirects) ? body.redirects : [];
    // validate + normalize
    const clean = list
      .map((r: any) => ({
        from: String(r.from || '').trim().replace(/^https?:\/\/[^/]+/, '').replace(/\/+$/, ''),
        to: String(r.to || '').trim().slice(0, 500),
        enabled: r.enabled !== false,
      }))
      .filter((r: any) => r.from && r.from.startsWith('/') && r.to && (r.to.startsWith('/') || r.to.startsWith('http')))
      .slice(0, 200);

    await prisma.setting.upsert({
      where: { key: 'redirects' },
      update: { value: JSON.stringify(clean) },
      create: { key: 'redirects', value: JSON.stringify(clean) },
    });
    return NextResponse.json({ ok: true, count: clean.length, redirects: clean });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

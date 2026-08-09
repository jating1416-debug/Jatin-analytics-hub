import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// /api/settings
// GET  -> public settings (cached 60s) - adsense + widgets + comments moderation
// PUT  -> admin: pura settings object save (site info, adsense, widgets, robots...)

const DEFAULT_SETTINGS = {
  site: { title: 'Data Insights', description: 'Data Analytics tutorials — SQL, Python, Power BI, Excel.' },
  adsense: { enabled: false, client: '', homeSlot: '', articleSlot: '', sidebarSlot: '' },
  widgets: {
    about: true, hub: true, quote: true, readingList: true, randomSaved: true,
    toolkit: true, toolbox: true, allTools: true, categories: true, recent: true,
    popular: true, telegram: true, portfolio: true,
  },
  comments: { moderation: false },
  robotsText: '',
};

export async function GET() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: 'site' } });
    let data = DEFAULT_SETTINGS;
    if (row) {
      try { data = { ...DEFAULT_SETTINGS, ...JSON.parse(row.value) }; } catch {}
    }
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    // deep-merge with defaults (sirf jo aaya use update)
    const existing = await prisma.setting.findUnique({ where: { key: 'site' } });
    let current = DEFAULT_SETTINGS;
    if (existing) {
      try { current = { ...DEFAULT_SETTINGS, ...JSON.parse(existing.value) }; } catch {}
    }
    const merged = {
      site: { ...current.site, ...(body.site || {}) },
      adsense: { ...current.adsense, ...(body.adsense || {}) },
      widgets: { ...current.widgets, ...(body.widgets || {}) },
      comments: { ...current.comments, ...(body.comments || {}) },
      robotsText: body.robotsText !== undefined ? String(body.robotsText).slice(0, 2000) : current.robotsText,
    };
    await prisma.setting.upsert({
      where: { key: 'site' },
      update: { value: JSON.stringify(merged) },
      create: { key: 'site', value: JSON.stringify(merged) },
    });
    return NextResponse.json({ ok: true, settings: merged });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

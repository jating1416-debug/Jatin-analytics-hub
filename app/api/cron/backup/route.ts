import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ============================================================
// AUTO DB BACKUP - Vercel Cron (free: Hobby pe 1 daily cron)
// Verdict: har din subah 5:30 AM (IST) backup banta hai
// Backup JSON Supabase Storage mein save hota hai
// (bucket: images wala hi use kar rahe - file: backups/...)
// Env: SUPABASE_URL, SUPABASE_SERVICE_KEY
// ============================================================

export async function GET(req: NextRequest) {
  // Security: sirf Vercel cron call kare (CRON_SECRET env)
  const auth = req.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    const [articles, categories, tags, comments, pages, settings] = await Promise.all([
      prisma.article.findMany(),
      prisma.category.findMany(),
      prisma.tag.findMany(),
      prisma.comment.findMany(),
      prisma.page.findMany(),
      prisma.setting.findMany(),
    ]);

    const backup = {
      type: 'data-insights-backup',
      createdAt: new Date().toISOString(),
      articles: articles.length,
      categories: categories.length,
      tags: tags.length,
      comments: comments.length,
      pages: pages.length,
      data: { articles, categories, tags, comments, pages, settings },
    };

    // Supabase Storage mein save
    if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const bucket = process.env.SUPABASE_BUCKET || 'images';
      const name = `backups/backup-${new Date().toISOString().slice(0, 10)}.json`;
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${name}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'x-upsert': 'true',
        },
        body: JSON.stringify(backup),
      });
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: 'Storage save fail: ' + (await res.text()).slice(0, 120) }, { status: 500 });
      }
      return NextResponse.json({ ok: true, message: 'Backup saved to Supabase', file: name });
    }

    return NextResponse.json({ ok: true, message: 'Backup generated (Supabase env set nahi - data response mein)', size: JSON.stringify(backup).length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || 'Backup fail' }, { status: 500 });
  }
}

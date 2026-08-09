import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// GET /api/export - pura data JSON (backup) - SIRF ADMIN
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const [articles, categories, tags, comments, pages, settings] = await Promise.all([
      prisma.article.findMany(),
      prisma.category.findMany(),
      prisma.tag.findMany(),
      prisma.comment.findMany(),
      prisma.page.findMany(),
      prisma.setting.findMany(),
    ]);
    const data = {
      exportedAt: new Date().toISOString(),
      app: 'Data Insights CMS',
      articles, categories, tags, comments, pages, settings,
    };
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="data-insights-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

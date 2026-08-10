import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

// /api/series
// GET  -> saari series + unke articles (admin)
// POST -> nayi series { title, description } (admin)

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const series = await prisma.articleSeries.findMany({
      include: {
        articles: {
          where: { status: 'PUBLISHED' },
          orderBy: { seriesOrder: 'asc' },
          select: { id: true, title: true, slug: true, category: { select: { slug: true } }, seriesOrder: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(series);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const title = String(body?.title || '').trim().slice(0, 200);
    const description = String(body?.description || '').trim().slice(0, 500);
    if (!title) return NextResponse.json({ error: 'Title zaroori hai' }, { status: 400 });
    let slug = slugify(title) || 'series';
    let exists = await prisma.articleSeries.findUnique({ where: { slug } });
    let i = 1;
    while (exists) { slug = slugify(title) + '-' + i; exists = await prisma.articleSeries.findUnique({ where: { slug } }); i++; }
    const series = await prisma.articleSeries.create({ data: { title, slug, description } });
    try { revalidatePath('/', 'layout'); } catch {}
    return NextResponse.json(series, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

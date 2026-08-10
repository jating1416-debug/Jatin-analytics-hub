import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// LIGHTWEIGHT POSTS API - saari summaries EK baar (client-side filter ke liye)
// ?all=1 -> saari published posts ki summaries (content ke bina)
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel function limit - 504 kabhi nahi

// CDN cache 60s -> PostList repeat visits pe INSTANT
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' };

export async function GET(req: NextRequest) {
  // SCHEDULED POSTS - jinki time aa gayi, unhe publish karo (fire & forget)
  try {
    await prisma.article.updateMany({
      where: { status: 'SCHEDULED', scheduledAt: { lte: new Date() } },
      data: { status: 'PUBLISHED', publishedAt: new Date(), scheduledAt: null },
    });
  } catch (e) { console.error('scheduled publish error:', e); }

  const all = req.nextUrl.searchParams.get('all') === '1';
  try {
    if (all) {
      const posts = await prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true, title: true, slug: true, excerpt: true,
          publishedAt: true, createdAt: true, readingTime: true,
          category: { select: { name: true, slug: true } },
          author: { select: { name: true } },
        },
        orderBy: { publishedAt: 'desc' },
        take: 500,
      });
      return NextResponse.json({ posts }, { headers: CACHE_HEADERS });
    }

    const sp = req.nextUrl.searchParams;
    const cat = sp.get('cat') || 'all';
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);

    const where: any = { status: 'PUBLISHED' };
    if (cat === 'error') {
      where.OR = [
        { title: { contains: 'error', mode: 'insensitive' } },
        { excerpt: { contains: 'error', mode: 'insensitive' } },
      ];
    } else if (cat !== 'all') {
      where.category = { slug: cat };
    }

    const total = await prisma.article.count({ where });
    const posts = await prisma.article.findMany({
      where,
      select: {
        id: true, title: true, slug: true, excerpt: true,
        publishedAt: true, createdAt: true, readingTime: true,
        category: { select: { name: true, slug: true } },
        author: { select: { name: true } },
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * 10,
      take: 10,
    });
    return NextResponse.json({ posts, total, totalPages: Math.max(1, Math.ceil(total / 10)), page }, { headers: CACHE_HEADERS });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'DB error', posts: [] }, { status: 200 });
  }
}

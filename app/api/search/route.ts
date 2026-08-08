import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/search?q=keyword&limit=5 - live search suggestions
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const limit = Math.min(10, parseInt(req.nextUrl.searchParams.get('limit') || '5', 10) || 5);
  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { excerpt: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });

    // LOG SEARCH (admin "Top Searches" ke liye) - try/catch, kabhi fail nahi hoga
    try {
      await prisma.searchLog.create({ data: { term: q.toLowerCase().slice(0, 80) } });
    } catch (e) { console.error('searchLog error:', e); }

    const results = articles.map((a) => ({
      title: a.title,
      url: `/${a.category?.slug || 'post'}/${a.slug}`,
    }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}

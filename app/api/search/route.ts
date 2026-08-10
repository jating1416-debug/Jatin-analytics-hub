import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/search?q=keyword&limit=5 - live search suggestions
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const limit = Math.min(10, parseInt(req.nextUrl.searchParams.get('limit') || '8', 10) || 8);
  if (q.length < 2) return NextResponse.json({ results: [] });

  // ADVANCED: 3 words tak partial match - har word alag se match + content bhi
  const words = q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 3);
  const containsAny = {
    OR: words.map((w) => ({
      OR: [
        { title: { contains: w, mode: 'insensitive' } },
        { excerpt: { contains: w, mode: 'insensitive' } },
        { content: { contains: w, mode: 'insensitive' } },
      ],
    })),
  };

  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED', ...containsAny },
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

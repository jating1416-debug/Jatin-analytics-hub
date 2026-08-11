import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { buildSearchWhere, sortByRelevance } from '@/lib/search';

// GET /api/search?q=keyword&limit=5 - live search suggestions
// BLOGGER-STYLE v2:
//  - HAR word match hona chahiye (AND) - "window function" likha to
//    dono words wali posts hi aayengi (irrelevant results khatam)
//  - Relevance: title match wali posts SABSE PEHLE, phir excerpt,
//    phir content match (sirf date se sort nahi)
//  - Policy pages (about/contact/dmca/policies) + image posts
//    search mein KABHI nahi dikhte
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const limit = Math.min(10, parseInt(req.nextUrl.searchParams.get('limit') || '8', 10) || 8);

  const words = q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 3);
  if (words.length === 0) return NextResponse.json({ results: [] });

  try {
    // relevance ke liye thoda extra fetch (30), phir top limit
    const articles = await prisma.article.findMany({
      where: buildSearchWhere(words),
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 30,
    });

    // RELEVANCE SORT: title match 3, excerpt 2, content 1
    const ranked = sortByRelevance(articles, words).slice(0, limit);

    // LOG SEARCH (admin "Top Searches" ke liye) - try/catch, kabhi fail nahi hoga
    try {
      await prisma.searchLog.create({ data: { term: q.toLowerCase().slice(0, 80) } });
    } catch (e) { console.error('searchLog error:', e); }

    const results = ranked.map((a) => ({
      title: a.title,
      url: `/${a.category?.slug || 'post'}/${a.slug}`,
      categoryName: a.category?.name || 'Article',
      date: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    }));
    return NextResponse.json({ results, total: ranked.length, query: q });
  } catch {
    return NextResponse.json({ results: [] });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

// /api/sidebar - categories + recent + popular + stats
// SIRF sidebar ke liye (client-side fetch -> pages fast)
// NOTE: popular views hamesha 0 bhejte hain -> views SIRF admin ko dikhte hain
export const dynamic = 'force-dynamic';

// CDN cache 60s -> sidebar/hot-picks repeat visits pe INSTANT
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' };

export async function GET() {
  let categories: any[] = [];
  let recent: any[] = [];
  let popular: any[] = [];
  let totalPosts = 0;
  let totalCategories = 0;

  // SEQUENTIAL queries (connection_limit=1 pooler ke saath safe)
  try {
    categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { articles: true } } },
    });
    totalCategories = categories.length;
  } catch (e) { console.error('sidebar categories error:', e); }

  try {
    recent = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });
  } catch (e) { console.error('sidebar recent error:', e); }

  try {
    popular = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
    });
  } catch (e) { console.error('sidebar popular error:', e); }

  try {
    totalPosts = await prisma.article.count({ where: { status: 'PUBLISHED' } });
  } catch (e) { console.error('sidebar count error:', e); }

  // FEATURED - hot picks carousel ke liye (featured nahi to latest)
  let featured: any[] = [];
  try {
    featured = await prisma.article.findMany({
      where: { status: 'PUBLISHED', featured: true },
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
      take: 8,
    });
  } catch (e) { console.error('sidebar featured error:', e); }
  if (featured.length < 4) {
    try {
      const have = new Set(featured.map((p: any) => p.id));
      const latest = await prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        include: { category: true },
        orderBy: { publishedAt: 'desc' },
        take: 8,
      });
      latest.forEach((p: any) => { if (!have.has(p.id) && featured.length < 8) { featured.push(p); have.add(p.id); } });
    } catch (e) { console.error('sidebar featured fallback error:', e); }
  }

  return NextResponse.json({
    categories: categories.map((c) => ({ name: c.name, slug: c.slug, count: c._count.articles })),
    recent: recent.map((p) => ({
      title: p.title,
      slug: p.slug,
      categorySlug: p.category?.slug || 'uncategorized',
      date: formatDate(p.publishedAt || p.createdAt),
    })),
    popular: popular.map((p) => ({
      title: p.title,
      slug: p.slug,
      categorySlug: p.category?.slug || 'uncategorized',
      views: 0, // views SIRF admin ko - public pe kabhi nahi
    })),
    featured: featured.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      categorySlug: p.category?.slug || 'uncategorized',
      categoryName: p.category?.name || 'Article',
    })),
    totalPosts,
    totalCategories,
  }, { headers: CACHE_HEADERS });
}

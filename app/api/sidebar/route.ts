import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

// /api/sidebar - categories + recent + popular + featured + stats
// FIX (ERR_TIMED_OUT): 
//  1) IN-MEMORY CACHE (60s) - pehli request pe DB se data aata hai, uske baad
//     60 second tak HAR request memory se turant milegi (ZERO DB) - 4 components
//     (Hero, Sidebar, CategoryTiles, HotPicks) ek hi data use karte hain
//  2) TIMEOUT GUARD (4.5s) - agar DB slow/cold hai to default data turant return
//     (page kabhi hang nahi hogi, console error kabhi nahi)
// NOTE: popular views hamesha 0 bhejte hain -> views SIRF admin ko dikhte hain

const CACHE_MS = 60 * 1000; // 60s memory cache
let cache: { data: any; at: number } | null = null;

const FALLBACK = {
  categories: [],
  recent: [],
  popular: [],
  featured: [],
  totalPosts: 0,
  totalCategories: 0,
};

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    p.then((v) => { clearTimeout(t); resolve(v); })
     .catch((e) => { clearTimeout(t); reject(e); });
  });
}

export async function GET() {
  // 1) MEMORY CACHE HIT -> turant (koi DB nahi)
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return NextResponse.json(cache.data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  }

  let categories: any[] = [];
  let recent: any[] = [];
  let popular: any[] = [];
  let featured: any[] = [];
  let totalPosts = 0;
  let totalCategories = 0;

  try {
    // SIRF 60 sec mein EK BAAR DB hit (memory cache)
    await withTimeout((async () => {
      // sequential (connection_limit=1 pooler ke saath safe)
      categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { articles: true } } },
      });
      totalCategories = categories.length;

      recent = await prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        include: { category: true },
        orderBy: { publishedAt: 'desc' },
        take: 5,
      });

      popular = await prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        include: { category: true },
        orderBy: { viewCount: 'desc' },
        take: 5,
      });

      featured = await prisma.article.findMany({
        where: { status: 'PUBLISHED', featured: true },
        include: { category: true },
        orderBy: { publishedAt: 'desc' },
        take: 8,
      });
      if (featured.length < 4) {
        const have = new Set(featured.map((p: any) => p.id));
        const latest = await prisma.article.findMany({
          where: { status: 'PUBLISHED' },
          include: { category: true },
          orderBy: { publishedAt: 'desc' },
          take: 8,
        });
        latest.forEach((p: any) => { if (!have.has(p.id) && featured.length < 8) { featured.push(p); have.add(p.id); } });
      }

      totalPosts = await prisma.article.count({ where: { status: 'PUBLISHED' } });
    })(), 4500);
  } catch (e) {
    console.error('sidebar db timeout/error:', e);
    // timeout ya error -> memory mein fallback cache (15s) taaki baar-baar DB na maare
    cache = { data: FALLBACK, at: Date.now() - (CACHE_MS - 15 * 1000) };
    return NextResponse.json(FALLBACK, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  }

  const data = {
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
  };

  cache = { data, at: Date.now() };

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}

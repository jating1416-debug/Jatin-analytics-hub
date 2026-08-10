import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/utils';

// /api/sidebar - categories + recent + popular + featured + stats
// FIX (empty data bug):
//  - Supabase pooler se har query ~1.5-2s leti hai (5-6 queries = 8-10s)
//  - Pehle timeout 4.5s tha -> queries complete hone se pehle timeout -> EMPTY DATA
//  - Ab: timeout 15s (pura data aayega) + cache 300s (5 min tak koi DB hit nahi)
//  - Fallback bhi 5s ka (DB fail ho to jaldi retry)
// NOTE: popular views hamesha 0 bhejte hain -> views SIRF admin ko dikhte hain

const CACHE_MS = 5 * 60 * 1000; // 5 min memory cache
const TIMEOUT_MS = 15000;       // 15s (pooler slow hone pe bhi data aayega)
const FALLBACK_MS = 5 * 1000;   // DB fail pe 5s ke liye fallback (jaldi retry)

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
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  }

  let categories: any[] = [];
  let recent: any[] = [];
  let popular: any[] = [];
  let featured: any[] = [];
  let totalPosts = 0;
  let totalCategories = 0;

  try {
    // SIRF 5 min mein EK BAAR DB hit (memory cache)
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
    })(), TIMEOUT_MS);
  } catch (e) {
    console.error('sidebar db timeout/error:', e);
    // timeout ya error -> short fallback cache (5s) taaki jaldi retry ho
    cache = { data: FALLBACK, at: Date.now() - (CACHE_MS - FALLBACK_MS) };
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
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  });
}

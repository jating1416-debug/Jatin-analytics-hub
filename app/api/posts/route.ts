import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { POSTS_PER_PAGE } from '@/lib/utils';

// LIGHTWEIGHT POSTS API - sirf summaries (content nahi) + counts
// Isse homepage filter SMOOTH hai (client-side, bina reload)
export const dynamic = 'force-dynamic';

const COUNT_KEYS = ['sql', 'python', 'power-bi', 'excel', 'career', 'interview-questions', 'case-study', 'error'];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const cat = sp.get('cat') || 'all';
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);

  try {
    const where: any = { status: 'PUBLISHED' };
    if (cat === 'error') {
      where.content = { contains: 'error', mode: 'insensitive' };
    } else if (cat !== 'all') {
      where.category = { slug: cat };
    }

    // sequential - pool pressure kam
    const total = await prisma.article.count({ where });
    const articles = await prisma.article.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
        createdAt: true,
        readingTime: true,
        viewCount: true,
        category: { select: { name: true, slug: true } },
        author: { select: { name: true } },
      },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    });

    // counts (sirf tab jab page 1 ho - baar baar compute na ho)
    let counts: Record<string, number> = {};
    if (page === 1) {
      try {
        const allCount = await prisma.article.count({ where: { status: 'PUBLISHED' } });
        counts = { all: allCount };
        for (const k of COUNT_KEYS) {
          if (k === 'error') {
            counts[k] = await prisma.article.count({ where: { status: 'PUBLISHED', content: { contains: 'error', mode: 'insensitive' } } });
          } else {
            counts[k] = await prisma.article.count({ where: { status: 'PUBLISHED', category: { slug: k } } });
          }
        }
      } catch { /* counts optional */ }
    }

    return NextResponse.json({
      posts: articles,
      total,
      totalPages: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)),
      page,
      counts,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'DB error', posts: [], total: 0, totalPages: 1, page, counts: {} },
      { status: 200 } // 200 dete hain taaki client friendly message dikha sake
    );
  }
}

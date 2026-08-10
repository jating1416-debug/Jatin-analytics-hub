import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// GET /api/health/content - Content Health Dashboard data
// - no-excerpt, short-content, no-meta, no-cover, missing-alt counts
// - stale posts (60+ din purani)
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true, title: true, slug: true, content: true, excerpt: true,
        metaDescription: true, coverImage: true, updatedAt: true,
        category: { select: { slug: true, name: true } },
      },
      take: 300,
    });

    const noExcerpt = articles.filter((a) => !a.excerpt || a.excerpt.length < 50);
    const shortContent = articles.filter((a) => (a.content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length) < 300);
    const noMeta = articles.filter((a) => !a.metaDescription || a.metaDescription.length < 100);
    const noCover = articles.filter((a) => !a.coverImage);
    const missingAlt = articles.filter((a) => {
      const imgs = a.content.match(/<img[^>]*>/gi) || [];
      return imgs.some((img) => !/alt\s*=/i.test(img) || /alt\s*=\s*["']\s*["']/i.test(img));
    });
    const stale = articles.filter((a) => {
      const days = (Date.now() - new Date(a.updatedAt).getTime()) / 86400000;
      return days > 60;
    });

    const byCat = new Map<string, number>();
    articles.forEach((a) => byCat.set(a.category?.name || 'Other', (byCat.get(a.category?.name || 'Other') || 0) + 1));

    const issuesCount = noExcerpt.length + shortContent.length + noMeta.length + noCover.length + missingAlt.length;
    const healthScore = Math.max(0, Math.round(100 - (issuesCount / Math.max(1, articles.length)) * 15));

    return NextResponse.json({
      total: articles.length,
      noExcerpt: noExcerpt.length,
      shortContent: shortContent.length,
      noMeta: noMeta.length,
      noCover: noCover.length,
      missingAlt: missingAlt.length,
      stale: stale.length,
      healthScore,
      byCat: Array.from(byCat.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

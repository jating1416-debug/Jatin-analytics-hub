import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// GET /api/health/alt-text - articles scan karo (images bina alt text)
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, title: true, slug: true, category: { select: { slug: true } }, content: true },
      take: 200,
    });
    const issues = articles.map((a) => {
      const imgs = a.content.match(/<img[^>]*>/gi) || [];
      let missingAlt = 0;
      imgs.forEach((img) => {
        if (!/alt\s*=/i.test(img) || /alt\s*=\s*["']\s*["']/i.test(img)) missingAlt++;
      });
      return {
        articleId: a.id,
        title: a.title,
        url: `/${a.category?.slug || 'post'}/${a.slug}`,
        imgCount: imgs.length,
        missingAlt,
      };
    }).filter((a) => a.missingAlt > 0);

    return NextResponse.json({ issues });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error', issues: [] }, { status: 500 });
  }
}

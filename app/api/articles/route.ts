import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { slugify, readingTime, excerptFrom } from '@/lib/utils';

// GET /api/articles?status=PUBLISHED&category=sql&q=search  (admin list)
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const status = sp.get('status') || undefined;
  const category = sp.get('category') || undefined;
  const q = sp.get('q') || '';

  const where: any = {};
  if (status) where.status = status;
  if (category) where.category = { slug: category };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ];
  }

  const articles = await prisma.article.findMany({
    where,
    include: { category: true, tags: { include: { tag: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 200,
  });
  return NextResponse.json(articles);
}

// POST /api/articles  { title, content, categoryId, status, excerpt?, coverImage?, tags?, featured? }
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const title = String(body.title || '').trim();
    const content = String(body.content || '').trim();
    const categoryId = Number(body.categoryId);
    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: 'Title, content aur category zaroori hai' }, { status: 400 });
    }

    let slug = slugify(title);
    let exists = await prisma.article.findUnique({ where: { slug } });
    let i = 1;
    while (exists) {
      slug = slugify(title) + '-' + i;
      exists = await prisma.article.findUnique({ where: { slug } });
      i++;
    }

    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) return NextResponse.json({ error: 'Admin user nahi mila' }, { status: 500 });

    // tags: array of names -> connect/create
    const tagNames: string[] = Array.isArray(body.tags) ? body.tags.map(String).filter(Boolean).slice(0, 10) : [];
    const tagConnects = await Promise.all(
      tagNames.map(async (name) => {
        const tagSlug = slugify(name) || 'tag';
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: name.slice(0, 60), slug: tagSlug },
        });
        return { tagId: tag.id };
      })
    );

    const article = await prisma.article.create({
      data: {
        title: title.slice(0, 300),
        slug,
        excerpt: body.excerpt || excerptFrom(content, 220),
        content,
        contentType: body.contentType || 'TUTORIAL',
        difficulty: body.difficulty || 'BEGINNER',
        coverImage: body.coverImage || null,
        ogImage: body.ogImage || null,
        readingTime: readingTime(content),
        categoryId,
        authorId: admin.id,
        status: body.status === 'DRAFT' ? 'DRAFT' : body.status === 'SCHEDULED' ? 'SCHEDULED' : body.status === 'ARCHIVED' ? 'ARCHIVED' : 'PUBLISHED',
        publishedAt: body.status === 'DRAFT' || body.status === 'SCHEDULED' ? null : new Date(),
        ...(body.scheduledAt ? { scheduledAt: new Date(body.scheduledAt) } : {}),
        ...(body.noindex ? { noindex: !!body.noindex } : {}),
        ...(body.seriesId ? { seriesId: Number(body.seriesId) } : {}),
        ...(body.seriesOrder ? { seriesOrder: Number(body.seriesOrder) } : {}),
        featured: !!body.featured,
        tags: { create: tagConnects },
      },
    });
    // PURGE CACHE - naya publish TURANT home/category pe dikhe (10 min ka wait khatam)
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/archive');
      revalidatePath('/search');
    } catch (e) { console.error('revalidate POST:', e); }

    // GSC - nayi post publish pe Google/Bing sitemap ping (fire & forget)
    if (article.status === 'PUBLISHED') {
      try {
        const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.jatinanalytics.co.in';
        fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(SITE + '/sitemap.xml')}`, { method: 'GET' }).catch(() => {});
        fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(SITE + '/sitemap.xml')}`, { method: 'GET' }).catch(() => {});
      } catch {}
    }
    return NextResponse.json(article, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

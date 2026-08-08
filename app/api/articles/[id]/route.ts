import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify, readingTime, excerptFrom } from '@/lib/utils';

// GET /api/articles/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id: Number(id) },
    include: { category: true, tags: { include: { tag: true } } },
  });
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(article);
}

// PUT /api/articles/:id  { title, content, categoryId, status, tags?, featured?, ... }
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const articleId = Number(id);

    const existing = await prisma.article.findUnique({ where: { id: articleId } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const title = String(body.title ?? existing.title).trim();
    const content = String(body.content ?? existing.content).trim();
    const categoryId = body.categoryId ? Number(body.categoryId) : existing.categoryId;

    let slug = existing.slug;
    const newSlug = body.slug ? String(body.slug).trim() : slugify(title);
    if (newSlug !== slug) {
      const dup = await prisma.article.findFirst({ where: { slug: newSlug, id: { not: articleId } } });
      if (!dup) slug = newSlug;
    }

    const wasPublished = existing.status === 'PUBLISHED';
    const newStatus = body.status || existing.status;
    const publishNow = !wasPublished && newStatus === 'PUBLISHED';

    // tags update
    let tagConnects: { tagId: number }[] | undefined;
    if (Array.isArray(body.tags)) {
      const tagNames = body.tags.map(String).filter(Boolean).slice(0, 10);
      tagConnects = await Promise.all(
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
      // delete old links
      await prisma.articleTag.deleteMany({ where: { articleId } });
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        title: title.slice(0, 300),
        slug,
        excerpt: body.excerpt !== undefined ? body.excerpt : excerptFrom(content, 220),
        content,
        contentType: body.contentType || existing.contentType,
        difficulty: body.difficulty || existing.difficulty,
        coverImage: body.coverImage !== undefined ? body.coverImage : existing.coverImage,
        ogImage: body.ogImage !== undefined ? body.ogImage : existing.ogImage,
        readingTime: readingTime(content),
        categoryId,
        status: newStatus,
        featured: body.featured !== undefined ? !!body.featured : existing.featured,
        ...(tagConnects ? { tags: { create: tagConnects } } : {}),
        ...(publishNow ? { publishedAt: new Date() } : {}),
      },
    });
    return NextResponse.json(article);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

// DELETE /api/articles/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  await prisma.article.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}

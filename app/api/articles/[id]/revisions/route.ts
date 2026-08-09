import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';

// GET /api/articles/:id/revisions - pichle versions (admin)
// POST /api/articles/:id/revisions { revisionId } - purana version restore (admin)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const revisions = await prisma.articleRevision.findMany({
      where: { articleId: Number(id) },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return NextResponse.json({ revisions });
  } catch { return NextResponse.json({ revisions: [] }); }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const rev = await prisma.articleRevision.findUnique({ where: { id: Number(body?.revisionId) } });
    if (!rev || rev.articleId !== Number(id)) return NextResponse.json({ error: 'Revision nahi mili' }, { status: 404 });
    // purana version article pe restore
    const article = await prisma.article.update({
      where: { id: Number(id) },
      data: { title: rev.title, content: rev.content, ...(rev.excerpt ? { excerpt: rev.excerpt } : {}) },
    });
    // restore se pehle ab wala version bhi save karo (history mein)
    await prisma.articleRevision.create({
      data: { articleId: article.id, title: article.title, content: article.content, excerpt: article.excerpt },
    });
    return NextResponse.json({ ok: true, article });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

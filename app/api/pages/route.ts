import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// GET /api/pages - saari static pages (admin)
// POST /api/pages { slug, title, content, published } - nayi page (admin)
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const pages = await prisma.page.findMany({ orderBy: { updatedAt: 'desc' } });
    return NextResponse.json(pages);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const slug = String(body?.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').slice(0, 60);
    const title = String(body?.title || '').trim().slice(0, 200);
    const content = String(body?.content || '');
    if (!slug || !title) return NextResponse.json({ error: 'Slug + title zaroori hai' }, { status: 400 });
    const dup = await prisma.page.findUnique({ where: { slug } });
    if (dup) return NextResponse.json({ error: 'Ye slug pehle se hai' }, { status: 400 });
    const page = await prisma.page.create({
      data: { slug, title, content, published: body?.published !== false },
    });
    try { revalidatePath('/', 'layout'); } catch {}
    return NextResponse.json(page, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

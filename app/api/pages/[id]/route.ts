import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// PUT /api/pages/:id - update page (admin)
// DELETE /api/pages/:id - delete page (admin)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const page = await prisma.page.update({
      where: { id: Number(id) },
      data: {
        ...(body.title !== undefined ? { title: String(body.title).slice(0, 200) } : {}),
        ...(body.content !== undefined ? { content: String(body.content) } : {}),
        ...(body.published !== undefined ? { published: !!body.published } : {}),
        ...(body.slug !== undefined ? { slug: String(body.slug).toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60) } : {}),
      },
    });
    try { revalidatePath('/', 'layout'); } catch {}
    return NextResponse.json(page);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    await prisma.page.delete({ where: { id: Number(id) } });
    try { revalidatePath('/', 'layout'); } catch {}
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

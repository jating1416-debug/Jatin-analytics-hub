import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// PUT /api/series/:id { title?, description? } - update (admin)
// DELETE /api/series/:id - delete series (articles pe asar nahi, seriesId null)

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const series = await prisma.articleSeries.update({
      where: { id: Number(id) },
      data: {
        ...(body.title ? { title: String(body.title).slice(0, 200) } : {}),
        ...(body.description !== undefined ? { description: String(body.description).slice(0, 500) } : {}),
      },
    });
    try { revalidatePath('/', 'layout'); } catch {}
    return NextResponse.json(series);
  } catch (e: any) { return NextResponse.json({ error: e.message || 'Error' }, { status: 500 }); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    await prisma.articleSeries.delete({ where: { id: Number(id) } });
    try { revalidatePath('/', 'layout'); } catch {}
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e.message || 'Error' }, { status: 500 }); }
}

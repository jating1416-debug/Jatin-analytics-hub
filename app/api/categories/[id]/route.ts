import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/categories/:id  (rename / update) - SIRF dynamic route mein kaam karta hai!
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { id } = await params;
    const catId = Number(id);
    if (!catId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const body = await req.json();
    const cat = await prisma.category.update({
      where: { id: catId },
      data: {
        ...(body.name ? { name: String(body.name).slice(0, 80) } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.icon !== undefined ? { icon: body.icon } : {}),
        ...(body.color !== undefined ? { color: body.color } : {}),
      },
    });
    return NextResponse.json(cat);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

// DELETE /api/categories/:id
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id: Number(id) } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Pehle is category ki articles delete/change karo: ' + e.message.slice(0, 80) }, { status: 400 });
  }
}

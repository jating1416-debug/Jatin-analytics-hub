import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

// GET /api/categories
export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { articles: true } } },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(categories);
}

// POST /api/categories  { name, description?, icon?, color? }
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const name = String(body.name || '').trim();
    if (!name) return NextResponse.json({ error: 'Name zaroori hai' }, { status: 400 });
    const slug = slugify(name) || 'category';
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: name.slice(0, 80), slug, description: body.description || null, icon: body.icon || null, color: body.color || null },
    });
    return NextResponse.json(cat, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

// NOTE: PUT/DELETE dynamic route mein hain -> app/api/categories/[id]/route.ts

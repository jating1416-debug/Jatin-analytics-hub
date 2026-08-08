import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/random-article -> random published post URL
export async function GET() {
  try {
    const count = await prisma.article.count({ where: { status: 'PUBLISHED' } });
    if (count === 0) return NextResponse.json({ url: '/' });
    const skip = Math.floor(Math.random() * count);
    const post = await prisma.article.findFirst({
      where: { status: 'PUBLISHED' },
      include: { category: true },
      skip,
    });
    return NextResponse.json({ url: post ? `/${post.category?.slug || 'post'}/${post.slug}` : '/' });
  } catch {
    return NextResponse.json({ url: '/' });
  }
}

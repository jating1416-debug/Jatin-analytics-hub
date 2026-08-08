import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/pageview  { articleId: number }
// Same browser se ek baar hi count hota hai (client localStorage check karta hai)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const articleId = Number(body?.articleId);
    if (!articleId) return NextResponse.json({ ok: false }, { status: 400 });

    await prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

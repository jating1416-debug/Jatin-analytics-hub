import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/pageview  { articleId: number, sessionId?, path? }
// - viewCount increment (admin analytics ke liye)
// - PageView row bhi save (30-din trend chart ke liye)
// Same browser se ek baar hi count hota hai (client localStorage check karta hai)
export const maxDuration = 60; // Vercel function limit
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const articleId = Number(body?.articleId);
    if (!articleId) return NextResponse.json({ ok: false }, { status: 400 });

    // 1. viewCount increment
    await prisma.article.update({
      where: { id: articleId },
      data: { viewCount: { increment: 1 } },
    });

    // 2. PageView row (trend chart) - try/catch taaki fail hone pe bhi count miss na ho
    try {
      await prisma.pageView.create({
        data: {
          articleId,
          path: String(body?.path || '/').slice(0, 300),
          sessionId: String(body?.sessionId || 'anon').slice(0, 60),
        },
      });
    } catch (e) { console.error('pageView create error:', e); }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/comments?articleId=5  -> comments list
// POST /api/comments { articleId, name, content } -> naya comment
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const articleId = Number(req.nextUrl.searchParams.get('articleId'));
  if (!articleId) return NextResponse.json({ comments: [] });
  try {
    const comments = await prisma.comment.findMany({
      where: { articleId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const articleId = Number(body?.articleId);
    const name = String(body?.name || '').trim().slice(0, 60);
    const content = String(body?.content || '').trim().slice(0, 1000);
    if (!articleId || !name || !content) {
      return NextResponse.json({ error: 'Name + comment zaroori hai' }, { status: 400 });
    }
    // basic spam filter
    const bad = ['http://', 'https://', 'www.', 'buy now', 'free money', 'casino', 'viagra'];
    if (bad.some((b) => content.toLowerCase().includes(b))) {
      return NextResponse.json({ error: 'Spam jaisa content — link nahi daal sakte' }, { status: 400 });
    }
    const comment = await prisma.comment.create({
      data: { articleId, name, content },
    });
    return NextResponse.json({ comment }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

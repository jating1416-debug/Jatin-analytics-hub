import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

// GET /api/comments?articleId=5  -> approved comments list (public)
// GET /api/comments?all=1        -> saare comments (admin - moderation queue)
// POST /api/comments { articleId, name, content } -> naya comment (moderation ON ho to pending)
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get('all') === '1';
  if (all) {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
      const comments = await prisma.comment.findMany({
        include: { article: { select: { title: true, slug: true, category: { select: { slug: true } } } } },
        orderBy: { createdAt: 'desc' },
        take: 200,
      });
      return NextResponse.json(comments);
    } catch { return NextResponse.json([]); }
  }

  const articleId = Number(req.nextUrl.searchParams.get('articleId'));
  if (!articleId) return NextResponse.json({ comments: [] });
  try {
    const comments = await prisma.comment.findMany({
      where: { articleId, status: 'approved' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ comments: [] });
  }
}

export async function POST(req: NextRequest) {
  // RATE LIMIT - 10 comments per 10 min per IP
  const rl = rateLimit(req, { limit: 10, keyPrefix: 'comments' });
  if (!rl.ok) return NextResponse.json({ error: 'Bahut zyada comments — thodi der baad try karo' }, { status: 429 });
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

    // moderation setting check (admin pehle approve kare?)
    let status = 'approved';
    try {
      const row = await prisma.setting.findUnique({ where: { key: 'site' } });
      if (row) {
        const s = JSON.parse(row.value);
        if (s?.comments?.moderation) status = 'pending';
      }
    } catch {}

    const comment = await prisma.comment.create({
      data: { articleId, name, content, status },
    });
    return NextResponse.json({ comment, moderation: status === 'pending' }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

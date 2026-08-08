import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory subscriber list (Vercel serverless ke liye)
// NOTE: Ye production mein DB mein store karna better hai - next upgrade mein.
const subscribers = new Set<string>();

// POST /api/newsletter  { email }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email || '').trim().toLowerCase();
    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Sahi email daalo' }, { status: 400 });
    }
    if (subscribers.has(email)) {
      return NextResponse.json({ ok: true, message: 'Pehle se subscribed hain! ✅' });
    }
    subscribers.add(email);
    return NextResponse.json({ ok: true, message: '🎉 Subscribe ho gaye! Naye posts ka update aayega.' });
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 400 });
  }
}

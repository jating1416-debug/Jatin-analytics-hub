import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';

// POST /api/contact { name, email, message } -> Resend se admin ke email pe
export async function POST(req: NextRequest) {
  // RATE LIMIT - 5 per 10 min per IP (spam protection)
  const rl = rateLimit(req, { limit: 5, keyPrefix: 'contact' });
  if (!rl.ok) return NextResponse.json({ error: 'Bahut zyada requests — 10 min baad try karo' }, { status: 429 });
  try {
    const body = await req.json();
    const name = String(body?.name || '').trim().slice(0, 80);
    const email = String(body?.email || '').trim().slice(0, 120);
    const message = String(body?.message || '').trim().slice(0, 2000);
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email aur message zaroori hai' }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const resendKey = process.env.RESEND_API_KEY;

    if (!adminEmail || !resendKey) {
      // fallback: mailto link generate karo
      return NextResponse.json({
        error: 'Contact form configured nahi hai abhi — email bhejo: jating1416@gmail.com',
      }, { status: 500 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'Data Insights <onboarding@resend.dev>',
        to: [adminEmail],
        replyTo: email,
        subject: `📬 Contact: ${name} - Data Insights`,
        html: `<div style="font-family:Arial;padding:20px;max-width:500px;margin:auto;border:1px solid #e2e8f0;border-radius:12px">
          <h2 style="color:#667eea">Naya Contact Message</h2>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <div style="background:#f5f7fa;padding:14px;border-radius:8px;margin-top:10px;white-space:pre-wrap">${message}</div>
        </div>`,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Email send fail' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, message: '✅ Message bhej diya! Jald reply karenge.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

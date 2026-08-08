import { NextRequest, NextResponse } from 'next/server';

// In-memory OTP store (Vercel pe single instance ke liye kaafi - short expiry)
// Format: { otp: string, expiresAt: number }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();
const OTP_TTL = 10 * 60 * 1000; // 10 minutes

// POST /api/auth/forgot  -> OTP generate + email bhejo (Resend)
export async function POST(_req: NextRequest) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const resendKey = process.env.RESEND_API_KEY;

  if (!adminEmail || !resendKey) {
    return NextResponse.json({
      error: 'ADMIN_EMAIL / RESEND_API_KEY set nahi hain. (Resend.com se free key lo, Vercel env mein daalo)',
      devOtp: process.env.NODE_ENV !== 'production' ? '123456' : undefined,
    }, { status: 500 });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(otp, { otp, expiresAt: Date.now() + OTP_TTL });

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'Data Insights <onboarding@resend.dev>',
        to: [adminEmail],
        subject: '🔐 Admin OTP - Data Insights',
        html: `<div style="font-family:Arial;padding:20px;max-width:400px;margin:auto;border:1px solid #e2e8f0;border-radius:12px">
          <h2 style="color:#667eea">Data Insights Admin</h2>
          <p>Aapka OTP:</p>
          <div style="font-size:28px;font-weight:800;letter-spacing:6px;color:#2d3748;background:#f5f7fa;padding:12px;border-radius:8px;text-align:center">${otp}</div>
          <p style="color:#718096;font-size:13px">Ye OTP 10 minute ke liye valid hai. Agar aapne request nahi ki to is email ko ignore karo.</p>
        </div>`,
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Email send fail: ' + (await res.text()).slice(0, 120) }, { status: 500 });
    }
    return NextResponse.json({ ok: true, message: 'OTP aapki email pe bhej diya hai' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Email fail' }, { status: 500 });
  }
}

// POST /api/auth/forgot/verify  { otp } -> verify
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const otp = String(body?.otp || '').trim();
  const record = otpStore.get(otp);
  if (!record || Date.now() > record.expiresAt) {
    return NextResponse.json({ error: 'OTP galat ya expire ho gaya' }, { status: 401 });
  }
  otpStore.delete(otp); // ek baar use
  return NextResponse.json({ ok: true, token: otp }); // token = verified OTP (reset mein use hoga)
}

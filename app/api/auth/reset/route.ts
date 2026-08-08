import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/passwords';

// POST /api/auth/reset  { otp, newPassword }
// OTP verify hone ke baad admin password change hota hai (DB mein store)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const otp = String(body?.otp || '').trim();
    const newPassword = String(body?.newPassword || '');

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Naya password kam se kam 8 characters ka rakho' }, { status: 400 });
    }

    // OTP verify - forgot API se
    const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/forgot/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    });
    if (!verifyRes.ok) {
      const data = await verifyRes.json().catch(() => ({}));
      return NextResponse.json({ error: data.error || 'OTP galat' }, { status: 401 });
    }

    // admin user ke password ko DB mein update karo
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) return NextResponse.json({ error: 'Admin user nahi mila' }, { status: 500 });

    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashPassword(newPassword) },
    });

    return NextResponse.json({ ok: true, message: '✅ Password update ho gaya. Naye password se login karo.' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error' }, { status: 500 });
  }
}

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Health check - UptimeRobot ke liye + DB connection test
// /api/health -> 200 agar DB connected, 503 agar nahi
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', db: 'connected' });
  } catch (e) {
    console.error('Health check DB error:', e);
    return NextResponse.json({ status: 'error', db: 'disconnected' }, { status: 503 });
  }
}

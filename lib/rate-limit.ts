import { NextRequest } from 'next/server';

// ============================================================
// RATE LIMITING - simple in-memory (per serverless instance)
// Spam/abuse protection for public APIs (contact, comments,
// newsletter, auth). Per-IP + per-route tracking.
// NOTE: in-memory = per-instance; Vercel serverless ke liye
// sufficient (abuse mostly same instance pe hota hai).
// ============================================================

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

const WINDOW_MS = 10 * 60 * 1000; // 10 min

export function rateLimit(req: NextRequest, opts: { limit: number; windowMs?: number; keyPrefix: string }): { ok: boolean; remaining: number } {
  const { limit, keyPrefix, windowMs = WINDOW_MS } = opts;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, remaining: 0 };
  }
  return { ok: true, remaining: limit - entry.count };
}

import { PrismaClient } from '@prisma/client';

// ROBUST PRISMA CLIENT v2
// - connection_limit=1 (pooler) = HAR query queue hoti thi -> blog "loading pe atakta tha"
// - Ab code hi connection_limit ko 5 kar deta hai -> queries parallel chalti hain, koi queue nahi
// - Vercel serverless ke liye connection reuse
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function fixConnectionLimit(url: string): string {
  // pooler URL mein connection_limit=1 ho to 5 kar do (min 3) - contention khatam
  const m = url.match(/connection_limit=(\d+)/);
  if (m) {
    const v = parseInt(m[1], 10);
    if (v < 5) return url.replace(/connection_limit=\d+/, 'connection_limit=5');
  } else if (!/connection_limit=/.test(url)) {
    return url + (url.includes('?') ? '&' : '?') + 'connection_limit=5';
  }
  return url;
}

function createClient() {
  const rawUrl = process.env.DATABASE_URL || '';
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: rawUrl.includes('supabase') && rawUrl.includes('pooler')
      ? { db: { url: fixConnectionLimit(rawUrl) } }
      : undefined,
  });
  return client;
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

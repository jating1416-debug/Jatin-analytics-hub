import { PrismaClient } from '@prisma/client';

// ROBUST PRISMA CLIENT
// - Connection pool timeout badhaya (20s)
// - Vercel serverless ke liye connection reuse
// - URL mein connection_limit na ho to default 10
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getConnectionLimit(): number {
  // .env / env mein connection_limit parso (default 10 - homepage pe 5-6 concurrent queries hain)
  const url = process.env.DATABASE_URL || '';
  const m = url.match(/connection_limit=(\d+)/);
  if (m) return Math.max(2, parseInt(m[1], 10));
  return 10;
}

function createClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // pool timeout badhao - busy hone pe 20s wait
  });
  return client;
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

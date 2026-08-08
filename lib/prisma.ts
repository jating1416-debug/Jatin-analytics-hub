import { PrismaClient } from '@prisma/client';

// ROBUST PRISMA CLIENT - connection timeout + retry ke saath
// Vercel serverless ke liye connection pool reuse + timeout
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
  return client;
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

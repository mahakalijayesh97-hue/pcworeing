import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Safety check for build time
if (process.env.NEXT_PHASE === 'phase-production-build') {
  console.log('Build phase detected - skipping real database connection');
}

import { PrismaClient } from "@prisma/client";

// Emergency fallback for Vercel environment variable issues
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "mongodb+srv://jayesh:jayesh%40123@cluster0.9usafbn.mongodb.net/pc_db?retryWrites=true&w=majority&appName=Cluster0";
}

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma;
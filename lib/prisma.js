import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global;

// Check if PrismaClient is already attached to the global object
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });
}

// Use the Prisma client from the global object
const prisma = globalForPrisma.prisma;

// Export the Prisma client
export default prisma;
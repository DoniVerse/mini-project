export default async function handler(req, res) {
  try {
    // Check if DATABASE_URL is set
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const databaseUrlPreview = process.env.DATABASE_URL 
      ? `${process.env.DATABASE_URL.substring(0, 20)}...` 
      : 'NOT SET';

    // Test Prisma connection
    let prismaStatus = 'NOT TESTED';
    let prismaError = null;
    
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$connect();
      await prisma.$disconnect();
      prismaStatus = 'CONNECTED';
    } catch (error) {
      prismaStatus = 'FAILED';
      prismaError = error.message;
    }

    return res.status(200).json({
      message: 'Debug information',
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: hasDatabaseUrl,
        databaseUrlPreview: databaseUrlPreview
      },
      prisma: {
        status: prismaStatus,
        error: prismaError
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Debug endpoint failed',
      message: error.message,
      stack: error.stack
    });
  }
} 
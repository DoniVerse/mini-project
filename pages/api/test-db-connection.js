import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  try {
    // Test database connection with detailed error info
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    console.log('Attempting to connect to database...');
    console.log('Database URL preview:', process.env.DATABASE_URL?.substring(0, 30) + '...');
    
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Query test successful:', result);
    
    await prisma.$disconnect();
    
    return res.status(200).json({
      message: 'Database connection successful',
      test: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database connection failed:', error);
    
    return res.status(500).json({
      error: 'Database connection failed',
      details: error.message,
      type: error.constructor.name,
      code: error.code,
      meta: error.meta
    });
  }
} 
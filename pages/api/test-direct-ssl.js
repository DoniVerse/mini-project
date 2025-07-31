import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  try {
    // Use direct connection with proper SSL configuration
    const directUrl = process.env.DATABASE_URL + '?sslmode=require&connect_timeout=10';
    
    console.log('Testing direct connection with SSL...');
    console.log('URL:', directUrl.substring(0, 30) + '...');
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: directUrl
        }
      },
      log: ['query', 'info', 'warn', 'error']
    });

    await prisma.$connect();
    console.log('Direct SSL connection successful');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Query test successful:', result);
    
    await prisma.$disconnect();
    
    return res.status(200).json({
      message: 'Direct SSL connection test successful',
      test: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Direct SSL connection test failed:', error);
    
    return res.status(500).json({
      error: 'Direct SSL connection test failed',
      details: error.message,
      type: error.constructor.name,
      code: error.code
    });
  }
} 
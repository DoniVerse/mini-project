import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  try {
    // Add SSL parameters to connection string
    const sslUrl = process.env.DATABASE_URL + '?sslmode=require';
    
    console.log('Testing with SSL parameters...');
    console.log('URL with SSL:', sslUrl.substring(0, 30) + '...');
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: sslUrl
        }
      }
    });

    await prisma.$connect();
    console.log('SSL connection test successful');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Query test successful:', result);
    
    await prisma.$disconnect();
    
    return res.status(200).json({
      message: 'SSL connection test successful',
      test: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('SSL connection test failed:', error);
    
    return res.status(500).json({
      error: 'SSL connection test failed',
      details: error.message,
      type: error.constructor.name
    });
  }
} 
import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  try {
    // Use connection pooler URL format
    const poolerUrl = process.env.DATABASE_URL.replace(':5432', ':6543');
    
    console.log('Testing with connection pooler...');
    console.log('Original URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');
    console.log('Pooler URL:', poolerUrl.substring(0, 30) + '...');
    
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: poolerUrl
        }
      }
    });

    await prisma.$connect();
    console.log('Connection pooler test successful');
    
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Query test successful:', result);
    
    await prisma.$disconnect();
    
    return res.status(200).json({
      message: 'Connection pooler test successful',
      test: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Connection pooler test failed:', error);
    
    return res.status(500).json({
      error: 'Connection pooler test failed',
      details: error.message,
      type: error.constructor.name
    });
  }
} 
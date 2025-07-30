import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test database connection
    await prisma.$connect();
    
    // Try to query the users table
    const userCount = await prisma.users.count();
    
    return res.status(200).json({ 
      message: 'Database connection successful',
      userCount: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
} 
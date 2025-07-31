import { getSessionUser } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return res.status(500).json({ 
        error: 'Server configuration missing',
        details: 'JWT_SECRET environment variable is not set'
      });
    }

    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - No valid token provided' });
    }
    
    const dbUser = await prisma.users.findUnique({
      where: { id: user.id },
      select: { id: true, username: true, email: true }
    });
    
    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(dbUser);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
} 
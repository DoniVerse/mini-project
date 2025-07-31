import { getSessionUser } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
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
    
    const { username, email } = req.body;
    if (!username && !email) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
    
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    
    const updated = await prisma.users.update({
      where: { id: user.id },
      data: updateData,
      select: { id: true, username: true, email: true }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
} 
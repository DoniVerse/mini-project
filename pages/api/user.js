import prisma from '../../lib/prisma';
import { verifyAuth } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    let userId;
    try {
      userId = verifyAuth(req);
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
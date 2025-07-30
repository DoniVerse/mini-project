import { getSessionUser } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { username, email } = req.body;
    if (!username && !email) {
      return res.status(400).json({ error: 'Nothing to update' });
    }
    const updated = await prisma.users.update({
      where: { id: user.id },
      data: { username, email },
      select: { id: true, username: true, email: true }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
} 
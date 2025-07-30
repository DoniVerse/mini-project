import prisma from '../../lib/prisma';
import { verifyAuth } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      let userId;
      try {
        userId = verifyAuth(req);
      } catch (err) {
        return res.status(401).json({ error: err.message });
      }
      const { user, search, skip = 0, take = 10, sort = 'desc' } = req.query;
      const where = {};
      if (user) where.user_id = parseInt(user);
      if (search) where.content = { contains: search, mode: 'insensitive' };
      const posts = await prisma.posts.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(take),
        orderBy: { created_at: sort === 'asc' ? 'asc' : 'desc' },
        include: {
          users: { select: { id: true, username: true, email: true } },
          comments: {
            include: {
              users: { select: { id: true, username: true } },
            },
          },
        },
      });
      return res.status(200).json(posts);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      let userId;
      try {
        userId = verifyAuth(req);
      } catch (err) {
        return res.status(401).json({ error: err.message });
      }
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: 'Content is required' });
      const post = await prisma.posts.create({
        data: {
          content,
          user_id: userId,
        },
        include: {
          users: { select: { id: true, username: true, email: true } },
          comments: true,
        },
      });
      return res.status(201).json(post);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 
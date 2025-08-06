import prisma from '../../../lib/prisma';
import { verifyAuth } from '../../../lib/auth';

export default async function handler(req, res) {
  // Verify JWT token for all methods except GET and OPTIONS
  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
    try {
      const userId = verifyAuth(req);
      req.userId = userId; // Attach userId to the request object
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  }

  switch (req.method) {
    case 'GET':
      return getCategories(req, res);
    case 'POST':
      return createCategory(req, res);
    case 'OPTIONS':
      // Handle CORS preflight
      return res.status(200).end();
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get all categories
async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
    });
  }
}

// Create a new category (admin only)
async function createCategory(req, res) {
  try {
    const { name, description, color } = req.body;

    // Basic validation
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // TODO: Add admin check here if needed
    // if (!isAdmin(req.userId)) {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        color: color || '#808080',
      },
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'Category with this name already exists',
      });
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
    });
  }
}

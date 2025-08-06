import prisma from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';

export default async function handler(req, res) {
  // Verify JWT token for all methods except OPTIONS (for CORS preflight)
  if (req.method !== 'OPTIONS') {
    try {
      const userId = verifyAuth(req);
      req.userId = userId; // Attach userId to the request object
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  }

  switch (req.method) {
    case 'GET':
      return getTasks(req, res);
    case 'POST':
      return createTask(req, res);
    case 'OPTIONS':
      // Handle CORS preflight
      return res.status(200).end();
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get all tasks for the authenticated user
async function getTasks(req, res) {
  try {
    const { category, status, search } = req.query;
    
    const where = {
      userId: req.userId,
    };

    // Add filters if provided
    if (category) where.categoryId = parseInt(category);
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc', // Sort by due date by default
      },
    });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
    });
  }
}

// Create a new task
async function createTask(req, res) {
  try {
    const { title, description, dueDate, priority, categoryId } = req.body;

    // Basic validation
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const taskData = {
      title,
      description,
      userId: req.userId,
      status: 'PENDING', // Default status
      priority: priority || 'MEDIUM',
    };

    // Add optional fields if provided
    if (dueDate) taskData.dueDate = new Date(dueDate);
    if (categoryId) taskData.categoryId = parseInt(categoryId);

    const task = await prisma.task.create({
      data: taskData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
    });
  }
}

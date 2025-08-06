import prisma from '../../../lib/prisma';
import { verifyAuth } from '../../../lib/auth';

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

  const taskId = parseInt(req.query.id);
  
  if (isNaN(taskId)) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }

  switch (req.method) {
    case 'GET':
      return getTask(req, res, taskId);
    case 'PUT':
      return updateTask(req, res, taskId);
    case 'DELETE':
      return deleteTask(req, res, taskId);
    case 'OPTIONS':
      // Handle CORS preflight
      return res.status(200).end();
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get a single task by ID
async function getTask(req, res, taskId) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
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

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Ensure the task belongs to the authenticated user
    if (task.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
    });
  }
}

// Update a task
async function updateTask(req, res, taskId) {
  try {
    const { title, description, status, dueDate, priority, categoryId } = req.body;

    // Verify the task exists and belongs to the user
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existingTask.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updateData = {};
    
    // Only update fields that are provided in the request
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) updateData.priority = priority;
    if (categoryId !== undefined) {
      updateData.categoryId = categoryId ? parseInt(categoryId) : null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
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

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
    });
  }
}

// Delete a task
async function deleteTask(req, res, taskId) {
  try {
    // Verify the task exists and belongs to the user
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (existingTask.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
    });
  }
}

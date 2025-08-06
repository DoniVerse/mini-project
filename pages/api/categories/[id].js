import prisma from '../../../../lib/prisma';
import { verifyAuth } from '../../../../lib/auth';

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

  const categoryId = parseInt(req.query.id);
  
  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  switch (req.method) {
    case 'GET':
      return getCategory(req, res, categoryId);
    case 'PUT':
      return updateCategory(req, res, categoryId);
    case 'DELETE':
      return deleteCategory(req, res, categoryId);
    case 'OPTIONS':
      // Handle CORS preflight
      return res.status(200).end();
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get a single category by ID
async function getCategory(req, res, categoryId) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
    });
  }
}

// Update a category (admin only)
async function updateCategory(req, res, categoryId) {
  try {
    const { name, description, color } = req.body;

    // Verify the category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // TODO: Add admin check here if needed
    // if (!isAdmin(req.userId)) {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }

    const updateData = {};
    
    // Only update fields that are provided in the request
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });

    return res.status(200).json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    
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

// Delete a category (admin only)
async function deleteCategory(req, res, categoryId) {
  try {
    // First, check if there are any tasks using this category
    const tasksWithCategory = await prisma.task.findMany({
      where: { categoryId },
      take: 1, // We only need to know if there's at least one task
    });

    if (tasksWithCategory.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that is in use by tasks',
      });
    }

    // Verify the category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // TODO: Add admin check here if needed
    // if (!isAdmin(req.userId)) {
    //   return res.status(403).json({ error: 'Unauthorized' });
    // }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
    });
  }
}

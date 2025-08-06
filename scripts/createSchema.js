const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSchema() {
  try {
    await prisma.$executeRaw`CREATE SCHEMA IF NOT EXISTS task_management`;
    console.log('Schema created successfully');
  } catch (error) {
    console.error('Error creating schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSchema();

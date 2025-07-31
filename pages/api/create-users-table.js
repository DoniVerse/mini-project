import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  try {
    const prisma = new PrismaClient();
    
    console.log('Testing simple table creation...');
    
    await prisma.$connect();
    console.log('Database connected');
    
    // Just create the users table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR(50) UNIQUE NOT NULL,
        "email" VARCHAR(100) UNIQUE NOT NULL,
        "password" TEXT NOT NULL
      )
    `);
    
    console.log('Users table created successfully');
    await prisma.$disconnect();
    
    return res.status(200).json({
      message: 'Users table created successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Table creation failed:', error);
    
    return res.status(500).json({
      error: 'Table creation failed',
      details: error.message,
      type: error.constructor.name
    });
  }
} 
import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  try {
    const prisma = new PrismaClient();
    
    console.log('Starting database migration...');
    
    // Test connection first
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Run migrations one by one
    const migrations = [
      `CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR(50) UNIQUE NOT NULL,
        "email" VARCHAR(100) UNIQUE NOT NULL,
        "password" TEXT NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS "Category" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) UNIQUE NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS "Tag" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) UNIQUE NOT NULL
      )`,
      
      `CREATE TABLE IF NOT EXISTS "posts" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "content" TEXT NOT NULL,
        "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
        "categoryId" INTEGER
      )`,
      
      `CREATE TABLE IF NOT EXISTS "comments" (
        "id" SERIAL PRIMARY KEY,
        "post_id" INTEGER NOT NULL,
        "user_id" INTEGER NOT NULL,
        "content" TEXT NOT NULL,
        "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP
      )`,
      
      `CREATE TABLE IF NOT EXISTS "_PostTags" (
        "A" INTEGER NOT NULL,
        "B" INTEGER NOT NULL,
        UNIQUE("A", "B")
      )`
    ];
    
    console.log('Running migrations...');
    for (let i = 0; i < migrations.length; i++) {
      console.log(`Running migration ${i + 1}/${migrations.length}`);
      await prisma.$executeRawUnsafe(migrations[i]);
    }
    
    console.log('Migration completed successfully');
    await prisma.$disconnect();
    
    return res.status(200).json({
      message: 'Database migration completed successfully',
      tablesCreated: migrations.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    
    return res.status(500).json({
      error: 'Migration failed',
      details: error.message,
      type: error.constructor.name
    });
  }
} 
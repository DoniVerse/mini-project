import { PrismaClient } from '@prisma/client';

export default async function handler(req, res) {
  try {
    const prisma = new PrismaClient();
    
    console.log('Starting database migration...');
    
    // Test connection first
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Run the migration SQL
    const migrationSQL = `
      -- Create users table
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" VARCHAR(50) UNIQUE NOT NULL,
        "email" VARCHAR(100) UNIQUE NOT NULL,
        "password" TEXT NOT NULL
      );
      
      -- Create categories table
      CREATE TABLE IF NOT EXISTS "Category" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) UNIQUE NOT NULL
      );
      
      -- Create tags table
      CREATE TABLE IF NOT EXISTS "Tag" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(50) UNIQUE NOT NULL
      );
      
      -- Create posts table
      CREATE TABLE IF NOT EXISTS "posts" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER NOT NULL,
        "content" TEXT NOT NULL,
        "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
        "categoryId" INTEGER,
        FOREIGN KEY ("user_id") REFERENCES "users"("id"),
        FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
      );
      
      -- Create comments table
      CREATE TABLE IF NOT EXISTS "comments" (
        "id" SERIAL PRIMARY KEY,
        "post_id" INTEGER NOT NULL,
        "user_id" INTEGER NOT NULL,
        "content" TEXT NOT NULL,
        "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("post_id") REFERENCES "posts"("id"),
        FOREIGN KEY ("user_id") REFERENCES "users"("id")
      );
      
      -- Create post-tags relationship table
      CREATE TABLE IF NOT EXISTS "_PostTags" (
        "A" INTEGER NOT NULL,
        "B" INTEGER NOT NULL,
        FOREIGN KEY ("A") REFERENCES "posts"("id"),
        FOREIGN KEY ("B") REFERENCES "Tag"("id"),
        UNIQUE("A", "B")
      );
    `;
    
    await prisma.$executeRawUnsafe(migrationSQL);
    console.log('Migration completed successfully');
    
    await prisma.$disconnect();
    
    return res.status(200).json({
      message: 'Database migration completed successfully',
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
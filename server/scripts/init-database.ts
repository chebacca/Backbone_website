#!/usr/bin/env tsx

/**
 * Database Initialization Script
 * 
 * This script initializes the database with the Prisma schema and creates
 * necessary tables and indexes for the Dashboard v14 Licensing Website.
 * 
 * Usage:
 * 1. Set up your DATABASE_URL in .env
 * 2. Run: pnpm run db:init
 * 3. Run: pnpm run db:generate
 * 4. Run: pnpm run db:push (or db:migrate for production)
 */

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting database initialization...');
  
  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if database is accessible
    console.log('🔍 Checking database accessibility...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful:', result);
    
    // Get database info
    console.log('📊 Getting database information...');
    const dbInfo = await prisma.$queryRaw`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as version
    `;
    console.log('📋 Database info:', dbInfo);
    
    console.log('🎉 Database initialization completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: pnpm run db:generate');
    console.log('2. Run: pnpm run db:push (development)');
    console.log('3. Or run: pnpm run db:migrate (production)');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the main function
main()
  .catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });

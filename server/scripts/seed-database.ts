#!/usr/bin/env tsx

// Set up environment for Cloud Functions when running locally
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
// Prefer an explicit FIREBASE_PROJECT_ID if provided; otherwise keep existing GCLOUD_PROJECT; fallback to a default
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { logger } from '../src/utils/logger.js';

/**
 * Database seeding script
 * 
 * Usage:
 *   npm run seed
 *   npm run seed:clear
 *   npm run seed:reset
 */

async function main() {
  // Dynamically import after env is set so Firestore Admin sees ADC/GCLOUD env
  const { default: DatabaseSeeder } = await import('../src/seeds/index.js');
  const command = process.argv[2] || 'seed';

  try {
    switch (command) {
      case 'seed':
        logger.info('🌱 Starting database seeding...');
        await DatabaseSeeder.seedDatabase();
        break;

      case 'clear':
        logger.info('🧹 Clearing database...');
        await DatabaseSeeder.clearDatabase();
        break;

      case 'reset':
        logger.info('🔄 Resetting database (clear + seed)...');
        await DatabaseSeeder.clearDatabase();
        await DatabaseSeeder.seedDatabase();
        break;

      default:
        logger.error('Invalid command. Use: seed, clear, or reset');
        process.exit(1);
    }

    logger.info('✅ Operation completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Operation failed:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run the script
main();

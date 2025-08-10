#!/usr/bin/env tsx

// Ensure Functions-like env for Firestore Admin when running locally
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { logger } from '../src/utils/logger.js';

async function main() {
  // Import seeder after env is set up
  const { default: DatabaseSeeder } = await import('../src/seeds/index.js');

  try {
    logger.info('🧹 Clearing Firestore collections (users, subscriptions, payments, licenses, audit_logs)...');
    await DatabaseSeeder.clearDatabase();

    logger.info('🌱 Seeding users, subscriptions, payments (invoices), and licenses...');
    await DatabaseSeeder.seedDatabase();

    logger.info('✅ Full reseed complete.');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Reseed failed:', error);
    process.exit(1);
  }
}

main();



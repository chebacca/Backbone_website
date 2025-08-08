#!/usr/bin/env node

/**
 * Invoice Seeding Script
 * 
 * This script seeds invoices for existing license purchases in the database.
 * It creates comprehensive invoice data including billing details, tax calculations,
 * and compliance information for all existing subscriptions.
 */

import { InvoiceSeeder } from '../src/seeds/invoiceSeeder.ts';
import { logger } from '../src/utils/logger.ts';

async function main() {
  try {
    logger.info('Starting invoice seeding process...');
    
    await InvoiceSeeder.run();
    
    logger.info('Invoice seeding completed successfully!');
  } catch (error) {
    logger.error('Invoice seeding failed:', error);
    process.exit(1);
  }
}

main();

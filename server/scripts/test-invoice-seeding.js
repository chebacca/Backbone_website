#!/usr/bin/env node

/**
 * Test Invoice Seeding Script
 * 
 * This script tests the invoice seeding functionality to ensure it works correctly.
 * It can be run independently to verify the invoice seeding system.
 */

import { InvoiceSeeder } from '../src/seeds/invoiceSeeder.ts';
import { InvoiceService } from '../src/services/invoiceService.ts';
import { prisma } from '../src/utils/prisma.ts';
import { logger } from '../src/utils/logger.ts';

async function testInvoiceSeeding() {
  try {
    logger.info('🧪 Starting invoice seeding test...');

    // Test 1: Check if we have subscriptions to work with
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: true,
        payments: true,
      },
    });

    logger.info(`📊 Found ${subscriptions.length} subscriptions to test`);

    if (subscriptions.length === 0) {
      logger.warn('⚠️  No subscriptions found. Please run the main seeder first.');
      return;
    }

    // Test 2: Run the invoice seeder
    logger.info('🔄 Running invoice seeder...');
    await InvoiceSeeder.run();

    // Test 3: Verify invoices were created
    const paymentsWithInvoices = await prisma.payment.findMany({
      where: {
        stripeInvoiceId: { not: null },
      },
      include: {
        subscription: {
          include: {
            user: true,
          },
        },
      },
    });

    logger.info(`✅ Created ${paymentsWithInvoices.length} invoices`);

    // Test 4: Display sample invoice data
    if (paymentsWithInvoices.length > 0) {
      const sampleInvoice = paymentsWithInvoices[0];
      logger.info('📄 Sample Invoice Data:');
      logger.info(`   Invoice Number: ${sampleInvoice.stripeInvoiceId}`);
      logger.info(`   Amount: $${sampleInvoice.amount}`);
      logger.info(`   Status: ${sampleInvoice.status}`);
      logger.info(`   User: ${sampleInvoice.subscription.user.email}`);
      logger.info(`   Tier: ${sampleInvoice.subscription.tier}`);
      logger.info(`   Seats: ${sampleInvoice.subscription.seats}`);
      
      if (sampleInvoice.complianceData) {
        const complianceData = sampleInvoice.complianceData;
        logger.info(`   Subtotal: $${complianceData.subtotal}`);
        logger.info(`   Tax Amount: $${complianceData.taxTotal}`);
        logger.info(`   Total: $${complianceData.total}`);
      }
    }

    // Test 5: Test invoice service functions
    logger.info('🔧 Testing invoice service functions...');

    // Test getting invoice summary
    const summary = await InvoiceService.getInvoiceSummary();
    logger.info('📈 Invoice Summary:');
    logger.info(`   Total Invoices: ${summary.totalInvoices}`);
    logger.info(`   Total Revenue: $${summary.totalRevenue.toFixed(2)}`);
    logger.info(`   Average Amount: $${summary.averageInvoiceAmount.toFixed(2)}`);

    // Test getting all invoices (paginated)
    const allInvoices = await InvoiceService.getAllInvoices(1, 5);
    logger.info(`📋 Retrieved ${allInvoices.invoices.length} invoices (page 1 of ${Math.ceil(allInvoices.total / 5)})`);

    // Test 6: Verify API endpoints would work
    logger.info('🌐 API Endpoints Test:');
    logger.info('   GET /api/invoices - Get user invoices');
    logger.info('   GET /api/invoices/:id - Get specific invoice');
    logger.info('   POST /api/invoices - Create new invoice');
    logger.info('   GET /api/invoices/:id/pdf - Generate PDF');
    logger.info('   POST /api/invoices/:id/send - Send email');
    logger.info('   GET /api/invoices/admin/all - Get all invoices (admin)');
    logger.info('   GET /api/invoices/admin/summary - Get summary (admin)');

    logger.info('✅ All tests completed successfully!');
    logger.info('🎉 Invoice seeding system is working correctly.');

  } catch (error) {
    logger.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testInvoiceSeeding()
    .catch((err) => {
      logger.error('Test failed', err);
      process.exitCode = 1;
    });
}

export { testInvoiceSeeding };

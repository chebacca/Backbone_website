#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupUsers() {
  try {
    console.log('🧹 Starting user cleanup...');

    // Users to remove
    const usersToRemove = [
      'chebacca@gmail.com',
      'admin@dashboardv14.com'
    ];

    for (const email of usersToRemove) {
      const existingUser = await prisma.user.findUnique({ 
        where: { email },
        include: {
          subscriptions: true,
          licenses: true,
          payments: true,
          auditLogs: true,
          complianceEvents: true,
          usageAnalytics: true,
        }
      });

      if (existingUser) {
        console.log(`🗑️  Removing user: ${email}`);
        
        // Delete related data first (due to foreign key constraints)
        if (existingUser.auditLogs.length > 0) {
          await prisma.userAuditLog.deleteMany({
            where: { userId: existingUser.id }
          });
          console.log(`  - Removed ${existingUser.auditLogs.length} audit logs`);
        }

        if (existingUser.complianceEvents.length > 0) {
          await prisma.complianceEvent.deleteMany({
            where: { userId: existingUser.id }
          });
          console.log(`  - Removed ${existingUser.complianceEvents.length} compliance events`);
        }

        if (existingUser.usageAnalytics.length > 0) {
          await prisma.usageAnalytics.deleteMany({
            where: { userId: existingUser.id }
          });
          console.log(`  - Removed ${existingUser.usageAnalytics.length} usage analytics`);
        }

        if (existingUser.payments.length > 0) {
          await prisma.payment.deleteMany({
            where: { userId: existingUser.id }
          });
          console.log(`  - Removed ${existingUser.payments.length} payments`);
        }

        if (existingUser.licenses.length > 0) {
          await prisma.license.deleteMany({
            where: { userId: existingUser.id }
          });
          console.log(`  - Removed ${existingUser.licenses.length} licenses`);
        }

        if (existingUser.subscriptions.length > 0) {
          await prisma.subscription.deleteMany({
            where: { userId: existingUser.id }
          });
          console.log(`  - Removed ${existingUser.subscriptions.length} subscriptions`);
        }

        // Finally delete the user
        await prisma.user.delete({
          where: { id: existingUser.id }
        });
        
        console.log(`✅ Successfully removed user: ${email}`);
      } else {
        console.log(`ℹ️  User not found: ${email}`);
      }
    }

    console.log('✅ User cleanup completed successfully!');
  } catch (error) {
    console.error('❌ User cleanup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupUsers();

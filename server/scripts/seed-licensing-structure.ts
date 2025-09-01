#!/usr/bin/env node

import { db } from '../src/services/db.js';
import { LicenseService } from '../src/services/licenseService.js';
import { SubscriptionSeedingService } from '../src/services/subscriptionSeedingService.js';
import { logger } from '../src/utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed the licensing structure according to MPC library recommendations
 * This script creates the proper tier structure and seeds new accounts with appropriate licenses
 */

interface SeedUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  createdAt: Date;
}

interface SeedSubscription {
  id: string;
  userId: string;
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  seats: number;
  status: 'ACTIVE' | 'PENDING' | 'CANCELLED' | 'PAST_DUE';
  billingCycle: 'MONTHLY' | 'ANNUAL';
  pricePerSeat: number;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
}

class LicensingStructureSeeder {
  private static users: SeedUser[] = [];
  private static subscriptions: SeedSubscription[] = [];

  /**
   * Generate seed users with proper tier distribution
   */
  private static generateUsers(): SeedUser[] {
    const users: SeedUser[] = [];
    
    // Create users for each tier to demonstrate the licensing structure
    const tierUsers = [
      { email: 'basic.user@example.com', name: 'Basic User', tier: 'BASIC' as const },
      { email: 'basic.team@example.com', name: 'Basic Team', tier: 'BASIC' as const },
      { email: 'pro.user@example.com', name: 'Pro User', tier: 'PRO' as const },
      { email: 'pro.team@example.com', name: 'Pro Team', tier: 'PRO' as const },
      { email: 'enterprise.user@example.com', name: 'Enterprise User', tier: 'ENTERPRISE' as const },
      { email: 'enterprise.team@example.com', name: 'Enterprise Team', tier: 'ENTERPRISE' as const },
    ];

    tierUsers.forEach((userData, index) => {
      users.push({
        id: `user-${uuidv4()}`,
        email: userData.email,
        name: userData.name,
        role: 'USER',
        tier: userData.tier,
        createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)), // Stagger creation dates
      });
    });

    return users;
  }

  /**
   * Generate subscriptions with proper tier limits and pricing
   */
  private static generateSubscriptions(users: SeedUser[]): SeedSubscription[] {
    const subscriptions: SeedSubscription[] = [];
    
    users.forEach((user) => {
      // Get tier-specific configuration
      const maxSeats = LicenseService.getLicenseCountForTier(user.tier);
      const initialSeats = LicenseService.getInitialLicenseCountForTier(user.tier);
      
      // Determine actual seat count (start with initial, can expand to max)
      const actualSeats = Math.min(initialSeats + Math.floor(Math.random() * 3), maxSeats);
      
      // Pricing based on tier (monthly rates)
      const pricePerSeat = user.tier === 'BASIC' ? 15 : user.tier === 'PRO' ? 29 : 99;
      
      // Billing cycle (Enterprise typically annual, others monthly)
      const billingCycle = user.tier === 'ENTERPRISE' ? 'ANNUAL' : 'MONTHLY';
      
      // Calculate period dates
      const now = new Date();
      const periodDays = billingCycle === 'ANNUAL' ? 365 : 30;
      const currentPeriodStart = new Date(now.getTime() - Math.floor(Math.random() * periodDays) * 24 * 60 * 60 * 1000);
      const currentPeriodEnd = new Date(currentPeriodStart.getTime() + periodDays * 24 * 60 * 60 * 1000);

      subscriptions.push({
        id: `sub-${uuidv4()}`,
        userId: user.id,
        tier: user.tier,
        seats: actualSeats,
        status: 'ACTIVE',
        billingCycle,
        pricePerSeat,
        currentPeriodStart,
        currentPeriodEnd,
        createdAt: currentPeriodStart,
      });
    });

    return subscriptions;
  }

  /**
   * Seed the licensing structure
   */
  static async seed() {
    try {
      logger.info('🌱 Starting licensing structure seeding...');

      // 1. Generate seed data
      this.users = this.generateUsers();
      this.subscriptions = this.generateSubscriptions(this.users);

      logger.info(`Generated ${this.users.length} users and ${this.subscriptions.length} subscriptions`);

      // 2. Create users in database
      logger.info('👥 Creating users...');
      for (const user of this.users) {
        try {
          await db.createUser({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: 'active',
            createdAt: user.createdAt,
            updatedAt: user.createdAt,
          } as any);
          logger.info(`✅ Created user: ${user.email} (${user.tier})`);
        } catch (error) {
          logger.warn(`⚠️ User ${user.email} already exists, skipping`);
        }
      }

      // 3. Create subscriptions and seed licenses
      logger.info('💳 Creating subscriptions and seeding licenses...');
      for (const subscription of this.subscriptions) {
        try {
          // Create subscription
          const createdSubscription = await db.createSubscription({
            id: subscription.id,
            userId: subscription.userId,
            tier: subscription.tier,
            seats: subscription.seats,
            status: subscription.status,
            billingCycle: subscription.billingCycle,
            pricePerSeat: subscription.pricePerSeat,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            createdAt: subscription.createdAt,
            updatedAt: subscription.createdAt,
          } as any);

          logger.info(`✅ Created subscription: ${subscription.tier} with ${subscription.seats} seats`);

          // Seed licenses using the new service
          const seedingResult = await SubscriptionSeedingService.seedNewSubscription(
            subscription.userId,
            subscription.id,
            subscription.tier
          );

          logger.info(`✅ Seeded ${seedingResult.licenses.length} licenses for ${subscription.tier} subscription`);

        } catch (error) {
          logger.error(`❌ Failed to create subscription for ${subscription.tier}:`, error);
        }
      }

      // 4. Display summary
      logger.info('📊 Licensing Structure Seeding Summary:');
      logger.info('=====================================');
      
      const tierSummary = this.subscriptions.reduce((acc, sub) => {
        if (!acc[sub.tier]) {
          acc[sub.tier] = { count: 0, totalSeats: 0, totalLicenses: 0 };
        }
        acc[sub.tier].count++;
        acc[sub.tier].totalSeats += sub.seats;
        return acc;
      }, {} as Record<string, { count: number; totalSeats: number; totalLicenses: number }>);

      Object.entries(tierSummary).forEach(([tier, stats]) => {
        const maxSeats = LicenseService.getLicenseCountForTier(tier as any);
        const initialSeats = LicenseService.getInitialLicenseCountForTier(tier as any);
        
        logger.info(`${tier} Tier:`);
        logger.info(`  - Subscriptions: ${stats.count}`);
        logger.info(`  - Total Seats: ${stats.totalSeats}`);
        logger.info(`  - Initial License Count: ${initialSeats}`);
        logger.info(`  - Maximum License Count: ${maxSeats}`);
        logger.info(`  - Growth Available: ${maxSeats - stats.totalSeats} seats`);
        logger.info('');
      });

      logger.info('🎉 Licensing structure seeding completed successfully!');
      logger.info('');
      logger.info('📋 Next Steps:');
      logger.info('1. Users can now log in with their seeded accounts');
      logger.info('2. Licenses are automatically assigned when team members join');
      logger.info('3. Subscriptions can be expanded within tier limits');
      logger.info('4. Use /api/subscriptions/tiers to view tier information');

    } catch (error) {
      logger.error('❌ Licensing structure seeding failed:', error);
      throw error;
    }
  }

  /**
   * Clean up seeded data (for testing)
   */
  static async cleanup() {
    try {
      logger.info('🧹 Cleaning up seeded data...');
      
      // Clean up subscriptions and their licenses
      for (const subscription of this.subscriptions) {
        try {
          await db.deleteSubscription(subscription.id);
          logger.info(`🗑️ Deleted subscription: ${subscription.id}`);
        } catch (error) {
          logger.warn(`⚠️ Could not delete subscription: ${subscription.id}`);
        }
      }

      // Clean up users
      for (const user of this.users) {
        try {
          await db.deleteUser(user.id);
          logger.info(`🗑️ Deleted user: ${user.email}`);
        } catch (error) {
          logger.warn(`⚠️ Could not delete user: ${user.email}`);
        }
      }

      logger.info('✅ Cleanup completed');
    } catch (error) {
      logger.error('❌ Cleanup failed:', error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'seed':
        await LicensingStructureSeeder.seed();
        break;
      case 'cleanup':
        await LicensingStructureSeeder.cleanup();
        break;
      default:
        logger.info('Usage: npm run seed-licensing-structure [seed|cleanup]');
        logger.info('');
        logger.info('Commands:');
        logger.info('  seed     - Seed the licensing structure with users and subscriptions');
        logger.info('  cleanup  - Remove seeded data (for testing)');
        break;
    }
  } catch (error) {
    logger.error('Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { LicensingStructureSeeder };

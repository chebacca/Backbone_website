#!/usr/bin/env node

import { db } from '../src/services/db.js';
import { LicenseService } from '../src/services/licenseService.js';
import { SubscriptionSeedingService } from '../src/services/subscriptionSeedingService.js';
import { logger } from '../src/utils/logger.js';

/**
 * Update existing users in the database with the new licensing structure
 * This script implements the MPC library recommendations for Basic, Pro, and Enterprise tiers
 */

interface UserUpdate {
  id: string;
  email: string;
  currentTier?: string;
  newTier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  currentSeats?: number;
  newSeats: number;
  needsUpdate: boolean;
}

interface UpdateSummary {
  totalUsers: number;
  updatedUsers: number;
  skippedUsers: number;
  errors: string[];
  tierDistribution: Record<string, number>;
}

class ExistingUsersLicensingUpdater {
  private static updateSummary: UpdateSummary = {
    totalUsers: 0,
    updatedUsers: 0,
    skippedUsers: 0,
    errors: [],
    tierDistribution: { BASIC: 0, PRO: 0, ENTERPRISE: 0 }
  };

  /**
   * Determine appropriate tier and seat count for existing users
   */
  private static determineUserTier(user: any): { tier: 'BASIC' | 'PRO' | 'ENTERPRISE', seats: number } {
    // Default to BASIC if no tier information
    if (!user.tier) {
      return { tier: 'BASIC', seats: 3 };
    }

    const currentTier = user.tier.toUpperCase();
    
    // If already has a valid tier, maintain it but ensure proper seat count
    if (['BASIC', 'PRO', 'ENTERPRISE'].includes(currentTier)) {
      const maxSeats = LicenseService.getLicenseCountForTier(currentTier as any);
      const initialSeats = LicenseService.getInitialLicenseCountForTier(currentTier as any);
      
      // Use current seats if within limits, otherwise use initial seats
      const currentSeats = user.seats || 1;
      const appropriateSeats = Math.min(Math.max(currentSeats, initialSeats), maxSeats);
      
      return { tier: currentTier as any, seats: appropriateSeats };
    }

    // Map legacy tiers to new structure
    const tierMapping: Record<string, 'BASIC' | 'PRO' | 'ENTERPRISE'> = {
      'FREE': 'BASIC',
      'STANDARD': 'BASIC',
      'PREMIUM': 'PRO',
      'BUSINESS': 'PRO',
      'CORPORATE': 'ENTERPRISE',
      'UNLIMITED': 'ENTERPRISE'
    };

    const newTier = tierMapping[currentTier] || 'BASIC';
    const seats = LicenseService.getInitialLicenseCountForTier(newTier);
    
    return { tier: newTier, seats };
  }

  /**
   * Update user's subscription and licenses
   */
  private static async updateUserLicensing(user: any, newTier: string, newSeats: number): Promise<boolean> {
    try {
      logger.info(`Updating user ${user.email} to ${newTier} tier with ${newSeats} seats`);

      // Get existing subscription
      const existingSubscriptions = await db.getSubscriptionsByUserId(user.id);
      let subscription = existingSubscriptions.find((s: any) => s.status === 'ACTIVE');

      if (subscription) {
        // Update existing subscription
        await db.updateSubscription(subscription.id, {
          tier: newTier,
          seats: newSeats,
          updatedAt: new Date()
        } as any);
        
        logger.info(`✅ Updated existing subscription for ${user.email}`);
      } else {
        // Create new subscription
        const now = new Date();
        const subscriptionData = {
          userId: user.id,
          tier: newTier,
          seats: newSeats,
          status: 'ACTIVE',
          billingCycle: newTier === 'ENTERPRISE' ? 'ANNUAL' : 'MONTHLY',
          pricePerSeat: newTier === 'BASIC' ? 15 : newTier === 'PRO' ? 29 : 99,
          currentPeriodStart: now,
          currentPeriodEnd: new Date(now.getTime() + (newTier === 'ENTERPRISE' ? 365 : 30) * 24 * 60 * 60 * 1000),
          createdAt: now,
          updatedAt: now
        };

        subscription = await db.createSubscription(subscriptionData as any);
        logger.info(`✅ Created new subscription for ${user.email}`);
      }

      // Update user tier information
      await db.updateUser(user.id, {
        tier: newTier,
        updatedAt: new Date()
      } as any);

      // Seed licenses for the subscription
      if (subscription) {
        await SubscriptionSeedingService.seedNewSubscription(
          user.id,
          subscription.id,
          newTier as any
        );
        logger.info(`✅ Seeded licenses for ${user.email}`);
      }

      return true;
    } catch (error) {
      logger.error(`❌ Failed to update user ${user.email}:`, error);
      this.updateSummary.errors.push(`User ${user.email}: ${(error as Error).message}`);
      return false;
    }
  }

  /**
   * Update all existing users with the new licensing structure
   */
  static async updateAllUsers() {
    try {
      logger.info('🔄 Starting update of existing users with new licensing structure...');

      // Get all users
      const allUsers = await db.getAllUsers();
      this.updateSummary.totalUsers = allUsers.length;

      logger.info(`Found ${allUsers.length} users to process`);

      // Process each user
      for (const user of allUsers) {
        try {
          // Skip system users and admin accounts
          if (user.role === 'SUPERADMIN' || user.email?.includes('@system') || user.email?.includes('admin')) {
            logger.info(`⏭️ Skipping system/admin user: ${user.email}`);
            this.updateSummary.skippedUsers++;
            continue;
          }

          // Determine appropriate tier and seats
          const { tier, seats } = this.determineUserTier(user);
          
          // Check if update is needed
          const needsUpdate = user.tier !== tier || (user.seats && user.seats !== seats);
          
          if (needsUpdate) {
            logger.info(`🔄 User ${user.email} needs update: ${user.tier || 'NO_TIER'} → ${tier}, ${user.seats || 1} → ${seats} seats`);
            
            const success = await this.updateUserLicensing(user, tier, seats);
            if (success) {
              this.updateSummary.updatedUsers++;
              this.updateSummary.tierDistribution[tier]++;
            }
          } else {
            logger.info(`✅ User ${user.email} already has correct tier: ${tier} with ${seats} seats`);
            this.updateSummary.tierDistribution[tier]++;
          }

        } catch (error) {
          logger.error(`❌ Error processing user ${user.email}:`, error);
          this.updateSummary.errors.push(`User ${user.email}: ${(error as Error).message}`);
        }
      }

      // Display summary
      this.displayUpdateSummary();

    } catch (error) {
      logger.error('❌ Failed to update users:', error);
      throw error;
    }
  }

  /**
   * Display update summary
   */
  private static displayUpdateSummary() {
    logger.info('');
    logger.info('📊 Licensing Structure Update Summary');
    logger.info('=====================================');
    logger.info(`Total Users Processed: ${this.updateSummary.totalUsers}`);
    logger.info(`Users Updated: ${this.updateSummary.updatedUsers}`);
    logger.info(`Users Skipped: ${this.updateSummary.skippedUsers}`);
    logger.info('');
    logger.info('Tier Distribution:');
    Object.entries(this.updateSummary.tierDistribution).forEach(([tier, count]) => {
      logger.info(`  ${tier}: ${count} users`);
    });
    
    if (this.updateSummary.errors.length > 0) {
      logger.info('');
      logger.info('❌ Errors encountered:');
      this.updateSummary.errors.forEach(error => {
        logger.info(`  - ${error}`);
      });
    }

    logger.info('');
    logger.info('🎉 Licensing structure update completed!');
    logger.info('');
    logger.info('📋 Next Steps:');
    logger.info('1. Verify user tier assignments in the database');
    logger.info('2. Check that licenses were properly seeded');
    logger.info('3. Test subscription management functionality');
    logger.info('4. Monitor for any licensing-related errors');
  }

  /**
   * Dry run to see what changes would be made
   */
  static async dryRun() {
    try {
      logger.info('🔍 Performing dry run to preview changes...');

      const allUsers = await db.getAllUsers();
      const userUpdates: UserUpdate[] = [];

      for (const user of allUsers) {
        if (user.role === 'SUPERADMIN' || user.email?.includes('@system') || user.email?.includes('admin')) {
          continue;
        }

        const { tier, seats } = this.determineUserTier(user);
        const needsUpdate = user.tier !== tier || (user.seats && user.seats !== seats);

        userUpdates.push({
          id: user.id,
          email: user.email,
          currentTier: user.tier,
          newTier: tier,
          currentSeats: user.seats,
          newSeats: seats,
          needsUpdate
        });
      }

      // Display preview
      logger.info('');
      logger.info('🔍 Dry Run Results - Preview of Changes');
      logger.info('==========================================');
      
      const needsUpdate = userUpdates.filter(u => u.needsUpdate);
      const noChange = userUpdates.filter(u => !u.needsUpdate);

      if (needsUpdate.length > 0) {
        logger.info(`Users that would be updated (${needsUpdate.length}):`);
        needsUpdate.forEach(user => {
          logger.info(`  ${user.email}: ${user.currentTier || 'NO_TIER'} → ${user.newTier}, ${user.currentSeats || 1} → ${user.newSeats} seats`);
        });
      }

      if (noChange.length > 0) {
        logger.info(`Users that would remain unchanged (${noChange.length}):`);
        noChange.forEach(user => {
          logger.info(`  ${user.email}: ${user.newTier} tier with ${user.newSeats} seats (already correct)`);
        });
      }

      logger.info('');
      logger.info('💡 To apply these changes, run: npm run update-existing-users-licensing');

    } catch (error) {
      logger.error('❌ Dry run failed:', error);
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
      case 'update':
        await ExistingUsersLicensingUpdater.updateAllUsers();
        break;
      case 'dry-run':
        await ExistingUsersLicensingUpdater.dryRun();
        break;
      default:
        logger.info('Usage: npm run update-existing-users-licensing [update|dry-run]');
        logger.info('');
        logger.info('Commands:');
        logger.info('  update     - Update existing users with new licensing structure');
        logger.info('  dry-run    - Preview changes without applying them');
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

export { ExistingUsersLicensingUpdater };

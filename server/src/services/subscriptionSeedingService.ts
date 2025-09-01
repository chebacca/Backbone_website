import { logger } from '../utils/logger.js';
import { db } from './db.js';
import { LicenseService } from './licenseService.js';
import { ComplianceService } from './complianceService.js';
import { EmailService } from './emailService.js';

export type SubscriptionTier = 'BASIC' | 'PRO' | 'ENTERPRISE';

export class SubscriptionSeedingService {
  /**
   * Seed a new subscription with the appropriate number of licenses based on tier
   * This implements the MPC library recommendations for initial account setup
   */
  static async seedNewSubscription(
    userId: string,
    subscriptionId: string,
    tier: SubscriptionTier,
    organizationId?: string
  ) {
    try {
      logger.info(`Seeding new ${tier} subscription for user ${userId}`);

      // Get the initial license count for the tier
      const initialLicenseCount = LicenseService.getInitialLicenseCountForTier(tier);
      const maxLicenseCount = LicenseService.getLicenseCountForTier(tier);

      logger.info(`Tier ${tier}: Initial licenses: ${initialLicenseCount}, Max licenses: ${maxLicenseCount}`);

      // Generate initial seeded licenses
      const licenses = await LicenseService.generateLicenses(
        userId,
        subscriptionId,
        tier,
        initialLicenseCount,
        'ACTIVE', // Start with active licenses
        12, // 12 months expiry
        organizationId
      );

      // Create audit log for seeding
      await ComplianceService.createAuditLog(
        userId,
        'SUBSCRIPTION_SEEDING',
        `Seeded ${tier} subscription with ${initialLicenseCount} initial licenses`,
        {
          subscriptionId,
          tier,
          initialLicenseCount,
          maxLicenseCount,
          licenseIds: licenses.map(l => l.id),
          organizationId,
        }
      );

      // Send welcome email with license information
      const user = await db.getUserById(userId);
      if (user) {
        await EmailService.sendSubscriptionSeedingEmail(user, {
          tier,
          initialLicenseCount,
          maxLicenseCount,
          licenses,
          subscriptionId,
        });
      }

      logger.info(`Successfully seeded ${tier} subscription with ${initialLicenseCount} licenses`);
      return {
        tier,
        initialLicenseCount,
        maxLicenseCount,
        licenses,
        organizationId,
      };
    } catch (error) {
      logger.error('Failed to seed subscription', error);
      throw error;
    }
  }

  /**
   * Expand subscription licenses when needed (e.g., adding more team members)
   * This allows growth within tier limits
   */
  static async expandSubscriptionLicenses(
    userId: string,
    subscriptionId: string,
    tier: SubscriptionTier,
    additionalSeats: number,
    organizationId?: string
  ) {
    try {
      logger.info(`Expanding ${tier} subscription by ${additionalSeats} seats`);

      // Get current license count
      const currentLicenses = await db.getLicensesBySubscriptionId(subscriptionId);
      const currentCount = currentLicenses.length;
      const maxCount = LicenseService.getLicenseCountForTier(tier);

      // Validate expansion doesn't exceed tier limits
      if (currentCount + additionalSeats > maxCount) {
        throw new Error(`Cannot expand to ${currentCount + additionalSeats} seats: exceeds ${tier} tier limit of ${maxCount}`);
      }

      // Generate additional licenses
      const newLicenses = await LicenseService.generateLicenses(
        userId,
        subscriptionId,
        tier,
        additionalSeats,
        'ACTIVE',
        12,
        organizationId
      );

      // Create audit log for expansion
      await ComplianceService.createAuditLog(
        userId,
        'SUBSCRIPTION_EXPANSION',
        `Expanded ${tier} subscription by ${additionalSeats} seats`,
        {
          subscriptionId,
          tier,
          previousCount: currentCount,
          newCount: currentCount + additionalSeats,
          maxCount,
          newLicenseIds: newLicenses.map(l => l.id),
          organizationId,
        }
      );

      logger.info(`Successfully expanded subscription to ${currentCount + additionalSeats} seats`);
      return {
        tier,
        previousCount: currentCount,
        newCount: currentCount + additionalSeats,
        maxCount,
        newLicenses,
      };
    } catch (error) {
      logger.error('Failed to expand subscription licenses', error);
      throw error;
    }
  }

  /**
   * Get subscription summary with license usage information
   */
  static async getSubscriptionSummary(subscriptionId: string) {
    try {
      const subscription = await db.getSubscriptionById(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const licenses = await db.getLicensesBySubscriptionId(subscriptionId);
      const activeLicenses = licenses.filter(l => l.status === 'ACTIVE');
      const assignedLicenses = licenses.filter(l => l.userId); // Use userId instead of assignedToUserId

      const maxLicenses = LicenseService.getLicenseCountForTier(subscription.tier);
      const initialLicenses = LicenseService.getInitialLicenseCountForTier(subscription.tier);

      return {
        subscription,
        licenses: {
          total: licenses.length,
          active: activeLicenses.length,
          assigned: assignedLicenses.length,
          available: activeLicenses.length - assignedLicenses.length,
        },
        limits: {
          max: maxLicenses,
          initial: initialLicenses,
          canExpand: licenses.length < maxLicenses,
          expansionAvailable: maxLicenses - licenses.length,
        },
      };
    } catch (error) {
      logger.error('Failed to get subscription summary', error);
      throw error;
    }
  }
}

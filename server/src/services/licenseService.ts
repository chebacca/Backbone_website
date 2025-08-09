import { logger } from '../utils/logger.js';
import { LicenseKeyUtil } from '../utils/licenseKey.js';
import { ComplianceService } from './complianceService.js';
import { firestoreService, FirestoreLicense } from './firestoreService.js';

export type SubscriptionTier = 'BASIC' | 'PRO' | 'ENTERPRISE';

export class LicenseService {
  /**
   * Generate licenses for a subscription
   */
  static async generateLicenses(
    userId: string,
    subscriptionId: string,
    tier: SubscriptionTier,
    seatCount: number
  ) {
    try {
      logger.info(`Generating ${seatCount} licenses for subscription ${subscriptionId}`);

      const licenses: FirestoreLicense[] = [];

      for (let i = 0; i < seatCount; i++) {
        // Generate secure license key
        const licenseKey = LicenseKeyUtil.generateSecureLicenseKey(userId, tier);
        
        // Create license features based on tier
        const features = LicenseKeyUtil.createLicenseFeatures(tier);
        
        // Calculate expiry (1 year from now for all tiers)
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        // Create license record
        const license = await firestoreService.createLicense({
          key: licenseKey,
          userId,
          subscriptionId,
          status: 'PENDING',
          tier,
          expiresAt,
          features,
          activationCount: 0,
          deviceInfo: undefined,
          ipAddress: undefined,
          maxActivations: tier === 'ENTERPRISE' ? 5 : tier === 'PRO' ? 3 : 1,
        });

        licenses.push(license);
      }

      // Create audit log
      await ComplianceService.createAuditLog(
        userId,
        'LICENSE_ACTIVATE',
        `Generated ${seatCount} ${tier} licenses`,
        {
          subscriptionId,
          licenseCount: seatCount,
          licenseIds: licenses.map(l => l.id),
        }
      );

      logger.info(`Successfully generated ${seatCount} licenses for subscription ${subscriptionId}`);
      return licenses;
    } catch (error) {
      logger.error('Failed to generate licenses', error);
      throw error;
    }
  }

  /**
   * Activate a license
   */
  static async activateLicense(
    licenseKey: string,
    deviceInfo: any,
    requestInfo: { ip?: string; userAgent?: string }
  ) {
    try {
      logger.info(`Activating license: ${licenseKey}`);

      // Validate license key format
      if (!LicenseKeyUtil.validateFormat(licenseKey)) {
        throw new Error('Invalid license key format');
      }

      // Find license
      const license = await firestoreService.getLicenseByKey(licenseKey);

      if (!license) {
        throw new Error('License not found');
      }

      // Check license status
      if (license.status !== 'PENDING' && license.status !== 'ACTIVE') {
        throw new Error(`License is ${license.status.toLowerCase()}`);
      }

      // Check expiry
      if (license.expiresAt && new Date() > new Date(license.expiresAt)) {
        await firestoreService.updateLicense(license.id, { status: 'EXPIRED' });
        throw new Error('License has expired');
      }

      // Check activation count
      if (license.activationCount >= license.maxActivations) {
        throw new Error('Maximum activations reached');
      }

      // Generate device fingerprint
      const deviceFingerprint = LicenseKeyUtil.generateDeviceFingerprint(deviceInfo);

      // Update license
      const updatedLicenseData: Partial<FirestoreLicense> = {
        status: 'ACTIVE',
        activatedAt: (license as any).activatedAt || new Date(),
        activationCount: (license.activationCount || 0) + 1,
        deviceInfo: {
          ...deviceInfo,
          fingerprint: deviceFingerprint,
          activatedAt: new Date().toISOString(),
        },
        ipAddress: requestInfo.ip,
      };
      await firestoreService.updateLicense(license.id, updatedLicenseData);
      const updatedLicense = await firestoreService.getLicenseById(license.id);
      if (!updatedLicense) {
        throw new Error('Failed to load updated license');
      }

      // Generate cloud configuration
      const cloudConfig = LicenseKeyUtil.createCloudConfig(license.tier, license.id);

      // Create audit log
      await ComplianceService.createAuditLog(
        license.userId,
        'LICENSE_ACTIVATE',
        `License activated: ${licenseKey}`,
        {
          licenseId: license.id,
          deviceInfo,
          deviceFingerprint,
        },
        requestInfo
      );

      // Track usage analytics
      await firestoreService.createUsageAnalytics({
        userId: license.userId,
        licenseId: license.id,
        event: 'LICENSE_ACTIVATION',
        metadata: {
          deviceInfo,
          deviceFingerprint,
          activationCount: updatedLicense.activationCount,
        },
        ipAddress: requestInfo.ip,
        userAgent: requestInfo.userAgent,
      });

      logger.info(`License activated successfully: ${licenseKey}`, {
        userId: license.userId,
        licenseId: license.id,
        activationCount: updatedLicense.activationCount,
      });

      return {
        success: true,
        message: 'License activated successfully',
        license: {
          id: updatedLicense.id,
          key: updatedLicense.key,
          tier: updatedLicense.tier as any,
          status: updatedLicense.status,
          features: updatedLicense.features,
          expiresAt: updatedLicense.expiresAt,
          activationCount: updatedLicense.activationCount,
          maxActivations: updatedLicense.maxActivations,
        },
        cloudConfig,
      };
    } catch (error) {
      logger.error('License activation failed', error as any);
      
      // Create compliance event for failed activation
      await ComplianceService.createComplianceEvent(
        'REGULATORY_BREACH',
        'MEDIUM',
        `License activation failed: ${(error as any)?.message}`,
        undefined,
        undefined,
        { licenseKey, deviceInfo, error: (error as any)?.message }
      );

      throw error;
    }
  }

  /**
   * Deactivate a license
   */
  static async deactivateLicense(
    licenseKey: string,
    userId: string,
    reason: string = 'User requested deactivation'
  ) {
    try {
      logger.info(`Deactivating license: ${licenseKey}`);

      const license = await firestoreService.getLicenseByKey(licenseKey);

      if (!license) {
        throw new Error('License not found');
      }

      if (license.userId !== userId) {
        throw new Error('Unauthorized: License does not belong to user');
      }

      // Update license status
      await firestoreService.updateLicense(license.id, {
        status: 'SUSPENDED',
        activationCount: Math.max(0, (license.activationCount || 0) - 1),
      });

      // Create audit log
      await ComplianceService.createAuditLog(
        userId,
        'LICENSE_DEACTIVATE',
        `License deactivated: ${licenseKey}`,
        {
          licenseId: license.id,
          reason,
        }
      );

      // Track usage analytics
      await firestoreService.createUsageAnalytics({
        userId,
        licenseId: license.id,
        event: 'LICENSE_DEACTIVATION',
        metadata: { reason },
      });

      logger.info(`License deactivated successfully: ${licenseKey}`);
      return { success: true, message: 'License deactivated successfully' };
    } catch (error) {
      logger.error('License deactivation failed', error);
      throw error;
    }
  }

  /**
   * Get user licenses
   */
  static async getUserLicenses(userId: string) {
    try {
      const licenses = await firestoreService.getLicensesByUserId(userId);

      return licenses.map(license => ({
        id: license.id,
        key: license.key,
        tier: license.tier,
        status: license.status,
        features: license.features,
        activatedAt: license.activatedAt,
        expiresAt: license.expiresAt,
        activationCount: license.activationCount,
        maxActivations: license.maxActivations,
        subscriptionId: license.subscriptionId,
        createdAt: license.createdAt,
      }));
    } catch (error) {
      logger.error('Failed to get user licenses', error as any);
      throw error;
    }
  }

  /**
   * Validate license and return details
   */
  static async validateLicense(licenseKey: string) {
    try {
      if (!LicenseKeyUtil.validateFormat(licenseKey)) {
        return { valid: false, error: 'Invalid license key format' };
      }

      const license = await firestoreService.getLicenseByKey(licenseKey);

      if (!license) {
        return { valid: false, error: 'License not found' };
      }

      if (license.status !== 'ACTIVE') {
        return { valid: false, error: `License is ${license.status.toLowerCase()}` };
      }

      if (license.expiresAt && new Date() > new Date(license.expiresAt)) {
        // Auto-expire the license
        await firestoreService.updateLicense(license.id, { status: 'EXPIRED' });
        return { valid: false, error: 'License has expired' };
      }

      return {
        valid: true,
        license: {
          id: license.id,
          key: license.key,
          tier: license.tier,
          status: license.status,
          features: license.features,
          expiresAt: license.expiresAt,
          user: await firestoreService.getUserById(license.userId),
          subscription: await firestoreService.getSubscriptionById(license.subscriptionId),
        },
      };
    } catch (error) {
      logger.error('License validation failed', error);
      return { valid: false, error: 'License validation failed' };
    }
  }

  /**
   * Generate download links for SDKs based on license
   */
  static async generateSDKDownloads(licenseKey: string) {
    try {
      const validation = await this.validateLicense(licenseKey);
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const license = validation.license!;

      // Get available SDK versions
      const sdkVersions = await firestoreService.getLatestSDKVersions();

      const downloads = sdkVersions.map(sdk => ({
        platform: sdk.platform,
        version: sdk.version,
        downloadUrl: `${process.env.FRONTEND_URL}/api/licenses/download-sdk/${sdk.id}?license=${licenseKey}`,
        size: sdk.size,
        checksum: sdk.checksum,
        releaseNotes: sdk.releaseNotes,
      }));

      // Track download request
      const user = license.user;
      if (!user) throw new Error('User for license not found');
      await firestoreService.createUsageAnalytics({
        userId: user.id,
        licenseId: license.id,
        event: 'SDK_DOWNLOAD_REQUEST',
        metadata: {
          requestedPlatforms: sdkVersions.map(s => s.platform),
        },
      });

      return downloads;
    } catch (error) {
      logger.error('Failed to generate SDK downloads', error);
      throw error;
    }
  }

  /**
   * Bulk license operations for enterprise
   */
  static async createBulkLicenses(
    adminUserId: string,
    subscriptionId: string,
    seatCount: number,
    userEmails: string[] = []
  ) {
    try {
      logger.info(`Creating bulk licenses for subscription ${subscriptionId}`);

      const subscription = await firestoreService.getSubscriptionById(subscriptionId);

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (subscription.tier !== 'ENTERPRISE') {
        throw new Error('Bulk licensing only available for Enterprise subscriptions');
      }

      // Check if admin user has permission
      // Basic permission check; in a full system we'd verify admin role separately

      // Generate licenses
      const licenses = await this.generateLicenses(
        subscription.userId,
        subscriptionId,
        subscription.tier,
        seatCount
      );

      // If user emails provided, assign licenses
      if (userEmails.length > 0) {
        for (let i = 0; i < Math.min(userEmails.length, licenses.length); i++) {
          const email = userEmails[i];
          const license = licenses[i];

          // Here you would typically create user accounts and assign licenses
          // For now, just log the assignment
          logger.info(`License ${license.key} assigned to ${email}`);
        }
      }

      // Create audit log
      await ComplianceService.createAuditLog(
        adminUserId,
        'LICENSE_ACTIVATE',
        `Created ${seatCount} bulk licenses for subscription ${subscriptionId}`,
        {
          subscriptionId,
          seatCount,
          assignedEmails: userEmails,
          licenseIds: licenses.map(l => l.id),
        }
      );

      return {
        success: true,
        message: `Successfully created ${seatCount} licenses`,
        licenses: licenses.map(l => ({
          id: l.id,
          key: l.key,
          tier: l.tier,
          status: l.status,
          expiresAt: l.expiresAt,
        })),
      };
    } catch (error) {
      logger.error('Bulk license creation failed', error);
      throw error;
    }
  }

  /**
   * Get license analytics and usage statistics
   */
  static async getLicenseAnalytics(userId: string, licenseId?: string) {
    try {
      const whereClause: any = { userId };
      if (licenseId) {
        whereClause.licenseId = licenseId;
      }

      const analytics = await firestoreService.getUsageAnalyticsByUser(userId);

      const summary = {
        totalEvents: analytics.length,
        eventTypes: analytics.reduce((acc: Record<string, number>, event) => {
          acc[event.event] = (acc[event.event] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        lastActivity: analytics[0]?.timestamp,
        licenses: await this.getUserLicenses(userId),
      };

      return { analytics, summary };
    } catch (error) {
      logger.error('Failed to get license analytics', error);
      throw error;
    }
  }

  /**
   * Get license details
   */
  static async getLicenseDetails(licenseId: string) {
    try {
      const license = await firestoreService.getLicenseById(licenseId);
      if (!license) return null;
      const [user, subscription, usageAnalytics] = await Promise.all([
        firestoreService.getUserById(license.userId),
        firestoreService.getSubscriptionById(license.subscriptionId),
        firestoreService.getUsageAnalyticsByLicense(licenseId),
      ]);
      return { ...license, user, subscription, usageAnalytics } as any;
    } catch (error) {
      logger.error('Failed to get license details', error);
      throw error;
    }
  }

  /**
   * Get SDK version
   */
  static async getSDKVersion(sdkId: string) {
    try {
      return await firestoreService.getSDKVersionById(sdkId);
    } catch (error) {
      logger.error('Failed to get SDK version', error);
      throw error;
    }
  }

  /**
   * Get available SDK versions
   */
  static async getAvailableSDKVersions(platform?: string) {
    try {
      return await firestoreService.getLatestSDKVersions(platform);
    } catch (error) {
      logger.error('Failed to get SDK versions', error);
      throw error;
    }
  }

  /**
   * Transfer license ownership
   */
  static async transferLicense(
    licenseKey: string,
    currentUserId: string,
    newOwnerEmail: string,
    reason?: string,
    requestInfo?: any
  ) {
    try {
      const license = await firestoreService.getLicenseByKey(licenseKey);

      if (!license) {
        throw new Error('License not found');
      }

      if (license.userId !== currentUserId) {
        throw new Error('Unauthorized: License does not belong to user');
      }

      const subscription = await firestoreService.getSubscriptionById(license.subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      if (subscription.tier !== 'ENTERPRISE') {
        throw new Error('License transfer only available for Enterprise subscriptions');
      }

      // Find or create new owner
      let newOwner = await firestoreService.getUserByEmail(newOwnerEmail);

      if (!newOwner) {
        throw new Error('New owner email not found. User must register first.');
      }

      // Create transfer request (in production, this would require approval)
      const transferId = `transfer_${Date.now()}`;

      // For now, directly transfer the license
      await firestoreService.updateLicense(license.id, {
        userId: newOwner.id,
        status: 'PENDING', // Require re-activation
        activationCount: 0,
      } as any);

      // Create audit logs
      await ComplianceService.createAuditLog(
        currentUserId,
        'LICENSE_DEACTIVATE',
        `License transferred to ${newOwnerEmail}`,
        {
          licenseId: license.id,
          newOwnerEmail,
          reason,
          transferId,
        },
        requestInfo
      );

      await ComplianceService.createAuditLog(
        newOwner.id,
        'LICENSE_ACTIVATE',
        `License received from transfer`,
        {
          licenseId: license.id,
          previousOwner: currentUserId,
          transferId,
        },
        requestInfo
      );

      return { transferId };
    } catch (error) {
      logger.error('License transfer failed', error);
      throw error;
    }
  }

  /**
   * Report license issue
   */
  static async reportLicenseIssue(
    userId: string,
    licenseKey: string,
    issueType: string,
    description: string,
    deviceInfo?: any,
    requestInfo?: any
  ) {
    try {
      const license = await firestoreService.getLicenseByKey(licenseKey);

      if (!license) {
        throw new Error('License not found');
      }

      if (license.userId !== userId) {
        throw new Error('Unauthorized: License does not belong to user');
      }

      const ticketId = `ticket_${Date.now()}`;

      // Create compliance event for the issue
      await ComplianceService.createComplianceEvent(
        'REGULATORY_BREACH',
        'MEDIUM',
        `License issue reported: ${issueType}`,
        userId,
        undefined,
        {
          licenseId: license.id,
          issueType,
          description,
          deviceInfo,
          ticketId,
        }
      );

      // Create audit log
      await ComplianceService.createAuditLog(
        userId,
        'LICENSE_ACTIVATE',
        `License issue reported: ${issueType}`,
        {
          licenseId: license.id,
          issueType,
          description,
          ticketId,
        },
        requestInfo
      );

      logger.info(`License issue reported: ${ticketId}`, {
        userId,
        licenseId: license.id,
        issueType,
      });

      return { ticketId };
    } catch (error) {
      logger.error('Failed to report license issue', error);
      throw error;
    }
  }

  /**
   * Get license usage
   */
  static async getLicenseUsage(licenseKey: string, userId: string) {
    try {
      const license = await firestoreService.getLicenseByKey(licenseKey);

      if (!license) {
        throw new Error('License not found');
      }

      if (license.userId !== userId) {
        throw new Error('Unauthorized: License does not belong to user');
      }

      const analytics = await firestoreService.getUsageAnalyticsByLicense(license.id);
      const usage = {
        licenseKey: licenseKey.substring(0, 8) + '...',
        status: license.status,
        activationCount: license.activationCount,
        maxActivations: license.maxActivations,
        totalEvents: analytics.length,
        eventTypes: analytics.reduce((acc: Record<string, number>, event) => {
          acc[event.event] = (acc[event.event] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        lastActivity: analytics[0]?.timestamp,
        recentActivity: analytics.slice(0, 10).map(event => ({
          event: event.event,
          timestamp: event.timestamp,
          metadata: event.metadata,
        })),
      };

      return usage;
    } catch (error) {
      logger.error('Failed to get license usage', error);
      throw error;
    }
  }
}

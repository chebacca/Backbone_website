import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export class LicenseKeyUtil {
  /**
   * Generate a license key in format: XXXX-XXXX-XXXX-XXXX-XXXX
   */
  static generateLicenseKey(): string {
    const segments = [];
    
    for (let i = 0; i < 5; i++) {
      const segment = crypto.randomBytes(2).toString('hex').toUpperCase();
      segments.push(segment);
    }
    
    return segments.join('-');
  }

  /**
   * Generate a more secure license key with checksum
   */
  static generateSecureLicenseKey(userId: string, tier: string): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    const userHash = crypto.createHash('md5').update(userId).digest('hex').substring(0, 4);
    const tierHash = crypto.createHash('md5').update(tier).digest('hex').substring(0, 2);
    
    const baseKey = `${timestamp}-${userHash}-${tierHash}-${random}`;
    const checksum = crypto.createHash('md5').update(baseKey).digest('hex').substring(0, 4);
    
    return `${baseKey}-${checksum}`.toUpperCase();
  }

  /**
   * Validate license key format
   */
  static validateFormat(licenseKey: string): boolean {
    // Check basic format: 5 segments of 4 characters each, separated by hyphens
    const pattern = /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;
    return pattern.test(licenseKey);
  }

  /**
   * Generate activation code for email verification
   */
  static generateActivationCode(): string {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  }

  /**
   * Generate device fingerprint
   */
  static generateDeviceFingerprint(deviceInfo: any): string {
    const deviceString = JSON.stringify(deviceInfo);
    return crypto.createHash('sha256').update(deviceString).digest('hex');
  }

  /**
   * Create license features object based on tier
   */
  static createLicenseFeatures(tier: string) {
    const baseFeatures = {
      basicWorkflows: true,
      localStorage: true,
      standardSupport: true,
    };

    switch (tier) {
      case 'BASIC':
        return {
          ...baseFeatures,
          maxProjects: 10,
          maxUsers: 10, // Updated to match MPC library: Basic = 10 seats
          cloudStorage: false,
          advancedFeatures: false,
          prioritySupport: false,
        };

      case 'PRO':
        return {
          ...baseFeatures,
          maxProjects: 100,
          maxUsers: 50, // Updated to match MPC library: Pro = 50 seats
          cloudStorage: true,
          advancedFeatures: true,
          prioritySupport: true,
          realTimeCollaboration: true,
          aiFeatures: true,
          analytics: true,
        };

      case 'ENTERPRISE':
        return {
          ...baseFeatures,
          maxProjects: -1, // unlimited
          maxUsers: 250, // Updated to match MPC library: Enterprise = 250 seats
          cloudStorage: true,
          advancedFeatures: true,
          prioritySupport: true,
          realTimeCollaboration: true,
          aiFeatures: true,
          analytics: true,
          whiteLabel: true,
          customIntegrations: true,
          dedicatedSupport: true,
          sso: true,
          auditLogs: true,
        };

      default:
        return baseFeatures;
    }
  }

  /**
   * Create cloud configuration for activated licenses
   */
  static createCloudConfig(tier: string, licenseId: string) {
    const baseConfig = {
      apiEndpoint: process.env.FRONTEND_URL || 'http://localhost:3002',
      websocketEndpoint: process.env.WEBSOCKET_URL || 'ws://localhost:3003',
    };

    if (tier === 'BASIC') {
      return {
        ...baseConfig,
        storageConfig: null,
        features: {
          realTimeCollaboration: false,
          cloudStorage: false,
          aiFeatures: false,
          analytics: false,
        },
      };
    }

    return {
      ...baseConfig,
      storageConfig: {
        bucket: `dashboard-v14-${licenseId}`,
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      features: {
        realTimeCollaboration: true,
        cloudStorage: true,
        aiFeatures: tier === 'PRO' || tier === 'ENTERPRISE',
        analytics: tier === 'PRO' || tier === 'ENTERPRISE',
      },
    };
  }
}

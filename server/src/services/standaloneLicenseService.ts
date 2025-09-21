/**
 * 🔥 STANDALONE LICENSE SERVICE
 * Manages Call Sheet Pro and EDL Converter Pro licenses for standalone users
 * 
 * Features:
 * - Call Sheet Pro license management
 * - EDL Converter Pro license management
 * - Standalone user license validation
 * - License activation and deactivation
 * - Usage tracking and limits
 */

import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const db = getFirestore();

// License types for standalone products
export const STANDALONE_LICENSE_TYPES = {
  CALLSHEET_PRO: 'CALLSHEET_PRO',
  EDL_CONVERTER_PRO: 'EDL_CONVERTER_PRO',
} as const;

export type StandaloneLicenseType = typeof STANDALONE_LICENSE_TYPES[keyof typeof STANDALONE_LICENSE_TYPES];

// License configuration for standalone products
export const STANDALONE_LICENSE_CONFIGS = {
  [STANDALONE_LICENSE_TYPES.CALLSHEET_PRO]: {
    name: 'Call Sheet Pro',
    description: 'Professional call sheet creation and management',
    features: [
      'unlimited_call_sheets',
      'advanced_templates',
      'custom_fields',
      'export_pdf',
      'export_excel',
      'real_time_collaboration',
      'version_control',
      'cloud_sync',
      'mobile_app',
      'api_access',
      'priority_support'
    ],
    limits: {
      maxCallSheets: -1, // Unlimited
      maxTemplates: 50,
      maxCollaborators: 10,
      maxStorageGB: 100,
      maxExportsPerMonth: 1000,
      maxAPIRequestsPerMonth: 10000
    },
    duration: 365, // 1 year
    price: 299 // USD
  },
  [STANDALONE_LICENSE_TYPES.EDL_CONVERTER_PRO]: {
    name: 'EDL Converter Pro',
    description: 'Professional EDL conversion and analysis tools',
    features: [
      'unlimited_conversions',
      'batch_processing',
      'advanced_formats',
      'custom_export_templates',
      'real_time_analysis',
      'cloud_processing',
      'api_access',
      'webhook_integrations',
      'priority_support',
      'dedicated_support'
    ],
    limits: {
      maxFiles: 1000,
      maxFileSizeMB: 500,
      maxEvents: 1000000,
      maxBatchSize: 100,
      maxStorageGB: 200,
      maxAPIRequestsPerMonth: 50000
    },
    duration: 365, // 1 year
    price: 199 // USD
  }
};

export interface StandaloneLicense {
  id: string;
  key: string;
  userId: string;
  userEmail: string;
  type: StandaloneLicenseType;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'SUSPENDED';
  features: string[];
  limits: Record<string, number>;
  activatedAt?: Date;
  expiresAt: Date;
  lastUsed?: Date;
  usageCount: number;
  maxUsage: number;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  assignedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  issuedBy: string;
}

export interface StandaloneUser {
  id: string;
  email: string;
  name: string;
  userType: 'STANDALONE';
  licenses: {
    callsheetPro?: StandaloneLicense;
    edlConverterPro?: StandaloneLicense;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export class StandaloneLicenseService {
  /**
   * Generate a license key for standalone products
   */
  static generateLicenseKey(type: StandaloneLicenseType): string {
    const prefix = type === STANDALONE_LICENSE_TYPES.CALLSHEET_PRO ? 'CSP' : 'EDL';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Create a standalone user with licenses
   */
  static async createStandaloneUser(
    email: string,
    name: string,
    licenseTypes: StandaloneLicenseType[]
  ): Promise<StandaloneUser> {
    const userId = uuidv4();
    const now = new Date();
    
    // Create user document
    const userData: StandaloneUser = {
      id: userId,
      email,
      name,
      userType: 'STANDALONE',
      licenses: {},
      createdAt: now,
      updatedAt: now,
    };

    // Create licenses for each type
    for (const licenseType of licenseTypes) {
      const config = STANDALONE_LICENSE_CONFIGS[licenseType];
      const licenseKey = this.generateLicenseKey(licenseType);
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year from now

      const license: StandaloneLicense = {
        id: uuidv4(),
        key: licenseKey,
        userId,
        userEmail: email,
        type: licenseType,
        status: 'ACTIVE',
        features: config.features,
        limits: config.limits,
        activatedAt: now,
        expiresAt,
        lastUsed: now,
        usageCount: 0,
        maxUsage: -1, // Unlimited
        assignedAt: now,
        createdAt: now,
        updatedAt: now,
        issuedBy: 'system'
      };

      // Store license in licenses collection
      await db.collection('licenses').doc(license.id).set(license);
      
      // Add to user's licenses
      if (licenseType === STANDALONE_LICENSE_TYPES.CALLSHEET_PRO) {
        userData.licenses.callsheetPro = license;
      } else if (licenseType === STANDALONE_LICENSE_TYPES.EDL_CONVERTER_PRO) {
        userData.licenses.edlConverterPro = license;
      }
    }

    // Store user in users collection
    await db.collection('users').doc(userId).set(userData);

    return userData;
  }

  /**
   * Get standalone user by email
   */
  static async getStandaloneUser(email: string): Promise<StandaloneUser | null> {
    const userQuery = db.collection('users')
      .where('email', '==', email)
      .where('userType', '==', 'STANDALONE')
      .limit(1);

    const userSnapshot = await userQuery.get();
    
    if (userSnapshot.empty) {
      return null;
    }

    const userDoc = userSnapshot.docs[0];
    return userDoc.data() as StandaloneUser;
  }

  /**
   * Validate standalone user license
   */
  static async validateStandaloneLicense(
    email: string,
    licenseType: StandaloneLicenseType
  ): Promise<{
    isValid: boolean;
    license?: StandaloneLicense;
    reason?: string;
  }> {
    const user = await this.getStandaloneUser(email);
    
    if (!user) {
      return {
        isValid: false,
        reason: 'User not found'
      };
    }

    const license = user.licenses[licenseType === STANDALONE_LICENSE_TYPES.CALLSHEET_PRO ? 'callsheetPro' : 'edlConverterPro'];
    
    if (!license) {
      return {
        isValid: false,
        reason: 'License not found'
      };
    }

    if (license.status !== 'ACTIVE') {
      return {
        isValid: false,
        reason: `License is ${license.status.toLowerCase()}`
      };
    }

    // Standalone licenses don't expire - skip expiration check
    // if (new Date() > license.expiresAt) {
    //   return {
    //     isValid: false,
    //     reason: 'License has expired'
    //   };
    // }

    return {
      isValid: true,
      license
    };
  }

  /**
   * Update license usage
   */
  static async updateLicenseUsage(
    email: string,
    licenseType: StandaloneLicenseType,
    usageData: {
      action: string;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    const user = await this.getStandaloneUser(email);
    
    if (!user) {
      throw new Error('User not found');
    }

    const licenseKey = licenseType === STANDALONE_LICENSE_TYPES.CALLSHEET_PRO ? 'callsheetPro' : 'edlConverterPro';
    const license = user.licenses[licenseKey];
    
    if (!license) {
      throw new Error('License not found');
    }

    // Update usage count and last used
    const updatedLicense = {
      ...license,
      usageCount: license.usageCount + 1,
      lastUsed: new Date(),
      updatedAt: new Date()
    };

    // Update license in licenses collection
    await db.collection('licenses').doc(license.id).update({
      usageCount: updatedLicense.usageCount,
      lastUsed: updatedLicense.lastUsed,
      updatedAt: updatedLicense.updatedAt
    });

    // Update user's license reference
    user.licenses[licenseKey] = updatedLicense;
    await db.collection('users').doc(user.id).update({
      [`licenses.${licenseKey}`]: updatedLicense,
      updatedAt: new Date()
    });
  }

  /**
   * Get license limits for a user
   */
  static async getLicenseLimits(
    email: string,
    licenseType: StandaloneLicenseType
  ): Promise<Record<string, number> | null> {
    const validation = await this.validateStandaloneLicense(email, licenseType);
    
    if (!validation.isValid || !validation.license) {
      return null;
    }

    return validation.license.limits;
  }

  /**
   * Check if user has access to a specific feature
   */
  static async hasFeatureAccess(
    email: string,
    licenseType: StandaloneLicenseType,
    feature: string
  ): Promise<boolean> {
    const validation = await this.validateStandaloneLicense(email, licenseType);
    
    if (!validation.isValid || !validation.license) {
      return false;
    }

    return validation.license.features.includes(feature);
  }

  /**
   * Deactivate a license
   */
  static async deactivateLicense(
    email: string,
    licenseType: StandaloneLicenseType
  ): Promise<void> {
    const user = await this.getStandaloneUser(email);
    
    if (!user) {
      throw new Error('User not found');
    }

    const licenseKey = licenseType === STANDALONE_LICENSE_TYPES.CALLSHEET_PRO ? 'callsheetPro' : 'edlConverterPro';
    const license = user.licenses[licenseKey];
    
    if (!license) {
      throw new Error('License not found');
    }

    // Update license status
    await db.collection('licenses').doc(license.id).update({
      status: 'INACTIVE',
      updatedAt: new Date()
    });

    // Update user's license reference
    user.licenses[licenseKey] = {
      ...license,
      status: 'INACTIVE',
      updatedAt: new Date()
    };
    
    await db.collection('users').doc(user.id).update({
      [`licenses.${licenseKey}`]: user.licenses[licenseKey],
      updatedAt: new Date()
    });
  }

  /**
   * Get all standalone users
   */
  static async getAllStandaloneUsers(): Promise<StandaloneUser[]> {
    const usersSnapshot = await db.collection('users')
      .where('userType', '==', 'STANDALONE')
      .get();

    return usersSnapshot.docs.map(doc => doc.data() as StandaloneUser);
  }

  /**
   * Get license statistics
   */
  static async getLicenseStatistics(): Promise<{
    totalUsers: number;
    activeLicenses: number;
    callsheetProLicenses: number;
    edlConverterProLicenses: number;
    expiredLicenses: number;
  }> {
    const users = await this.getAllStandaloneUsers();
    const now = new Date();
    
    let activeLicenses = 0;
    let callsheetProLicenses = 0;
    let edlConverterProLicenses = 0;
    let expiredLicenses = 0;

    for (const user of users) {
      if (user.licenses.callsheetPro) {
        callsheetProLicenses++;
        if (user.licenses.callsheetPro.status === 'ACTIVE' && user.licenses.callsheetPro.expiresAt > now) {
          activeLicenses++;
        } else {
          expiredLicenses++;
        }
      }
      
      if (user.licenses.edlConverterPro) {
        edlConverterProLicenses++;
        if (user.licenses.edlConverterPro.status === 'ACTIVE' && user.licenses.edlConverterPro.expiresAt > now) {
          activeLicenses++;
        } else {
          expiredLicenses++;
        }
      }
    }

    return {
      totalUsers: users.length,
      activeLicenses,
      callsheetProLicenses,
      edlConverterProLicenses,
      expiredLicenses
    };
  }
}

export default StandaloneLicenseService;

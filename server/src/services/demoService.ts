import { firestoreService } from './firestoreService.js';
import { logger } from '../utils/logger.js';
import { EmailService } from './emailService.js';
import { ComplianceService } from './complianceService.js';
import { createApiError } from '../middleware/errorHandler.js';
import { getFirestore } from 'firebase-admin/firestore';
import crypto from 'crypto';

// Get Firestore database instance
const db = getFirestore();

// Local type definitions for demo service
export enum DemoStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CONVERTED = 'CONVERTED',
  ABANDONED = 'ABANDONED'
}

export enum DemoConversionSource {
  COUNTDOWN_TIMER = 'COUNTDOWN_TIMER',
  FEATURE_RESTRICTION = 'FEATURE_RESTRICTION',
  UPGRADE_PROMPT = 'UPGRADE_PROMPT',
  EMAIL_CAMPAIGN = 'EMAIL_CAMPAIGN',
  MANUAL = 'MANUAL'
}

export enum SubscriptionTier {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export interface User {
  id: string;
  email: string;
  name?: string;
  isDemoUser?: boolean;
  demoStatus?: DemoStatus;
  demoStartedAt?: Date;
  demoExpiresAt?: Date;
  demoTier?: SubscriptionTier;
  demoFeatureAccess?: any;
  demoConvertedAt?: Date;
  demoConversionSource?: DemoConversionSource;
  demoSessionCount?: number;
  demoLastActivityAt?: Date;
  demoRemindersSent?: number;
  demoAppUsageMinutes?: number;
  demoFeaturesUsed?: string[];
  [key: string]: any; // Allow additional properties
}

export interface DemoSession {
  id: string;
  userId: string;
  sessionId: string;
  startedAt: Date;
  expiresAt: Date;
  status: DemoStatus;
  tier: SubscriptionTier;
  durationMinutes?: number;
  featuresAccessed?: string[];
  restrictionsHit?: string[];
  upgradePromptShown?: number;
  lastActivityAt?: Date;
  conversionAttempts?: number;
  emailRemindersSent?: number;
  deviceInfo?: any;
  ipAddress?: string;
  userAgent?: string;
  referralSource?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoActivity {
  id: string;
  userId: string;
  demoSessionId: string;
  activityType: string;
  featureName?: string;
  restrictionType?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface DemoUserRegistrationData {
  email: string;
  name?: string;
  password?: string;
  ipAddress?: string;
  userAgent?: string;
  referralSource?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
}

export interface DemoSessionInfo {
  sessionId: string;
  userId: string;
  timeRemaining: number;
  status: DemoStatus;
  tier: SubscriptionTier;
  featuresAccessed: string[];
  restrictionsHit: string[];
  canUpgrade: boolean;
}

export interface FeatureAccessResult {
  allowed: boolean;
  restriction?: {
    type: 'FEATURE_LOCKED' | 'TIME_LIMIT' | 'USAGE_LIMIT';
    message: string;
    upgradeRequired: boolean;
  };
}

export class DemoService {
  private static readonly DEMO_TRIAL_DAYS = 7;
  private static readonly DEMO_BASIC_FEATURES = [
    'projects.core',
    'files.basic', 
    'callsheets.basic',
    'timecards.submit',
    'chat.basic',
    'reports.basic',
    'export.basic'
  ];

  /**
   * Register a new demo user with 7-day Basic tier trial
   */
  static async registerDemoUser(data: DemoUserRegistrationData): Promise<{ user: User; demoSession: DemoSession }> {
    try {
      logger.info(`Starting demo user registration for: ${data.email}`);

      // Check if user already exists
      const existingUser = await firestoreService.getUserByEmail(data.email);
      if (existingUser) {
        // If user exists but isn't a demo user, they can't register for demo
        if (!(existingUser as any).isDemoUser) {
          throw createApiError('User already exists with a full account', 409);
        }
        // If existing demo user, check if they can start a new demo session
        const activeDemoSession = await this.getActiveDemoSession(existingUser.id);
        if (activeDemoSession && activeDemoSession.status === 'ACTIVE') {
          throw createApiError('User already has an active demo session', 409);
        }
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + (this.DEMO_TRIAL_DAYS * 24 * 60 * 60 * 1000));
      
      let user: User;
      
      if (existingUser) {
        // Update existing user for new demo session
        await firestoreService.updateUser(existingUser.id, {
          demoStatus: 'ACTIVE',
          demoStartedAt: now,
          demoExpiresAt: expiresAt,
          demoTier: 'BASIC',
          demoSessionCount: ((existingUser as any).demoSessionCount || 0) + 1,
          demoLastActivityAt: now,
          demoFeatureAccess: this.DEMO_BASIC_FEATURES,
          updatedAt: now,
        } as any);
        user = await firestoreService.getUserById(existingUser.id) as User;
      } else {
        // Create new demo user
        const hashedPassword = data.password ? await this.hashPassword(data.password) : null;
        
        const createdUser = await firestoreService.createUser({
          email: data.email,
          name: data.name || '',
          password: hashedPassword || '',
          role: 'USER',
          isDemoUser: true,
          demoStatus: 'ACTIVE',
          demoStartedAt: now,
          demoExpiresAt: expiresAt,
          demoTier: 'BASIC',
          demoSessionCount: 1,
          demoLastActivityAt: now,
          demoFeatureAccess: this.DEMO_BASIC_FEATURES,
          demoAppUsageMinutes: 0,
          demoFeaturesUsed: [],
          demoRemindersSent: 0,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          registrationSource: 'demo_trial',
          isEmailVerified: false,
          twoFactorEnabled: false,
          marketingConsent: false,
          dataProcessingConsent: true,
        } as any);
        user = createdUser as User;
      }

      // Create demo session
      const sessionId = this.generateDemoSessionId();
      const demoSession = await this.createDemoSession({
        userId: user.id,
        sessionId,
        expiresAt,
        tier: 'BASIC',
        deviceInfo: { userAgent: data.userAgent },
        ipAddress: data.ipAddress,
        referralSource: data.referralSource,
        utmSource: data.utmSource,
        utmCampaign: data.utmCampaign,
        utmMedium: data.utmMedium,
      });

      // Log demo registration activity
      await this.logDemoActivity({
        userId: user.id,
        demoSessionId: demoSession.id,
        activityType: 'DEMO_REGISTRATION',
        metadata: {
          source: data.referralSource,
          utm: {
            source: data.utmSource,
            campaign: data.utmCampaign,
            medium: data.utmMedium,
          },
        },
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });

      // Send welcome email
      try {
        await EmailService.sendDemoWelcomeEmail(user, this.DEMO_TRIAL_DAYS);
      } catch (emailError) {
        logger.warn('Failed to send demo welcome email', { userId: user.id, error: emailError });
      }

      // Record compliance events
      await ComplianceService.recordConsent(
        user.id,
        'DEMO_TERMS_OF_SERVICE',
        true,
        '1.0',
        data.ipAddress || '',
        data.userAgent || ''
      );

      logger.info(`Demo user registration completed for: ${user.email}`, { 
        userId: user.id, 
        sessionId: demoSession.sessionId,
        expiresAt: expiresAt.toISOString()
      });

      return { user, demoSession };
    } catch (error) {
      logger.error('Demo user registration failed', { email: data.email, error });
      throw error;
    }
  }

  /**
   * Get current demo session status and countdown information
   */
  static async getDemoStatus(userId: string): Promise<DemoSessionInfo | null> {
    try {
      const user = await firestoreService.getUserById(userId);
      if (!user || !(user as any).isDemoUser) {
        return null;
      }

      const demoSession = await this.getActiveDemoSession(userId);
      if (!demoSession) {
        return null;
      }

      const now = new Date();
      const timeRemaining = Math.max(0, demoSession.expiresAt.getTime() - now.getTime());

      // Update last activity
      await this.updateDemoSessionActivity(demoSession.id);

      return {
        sessionId: demoSession.sessionId,
        userId,
        timeRemaining,
        status: timeRemaining > 0 ? DemoStatus.ACTIVE : DemoStatus.EXPIRED,
        tier: demoSession.tier,
        featuresAccessed: demoSession.featuresAccessed || [],
        restrictionsHit: demoSession.restrictionsHit || [],
        canUpgrade: true,
      };
    } catch (error) {
      logger.error('Failed to get demo status', { userId, error });
      throw error;
    }
  }

  /**
   * Check if user can access a specific feature and enforce restrictions
   */
  static async checkFeatureAccess(userId: string, featureName: string): Promise<FeatureAccessResult> {
    try {
      const user = await firestoreService.getUserById(userId);
      if (!user || !(user as any).isDemoUser) {
        return { allowed: true }; // Non-demo users have full access
      }

      const demoSession = await this.getActiveDemoSession(userId);
      if (!demoSession || demoSession.status !== 'ACTIVE') {
        return {
          allowed: false,
          restriction: {
            type: 'TIME_LIMIT',
            message: 'Your demo trial has expired. Upgrade to continue using this feature.',
            upgradeRequired: true,
          },
        };
      }

      // Check if demo session is expired
      const now = new Date();
      if (now > demoSession.expiresAt) {
        await this.expireDemoSession(demoSession.id);
        return {
          allowed: false,
          restriction: {
            type: 'TIME_LIMIT',
            message: 'Your 14-day demo trial has expired. Upgrade to continue using this feature.',
            upgradeRequired: true,
          },
        };
      }

      // Check if feature is available in demo tier
      const allowedFeatures = (user as any).demoFeatureAccess as string[] || this.DEMO_BASIC_FEATURES;
      if (!allowedFeatures.includes(featureName) && !allowedFeatures.includes('*')) {
        await this.logDemoActivity({
          userId,
          demoSessionId: demoSession.id,
          activityType: 'RESTRICTION_HIT',
          featureName,
          restrictionType: 'FEATURE_LOCKED',
          metadata: { allowedFeatures },
        });

        await this.updateDemoSessionRestriction(demoSession.id, featureName);

        return {
          allowed: false,
          restriction: {
            type: 'FEATURE_LOCKED',
            message: `This feature requires a paid subscription. Your demo includes access to Basic tier features only.`,
            upgradeRequired: true,
          },
        };
      }

      // Log feature access
      await this.logDemoActivity({
        userId,
        demoSessionId: demoSession.id,
        activityType: 'FEATURE_ACCESS',
        featureName,
      });

      await this.updateDemoSessionFeatureAccess(demoSession.id, featureName);

      return { allowed: true };
    } catch (error) {
      logger.error('Failed to check feature access', { userId, featureName, error });
      return { allowed: false };
    }
  }

  /**
   * Convert demo user to paid subscription
   */
  static async convertDemoUser(
    userId: string, 
    subscriptionId: string, 
    conversionSource: DemoConversionSource
  ): Promise<void> {
    try {
      const user = await firestoreService.getUserById(userId);
      if (!user || !(user as any).isDemoUser) {
        throw createApiError('User is not a demo user', 400);
      }

      const demoSession = await this.getActiveDemoSession(userId);
      const now = new Date();

      // Update user to converted status
      await firestoreService.updateUser(userId, {
        isDemoUser: false, // No longer a demo user
        demoStatus: 'CONVERTED',
        demoConvertedAt: now,
        demoConversionSource: conversionSource,
        updatedAt: now,
      } as any);

      // Update demo session if exists
      if (demoSession) {
        await this.updateDemoSession(demoSession.id, {
          status: DemoStatus.CONVERTED,
          conversionAttempts: (demoSession.conversionAttempts || 0) + 1,
        });

        // Log conversion activity
        await this.logDemoActivity({
          userId,
          demoSessionId: demoSession.id,
          activityType: 'CONVERSION_SUCCESS',
          metadata: {
            subscriptionId,
            conversionSource,
            trialDaysUsed: Math.ceil((now.getTime() - demoSession.startedAt.getTime()) / (24 * 60 * 60 * 1000)),
          },
        });
      }

      // Send conversion thank you email
      try {
        await EmailService.sendDemoConversionThankYouEmail(user, subscriptionId);
      } catch (emailError) {
        logger.warn('Failed to send conversion thank you email', { userId, error: emailError });
      }

      logger.info(`Demo user converted successfully`, { 
        userId, 
        subscriptionId, 
        conversionSource,
        sessionId: demoSession?.sessionId 
      });
    } catch (error) {
      logger.error('Failed to convert demo user', { userId, subscriptionId, error });
      throw error;
    }
  }

  /**
   * Send demo reminders and handle expiration
   */
  static async processDemoReminders(): Promise<void> {
    try {
      const now = new Date();
      const reminderThresholds = [
        { days: 7, type: '7_days_left' },
        { days: 3, type: '3_days_left' },
        { days: 1, type: '1_day_left' },
        { hours: 2, type: '2_hours_left' },
      ];

      for (const threshold of reminderThresholds) {
        let targetTime: Date;
        if (threshold.days) {
          targetTime = new Date(now.getTime() + (threshold.days * 24 * 60 * 60 * 1000));
        } else {
          targetTime = new Date(now.getTime() + (threshold.hours! * 60 * 60 * 1000));
        }

        // Find demo sessions expiring at this threshold
        const sessionsNearExpiry = await this.getDemoSessionsNearExpiry(targetTime, threshold.type);
        
        for (const session of sessionsNearExpiry) {
          try {
            const user = await firestoreService.getUserById(session.userId);
            if (user) {
              await EmailService.sendDemoReminderEmail(user, session, threshold.type);
              await this.incrementDemoReminders(session.id);
              await this.logDemoActivity({
                userId: session.userId,
                demoSessionId: session.id,
                activityType: 'REMINDER_SENT',
                metadata: { reminderType: threshold.type },
              });
            }
          } catch (reminderError) {
            logger.warn('Failed to send demo reminder', { sessionId: session.id, error: reminderError });
          }
        }
      }

      // Process expired demo sessions
      await this.processExpiredDemoSessions();
    } catch (error) {
      logger.error('Failed to process demo reminders', { error });
    }
  }

  // Private helper methods
  private static generateDemoSessionId(): string {
    return `demo_${crypto.randomBytes(16).toString('hex')}`;
  }

  private static async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcrypt');
    return bcrypt.hash(password, 12);
  }

  private static async createDemoSession(data: any): Promise<DemoSession> {
    const session = {
      id: crypto.randomUUID(),
      ...data,
      status: 'ACTIVE' as DemoStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.collection('demoSessions').doc(session.id).set(session);
    return session as DemoSession;
  }

  private static async getActiveDemoSession(userId: string): Promise<DemoSession | null> {
    const snapshot = await db
      .collection('demoSessions')
      .where('userId', '==', userId)
      .where('status', '==', 'ACTIVE')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as DemoSession;
  }

  private static async updateDemoSessionActivity(sessionId: string): Promise<void> {
    await db.collection('demoSessions').doc(sessionId).update({
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private static async updateDemoSessionFeatureAccess(sessionId: string, featureName: string): Promise<void> {
    const sessionRef = db.collection('demoSessions').doc(sessionId);
    const session = await sessionRef.get();
    
    if (session.exists) {
      const data = session.data();
      const featuresAccessed = data?.featuresAccessed || [];
      if (!featuresAccessed.includes(featureName)) {
        featuresAccessed.push(featureName);
        await sessionRef.update({
          featuresAccessed,
          updatedAt: new Date(),
        });
      }
    }
  }

  private static async updateDemoSessionRestriction(sessionId: string, restrictionName: string): Promise<void> {
    const sessionRef = db.collection('demoSessions').doc(sessionId);
    const session = await sessionRef.get();
    
    if (session.exists) {
      const data = session.data();
      const restrictionsHit = data?.restrictionsHit || [];
      if (!restrictionsHit.includes(restrictionName)) {
        restrictionsHit.push(restrictionName);
        await sessionRef.update({
          restrictionsHit,
          upgradePromptShown: (data?.upgradePromptShown || 0) + 1,
          updatedAt: new Date(),
        });
      }
    }
  }

  private static async updateDemoSession(sessionId: string, updates: any): Promise<void> {
    await db.collection('demoSessions').doc(sessionId).update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  private static async expireDemoSession(sessionId: string): Promise<void> {
    await this.updateDemoSession(sessionId, { status: 'EXPIRED' });
  }

  private static async logDemoActivity(activity: any): Promise<void> {
    const activityRecord = {
      id: crypto.randomUUID(),
      ...activity,
      timestamp: new Date(),
    };
    
    await db.collection('demoActivities').doc(activityRecord.id).set(activityRecord);
  }

  private static async getDemoSessionsNearExpiry(targetTime: Date, reminderType: string): Promise<DemoSession[]> {
    const buffer = 30 * 60 * 1000; // 30 minute buffer
    const snapshot = await db
      .collection('demoSessions')
      .where('status', '==', 'ACTIVE')
      .where('expiresAt', '>=', new Date(targetTime.getTime() - buffer))
      .where('expiresAt', '<=', new Date(targetTime.getTime() + buffer))
      .get();

    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as DemoSession));
  }

  private static async processExpiredDemoSessions(): Promise<void> {
    const now = new Date();
    const snapshot = await db
      .collection('demoSessions')
      .where('status', '==', 'ACTIVE')
      .where('expiresAt', '<', now)
      .get();

    for (const doc of snapshot.docs) {
      const session = { id: doc.id, ...doc.data() } as DemoSession;
      await this.expireDemoSession(session.id);
      await firestoreService.updateUser(session.userId, {
        demoStatus: 'EXPIRED',
        updatedAt: now,
      } as any);

      await this.logDemoActivity({
        userId: session.userId,
        demoSessionId: session.id,
        activityType: 'DEMO_EXPIRED',
        metadata: { expiredAt: now },
      });
    }
  }

  private static async incrementDemoReminders(sessionId: string): Promise<void> {
    const sessionRef = db.collection('demoSessions').doc(sessionId);
    const session = await sessionRef.get();
    
    if (session.exists) {
      const data = session.data();
      await sessionRef.update({
        emailRemindersSent: (data?.emailRemindersSent || 0) + 1,
        updatedAt: new Date(),
      });
    }
  }
}

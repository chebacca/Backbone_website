import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '../utils/logger.js';
import { LicenseKeyUtil } from '../utils/licenseKey.js';
import { PasswordUtil } from '../utils/password.js';
import { v4 as uuidv4 } from 'uuid';
import { firestoreService } from '../services/firestoreService.js';
import { LicenseService } from '../services/licenseService.js';
import { ComplianceService } from '../services/complianceService.js';
import { EmailService } from '../services/emailService.js';

// Initialize the db connection by importing the service (this ensures firebase is initialized)
import '../services/firestoreService.js';

const db = getFirestore();

// Types
interface SeedUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN' | 'ACCOUNTING';
  emailVerified: boolean;
  isEmailVerified?: boolean;
  twoFactorEnabled: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: Date;
  updatedAt: Date;
}

interface SeedSubscription {
  id: string;
  userId: string;
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  seats: number;
  status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE';
  /**
   * Human-friendly billing cycle used for spacing invoices and term dates
   */
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL' | 'BIENNIAL';
  /**
   * Term length in days, derived from billingCycle
   */
  termDays: number;
  /** Price per seat in USD (for reference/analytics) */
  pricePerSeat: number;
  /** Whether the subscription is set to cancel at period end */
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface SeedPayment {
  id: string;
  userId: string;
  subscriptionId: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  description: string;
  receiptUrl: string;
  billingAddressSnapshot: any;
  taxAmount: number;
  taxRate: number;
  taxJurisdiction: string;
  paymentMethod: string;
  complianceData: any;
  amlScreeningStatus: 'PENDING' | 'PASSED' | 'FAILED' | 'REQUIRES_REVIEW';
  amlScreeningDate: Date;
  amlRiskScore: number;
  pciCompliant: boolean;
  ipAddress: string;
  userAgent: string;
  processingLocation: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SeedLicense {
  id: string;
  userId: string;
  subscriptionId: string;
  key: string;
  tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  activatedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

class DatabaseSeeder {
  private static users: SeedUser[] = [];
  private static subscriptions: SeedSubscription[] = [];
  private static payments: SeedPayment[] = [];
  private static licenses: SeedLicense[] = [];

  /**
   * Promote a subset of users who own ENTERPRISE subscriptions to ADMIN role so they
   * can administer licenses for their teams. SUPERADMIN users are not modified.
   * Returns the number of users promoted.
   */
  private static assignAdminsToEnterpriseUsers(
    users: SeedUser[],
    subscriptions: SeedSubscription[],
    targetFraction: number = 0.35,
  ): number {
    const enterpriseUserIds = new Set(
      subscriptions
        .filter((s) => s.tier === 'ENTERPRISE')
        .map((s) => s.userId)
    );

    const candidateUsers = users.filter(
      (u) => enterpriseUserIds.has(u.id) && u.role !== 'SUPERADMIN'
    );

    let promotedCount = 0;
    for (const user of candidateUsers) {
      if (Math.random() < targetFraction) {
        user.role = 'ADMIN';
        promotedCount += 1;
      }
    }

    // Ensure at least one enterprise admin exists when there are enterprise users
    if (promotedCount === 0 && candidateUsers.length > 0) {
      candidateUsers[0].role = 'ADMIN';
      promotedCount = 1;
    }

    return promotedCount;
  }

  /**
   * Generate sample users
   */
  private static async generateUsers(): Promise<SeedUser[]> {
    const users: SeedUser[] = [];
    const now = new Date();

    // Admin user (requested)
    users.push({
      id: 'admin-user-001',
      email: 'chebacca@gmail.com',
      name: 'System Administrator',
      password: await PasswordUtil.hash('admin1234'),
      role: 'SUPERADMIN',
      emailVerified: true,
      isEmailVerified: true,
      twoFactorEnabled: false,
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    });

    // Accounting user
    users.push({
      id: 'accounting-user-001',
      email: 'accounting@example.com',
      name: 'Accounting User',
      password: await PasswordUtil.hash('Account123!'),
      role: 'ACCOUNTING',
      emailVerified: true,
      isEmailVerified: true,
      twoFactorEnabled: false,
      status: 'ACTIVE',
      createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    });

    // Generate 50 unique users with varied security requirements
    const firstNames = ['John','Sarah','Mike','Emily','David','Lisa','Alex','Nicole','Robert','Maria','James','Olivia','Daniel','Sophia','Matthew','Ava','Ethan','Isabella','Andrew','Mia','Joseph','Amelia','Benjamin','Charlotte','Henry','Harper','Samuel','Evelyn','Lucas','Abigail','Christopher','Ella','Joshua','Elizabeth','Nathan','Sofia','Ryan','Madison','Noah','Avery'];
    const lastNames = ['Doe','Wilson','Johnson','Chen','Brown','Garcia','Turner','White','Lee','Rodriguez','Miller','Davis','Martinez','Taylor','Anderson','Thomas','Hernandez','Moore','Martin','Jackson'];
    const domains = ['techcorp.com','startup.io','enterprise.com','design.co','consulting.com','media.net','finance.org','health.care','logistics.com','education.edu'];

    // Generate 48 regular users so total users (including admin + accounting) is exactly 50
    for (let i = 0; i < 48; i++) {
      const first = firstNames[i % firstNames.length];
      const last = lastNames[i % lastNames.length];
      const domain = domains[i % domains.length];
      const email = `${first.toLowerCase()}.${last.toLowerCase()}${String(i + 1).padStart(2,'0')}@${domain}`;
      const createdDaysAgo = Math.floor(Math.random() * 120) + 1; // 1-120 days ago

      users.push({
        id: uuidv4(),
        email,
        name: `${first} ${last}`,
        password: await PasswordUtil.hash('User123!'),
        role: 'USER',
        emailVerified: Math.random() > 0.1, // 90% verified
        isEmailVerified: Math.random() > 0.1,
        twoFactorEnabled: Math.random() > 0.6, // 40% 2FA
        status: Math.random() > 0.97 ? 'SUSPENDED' : 'ACTIVE',
        createdAt: new Date(now.getTime() - createdDaysAgo * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - Math.floor(Math.random() * createdDaysAgo) * 24 * 60 * 60 * 1000),
      });
    }

    return users;
  }

  /**
   * Generate subscriptions for users
   */
  private static generateSubscriptions(users: SeedUser[]): SeedSubscription[] {
    const subscriptions: SeedSubscription[] = [];
    const tiers: Array<'BASIC' | 'PRO' | 'ENTERPRISE'> = ['BASIC', 'PRO', 'ENTERPRISE'];
    const cycles: Array<SeedSubscription['billingCycle']> = ['MONTHLY','QUARTERLY','SEMI_ANNUAL','ANNUAL','BIENNIAL'];

    const termDaysByCycle: Record<SeedSubscription['billingCycle'], number> = {
      MONTHLY: 30,
      QUARTERLY: 90,
      SEMI_ANNUAL: 182,
      ANNUAL: 365,
      BIENNIAL: 730,
    };

    // Only non-SUPERADMIN users should receive subscriptions (and thus licenses)
    const targetUsers = users.filter(u => u.role !== 'SUPERADMIN');

    targetUsers.forEach((user, index) => {
      // Even distribution across tiers by index
      const tier = tiers[index % tiers.length];
      const cycle = cycles[index % cycles.length];
      const termDays = termDaysByCycle[cycle];

      let seats = 1;
      if (tier === 'PRO') {
        seats = Math.floor(Math.random() * 20) + 1; // 1-20 seats
      } else if (tier === 'ENTERPRISE') {
        seats = Math.floor(Math.random() * 100) + 10; // 10-110 seats
      }

      const pricePerSeat = tier === 'BASIC' ? 15 : tier === 'PRO' ? 29 : 99;

      const createdAt = new Date(user.createdAt.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);
      const offsetDays = Math.floor(Math.random() * termDays);
      const currentPeriodStart = new Date(createdAt.getTime() + offsetDays * 24 * 60 * 60 * 1000);
      const currentPeriodEnd = new Date(currentPeriodStart.getTime() + termDays * 24 * 60 * 60 * 1000);

      // Status variety with some cancelled/past due
      const status: SeedSubscription['status'] = Math.random() > 0.9
        ? 'PAST_DUE'
        : (Math.random() > 0.92 ? 'CANCELLED' : 'ACTIVE');

      subscriptions.push({
        id: `sub-${uuidv4()}`,
        userId: user.id,
        tier,
        seats,
        status,
        billingCycle: cycle,
        termDays,
        pricePerSeat,
        cancelAtPeriodEnd: Math.random() > 0.85,
        currentPeriodStart,
        currentPeriodEnd,
        createdAt,
        updatedAt: new Date(currentPeriodStart.getTime() + Math.floor(Math.random() * Math.max(1, termDays - 1)) * 24 * 60 * 60 * 1000),
      });
    });

    return subscriptions;
  }

  /**
   * Generate invoice numbers
   */
  private static generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `INV-${timestamp}-${random}`;
  }

  /**
   * Get pricing by tier
   */
  private static getPricingByTier(tier: 'BASIC' | 'PRO' | 'ENTERPRISE'): { unitPrice: number; description: string } {
    switch (tier) {
      case 'BASIC':
        return { unitPrice: 15, description: 'Dashboard v14 Basic License' };
      case 'PRO':
        return { unitPrice: 29, description: 'Dashboard v14 Pro License' };
      case 'ENTERPRISE':
        return { unitPrice: 99, description: 'Dashboard v14 Enterprise License' };
    }
  }

  /**
   * Generate billing addresses
   */
  private static generateBillingAddress(userEmail: string): any {
    const companies = [
      { name: 'TechCorp Inc.', city: 'San Francisco', state: 'CA', zip: '94105' },
      { name: 'Startup Labs', city: 'Austin', state: 'TX', zip: '73301' },
      { name: 'Enterprise Solutions', city: 'New York', state: 'NY', zip: '10001' },
      { name: 'Design Studio', city: 'Los Angeles', state: 'CA', zip: '90210' },
      { name: 'Business Consulting', city: 'Chicago', state: 'IL', zip: '60601' },
      { name: 'Digital Media', city: 'Seattle', state: 'WA', zip: '98101' },
      { name: 'Finance Corp', city: 'Boston', state: 'MA', zip: '02101' },
      { name: 'HealthCare Plus', city: 'Miami', state: 'FL', zip: '33101' },
      { name: 'Global Logistics', city: 'Denver', state: 'CO', zip: '80201' },
      { name: 'Education First', city: 'Portland', state: 'OR', zip: '97201' },
    ];

    const company = companies[Math.floor(Math.random() * companies.length)];
    const [firstName, lastName] = userEmail.split('@')[0].split('.').map(name => 
      name.charAt(0).toUpperCase() + name.slice(1)
    );

    return {
      firstName: firstName || 'John',
      lastName: lastName || 'Doe',
      company: company.name,
      addressLine1: `${Math.floor(Math.random() * 9999) + 1} Business Street`,
      addressLine2: `Suite ${Math.floor(Math.random() * 999) + 100}`,
      city: company.city,
      state: company.state,
      postalCode: company.zip,
      country: 'US',
    };
  }

  /**
   * Generate payments with invoice data
   */
  private static generatePayments(users: SeedUser[], subscriptions: SeedSubscription[]): SeedPayment[] {
    const payments: SeedPayment[] = [];
    const now = new Date();
    const paymentMethods = ['credit_card', 'debit_card', 'bank_transfer'];
    const statuses: Array<'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED' | 'REFUNDED'> = ['SUCCEEDED', 'SUCCEEDED', 'SUCCEEDED', 'PENDING', 'FAILED'];

    for (const subscription of subscriptions) {
      const user = users.find(u => u.id === subscription.userId)!;
      const { unitPrice, description } = this.getPricingByTier(subscription.tier);
      
      // Generate 2-5 payments per subscription (historical payments)
      const paymentCount = Math.floor(Math.random() * 4) + 2;
      
      for (let i = 0; i < paymentCount; i++) {
        const subtotal = unitPrice * subscription.seats;
        const taxRate = 0.08; // 8% tax
        const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
        const total = subtotal + taxAmount;
        
        const termDays = subscription.termDays || 30;
        const paymentDate = new Date(subscription.createdAt.getTime() + i * termDays * 24 * 60 * 60 * 1000);
        const invoiceNumber = this.generateInvoiceNumber();
        const billingAddress = this.generateBillingAddress(user.email);
        
        const status = i === paymentCount - 1 ? statuses[Math.floor(Math.random() * statuses.length)] : 'SUCCEEDED';
        
        payments.push({
          id: `payment-${subscription.id}-${String(i + 1).padStart(2, '0')}`,
          userId: user.id,
          subscriptionId: subscription.id,
          stripeInvoiceId: invoiceNumber,
          amount: Math.round(total * 100), // Store in cents
          currency: 'usd',
          status,
          description: `${description} - ${subscription.seats} seat(s)`,
          receiptUrl: `https://dashboard-v14.com/receipts/${invoiceNumber}`,
          billingAddressSnapshot: billingAddress,
          taxAmount: Math.round(taxAmount * 100), // Store in cents
          taxRate,
          taxJurisdiction: 'US',
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          complianceData: {
            invoiceNumber,
            issuedDate: paymentDate.toISOString(),
            dueDate: new Date(paymentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            items: [{
              description,
              quantity: subscription.seats,
              unitPrice,
              total: subtotal,
              taxRate,
              taxAmount,
            }],
            subtotal,
            taxTotal: taxAmount,
            total,
            currency: 'USD',
          },
          amlScreeningStatus: Math.random() > 0.95 ? 'REQUIRES_REVIEW' : 'PASSED', // 5% require review
          amlScreeningDate: paymentDate,
          amlRiskScore: Math.random() * 0.5, // Low risk scores
          pciCompliant: true,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          userAgent: 'Mozilla/5.0 (compatible; Dashboard-v14-Client/1.0)',
          processingLocation: 'US',
          createdAt: paymentDate,
          updatedAt: new Date(paymentDate.getTime() + Math.floor(Math.random() * 24) * 60 * 60 * 1000),
        });
      }
    }

    return payments;
  }

  /**
   * Generate licenses
   */
  private static generateLicenses(users: SeedUser[], subscriptions: SeedSubscription[]): SeedLicense[] {
    const licenses: SeedLicense[] = [];
    const now = new Date();

    for (const subscription of subscriptions) {
      // Generate licenses for each seat
      for (let i = 0; i < subscription.seats; i++) {
        const licenseKey = LicenseKeyUtil.generateLicenseKey();
        const isExpired = Math.random() > 0.9; // 10% expired
        const isSuspended = Math.random() > 0.95; // 5% suspended
        
        let status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' = 'ACTIVE';
        if (isSuspended) status = 'SUSPENDED';
        else if (isExpired) status = 'EXPIRED';

        const activatedAt = new Date(subscription.createdAt.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);
        const expiresAt = new Date(activatedAt.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

        licenses.push({
          id: `license-${subscription.id}-${String(i + 1).padStart(3, '0')}`,
          userId: subscription.userId,
          subscriptionId: subscription.id,
          key: licenseKey,
          tier: subscription.tier,
          status,
          activatedAt,
          expiresAt,
          createdAt: activatedAt,
          updatedAt: new Date(activatedAt.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        });
      }
    }

    return licenses;
  }

  /**
   * Seed all data
   */
  public static async seedDatabase(): Promise<void> {
    try {
      logger.info('🌱 Starting database seeding...');
      
      // Temporarily disable early return to force payment creation
      // const existingUsers = await db.collection('users').limit(1).get();
      // if (!existingUsers.empty) {
      //   logger.info('Database already contains data. Skipping seeding.');
      //   return;
      // }

      // Generate data
      logger.info('Generating sample data...');
      this.users = await this.generateUsers();
      this.subscriptions = this.generateSubscriptions(this.users);
      const promotedAdmins = this.assignAdminsToEnterpriseUsers(this.users, this.subscriptions);
      this.payments = this.generatePayments(this.users, this.subscriptions);
      this.licenses = this.generateLicenses(this.users, this.subscriptions);

      logger.info(`Generated: ${this.users.length} users, ${this.subscriptions.length} subscriptions, ${this.payments.length} payments, ${this.licenses.length} licenses`);
      logger.info(`Assigned ADMIN role to ${promotedAdmins} ENTERPRISE subscription owner(s)`);

      // Seed users
      logger.info('Seeding users...');
    // Commit users in chunks to respect Firestore batch limits
    {
      const chunkSize = 450;
      let batch = db.batch();
      let count = 0;
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        const userRef = db.collection('users').doc(user.id);
        batch.set(userRef, user);
        count++;
        if (count === chunkSize || i === this.users.length - 1) {
          await batch.commit();
          batch = db.batch();
          count = 0;
        }
      }
    }

      // Seed subscriptions
      logger.info('Seeding subscriptions...');
    // Commit subscriptions in chunks
    {
      const chunkSize = 450;
      let batch = db.batch();
      let count = 0;
      for (let i = 0; i < this.subscriptions.length; i++) {
        const subscription = this.subscriptions[i];
        const subscriptionRef = db.collection('subscriptions').doc(subscription.id);
        batch.set(subscriptionRef, subscription);
        count++;
        if (count === chunkSize || i === this.subscriptions.length - 1) {
          await batch.commit();
          batch = db.batch();
          count = 0;
        }
      }
    }

      // Seed payments (with invoice data)
      logger.info('Seeding payments with invoice data...');
    // Commit payments in chunks
    {
      const chunkSize = 450;
      let batch = db.batch();
      let count = 0;
      for (let i = 0; i < this.payments.length; i++) {
        const payment = this.payments[i];
        const paymentRef = db.collection('payments').doc(payment.id);
        batch.set(paymentRef, payment);
        count++;
        if (count === chunkSize || i === this.payments.length - 1) {
          await batch.commit();
          batch = db.batch();
          count = 0;
        }
      }
    }

      // Seed licenses
      logger.info('Seeding licenses...');
    // Commit licenses in chunks (can be large)
    {
      const chunkSize = 450;
      let batch = db.batch();
      let count = 0;
      for (let i = 0; i < this.licenses.length; i++) {
        const license = this.licenses[i];
        const licenseRef = db.collection('licenses').doc(license.id);
        batch.set(licenseRef, license);
        count++;
        if (count === chunkSize || i === this.licenses.length - 1) {
          await batch.commit();
          batch = db.batch();
          count = 0;
        }
      }
    }

      logger.info('✅ Database seeding completed successfully!');
      logger.info(`Created:
        - ${this.users.length} users
        - ${this.subscriptions.length} subscriptions  
        - ${this.payments.length} payments with invoices
        - ${this.licenses.length} licenses`);

    } catch (error) {
      logger.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  /**
   * Minimal seed: 6 users only
   * - SUPERADMIN: chebacca@gmail.com (ensure exists)
   * - SUPERADMIN: Chris Mole (chrismole@gmail.com)
   * - ACCOUNTING: accounting@example.com
   * - BASIC tier user
   * - PRO tier user
   * - ENTERPRISE tier user
   * Each user gets default template projects: Production, Accounting, Admin
   */
  public static async seedMinimal(): Promise<void> {
    logger.info('🌱 Seeding minimal dataset (6 users)...');
    const now = new Date();

    const ensureUser = async (email: string, name: string, role: 'USER' | 'ADMIN' | 'SUPERADMIN' | 'ACCOUNTING', customPassword?: string): Promise<string> => {
      const existing = await firestoreService.getUserByEmail(email);
      if (existing) {
        const updates: any = { role, isEmailVerified: true };
        // Update password if custom password is provided
        if (customPassword) {
          updates.password = await PasswordUtil.hash(customPassword);
        }
        await firestoreService.updateUser(existing.id, updates);
        return existing.id;
      }
      const password = customPassword || 'ChangeMe123!';
      const user = await firestoreService.createUser({
        email,
        password: await PasswordUtil.hash(password),
        name,
        role,
        isEmailVerified: true,
        twoFactorEnabled: false,
        twoFactorBackupCodes: [],
        privacyConsent: [],
        marketingConsent: false,
        dataProcessingConsent: false,
        termsAcceptedAt: now,
        termsVersionAccepted: 'v1',
        privacyPolicyAcceptedAt: now,
        privacyPolicyVersionAccepted: 'v1',
        identityVerified: false,
        kycStatus: 'PENDING',
      } as any);
      return user.id;
    };

    const ensureDemoUser = async (email: string, name: string, customPassword?: string): Promise<string> => {
      const existing = await firestoreService.getUserByEmail(email);
      const demoExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const base: any = {
        isEmailVerified: true,
        twoFactorEnabled: false,
        twoFactorBackupCodes: [],
        privacyConsent: [],
        marketingConsent: false,
        dataProcessingConsent: false,
        termsAcceptedAt: now,
        termsVersionAccepted: 'v1',
        privacyPolicyAcceptedAt: now,
        privacyPolicyVersionAccepted: 'v1',
        identityVerified: false,
        kycStatus: 'PENDING',
        // Demo flags
        isDemoUser: true,
        demoStatus: 'ACTIVE',
        demoStartedAt: now,
        demoExpiresAt,
        demoTier: 'BASIC',
        demoFeatureAccess: {
          features: ['projects', 'chat', 'comments'],
          limitations: {
            maxProjects: 3,
            maxFileSize: 50,
            maxStorageSize: 512,
            canExport: false,
            canShare: true,
          },
        },
      };

      if (existing) {
        await firestoreService.updateUser(existing.id, {
          name,
          role: 'USER',
          ...base,
          ...(customPassword ? { password: await PasswordUtil.hash(customPassword) } : {}),
        } as any);
        return existing.id;
      }

      const password = customPassword || 'ChangeMe123!';
      const user = await firestoreService.createUser({
        email,
        password: await PasswordUtil.hash(password),
        name,
        role: 'USER',
        ...base,
      } as any);
      return user.id;
    };

    const createDefaultProjects = async (userId: string, organizationId?: string | null): Promise<void> => {
      const defaults = [
        { name: 'Production', description: 'Primary production project' },
        { name: 'Accounting', description: 'Financial and accounting project' },
        { name: 'Admin', description: 'Administrative project' },
      ];
      for (const d of defaults) {
        try {
          await firestoreService.createProject({
            ownerId: userId,
            name: d.name,
            description: d.description,
            type: 'networked',
            applicationMode: 'shared_network',
            visibility: organizationId ? 'organization' : 'private',
            organizationId: organizationId || null,
            storageBackend: 'firestore',
            allowCollaboration: Boolean(organizationId),
            maxCollaborators: organizationId ? 25 : 10,
            realTimeEnabled: true,
          });
        } catch {}
      }
    };

    // Ensure users (exactly the requested 6)
    // Assumption: set a known strong password for the master admin account
    const superadmin1Id = await ensureUser('chebacca@gmail.com', 'System Administrator', 'SUPERADMIN', 'AdminMaster123!');
    const accountingId = await ensureUser('accounting@example.com', 'Accounting User', 'ACCOUNTING');
    const basicUserId = await ensureUser('basic.user@example.com', 'Basic User', 'USER');
    const proUserId = await ensureUser('pro.user@example.com', 'Pro User', 'USER');
    const enterpriseUserId = await ensureUser('enterprise.user@example.com', 'Enterprise User', 'USER', 'Admin1234!');
    const demoUserId = await ensureDemoUser('demo.user@example.com', 'Demo User');

    // Record legal consents for created users (mimic registration flow)
    const consentVersion = 'v1';
    const stubReq = { ip: '127.0.0.1', userAgent: 'Seeder/1.0' };
    for (const uid of [superadmin1Id, accountingId, basicUserId, proUserId, enterpriseUserId, demoUserId]) {
      try {
        await ComplianceService.recordConsent(uid, 'TERMS_OF_SERVICE', true, consentVersion, stubReq.ip, stubReq.userAgent);
        await ComplianceService.recordConsent(uid, 'PRIVACY_POLICY', true, consentVersion, stubReq.ip, stubReq.userAgent);
      } catch {}
    }

    // Create organizations for Pro and Enterprise (team-capable) and set owner membership
    const proOrg = await firestoreService.createOrganization({ name: 'Pro User Org', ownerUserId: proUserId, tier: 'PRO' } as any);
    await firestoreService.createOrgMember({ orgId: proOrg.id, email: 'pro.user@example.com', userId: proUserId, role: 'OWNER', status: 'ACTIVE', seatReserved: true, invitedAt: now, joinedAt: now } as any);
    const entOrg = await firestoreService.createOrganization({ name: 'Enterprise User Org', ownerUserId: enterpriseUserId, tier: 'ENTERPRISE' } as any);
    await firestoreService.createOrgMember({ orgId: entOrg.id, email: 'enterprise.user@example.com', userId: enterpriseUserId, role: 'OWNER', status: 'ACTIVE', seatReserved: true, invitedAt: now, joinedAt: now } as any);

    // Create subscriptions for tiered users only
    const pricePerSeat: Record<'BASIC' | 'PRO' | 'ENTERPRISE', number> = { BASIC: 2900, PRO: 9900, ENTERPRISE: 19900 };
    const mkSub = async (userId: string, tier: 'BASIC' | 'PRO' | 'ENTERPRISE', seats: number, organizationId?: string | null) => {
      const subData: any = {
        userId,
        tier,
        status: 'ACTIVE',
        seats,
        pricePerSeat: pricePerSeat[tier],
        cancelAtPeriodEnd: false,
        currentPeriodStart: now,
        currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      };
      if (organizationId) subData.organizationId = organizationId;
      const sub = await firestoreService.createSubscription(subData);

      // Minimal billing address similar to real flow
      const billingAddress = this.generateBillingAddress(`seed+${userId}@example.com`);
      try {
        const validation = await ComplianceService.validateBillingAddress(billingAddress);
        if (validation.valid) {
          await firestoreService.updateUser(userId, {
            billingAddress: { ...billingAddress, validated: true, validatedAt: now, validationSource: 'seed' },
          } as any);
        }
      } catch {}

      // Generate initial licenses (mirror BASIC immediate issuance; still generate for higher tiers for rich data)
      const licenses = await LicenseService.generateLicenses(userId, sub.id, tier as any, seats, 'ACTIVE' as any, 12, organizationId || undefined);

      // Generate a first payment (receipt + billing snapshot)
      const payment = await firestoreService.createPayment({
        userId,
        subscriptionId: sub.id,
        stripePaymentIntentId: `pi_seed_${sub.id}`,
        stripeInvoiceId: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        amount: pricePerSeat[tier] * seats,
        currency: 'usd',
        status: 'SUCCEEDED',
        description: `${tier} subscription - ${seats} seats`,
        receiptUrl: 'https://example.com/receipt',
        billingAddressSnapshot: billingAddress,
        taxAmount: Math.round(pricePerSeat[tier] * seats * 0.08),
        taxRate: 0.08,
        taxJurisdiction: billingAddress.state ? `${billingAddress.state}, US` : 'US',
        paymentMethod: 'credit_card',
        complianceData: { invoiceNumber: `INV-${Date.now()}`, userType: 'individual', subscriptionTier: tier, seats },
        amlScreeningStatus: 'PENDING',
        amlScreeningDate: now,
        amlRiskScore: 0,
        pciCompliant: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Seeder/1.0',
        processingLocation: 'US',
      } as any);

      // Perform AML screening akin to live flow
      try {
        await ComplianceService.performAMLScreening(payment.id, { userId, amount: payment.amount, country: billingAddress.country || 'US' });
      } catch {}

      // Create audit logs similar to live flow
      try {
        await ComplianceService.createAuditLog(userId, 'SUBSCRIPTION_CREATE', `Created ${tier} subscription with ${seats} seats`, { subscriptionId: sub.id, amount: payment.amount, tier, seats }, stubReq);
        await ComplianceService.createAuditLog(userId, 'PAYMENT_PROCESS', `Payment succeeded for subscription ${sub.id}`, { paymentId: payment.id, amount: payment.amount, licenseCount: licenses.length }, stubReq);
      } catch {}

      // Create license delivery logs and attempt sending delivery email (no-op if email disabled)
      try {
        for (const lic of licenses) {
          await firestoreService.createLicenseDeliveryLog({
            licenseId: lic.id,
            paymentId: payment.id,
            deliveryMethod: 'EMAIL',
            emailAddress: (await firestoreService.getUserById(userId))?.email,
            deliveryStatus: 'PENDING',
          } as any);
        }
        const user = await firestoreService.getUserById(userId);
        if (user) {
          await EmailService.sendLicenseDeliveryEmail(user as any, licenses as any, sub as any, payment as any);
        }
      } catch {}
      return sub.id;
    };

    await mkSub(basicUserId, 'BASIC', 1, null);
    await mkSub(proUserId, 'PRO', 10, proOrg.id); // Minimum 10 seats for Pro
    await mkSub(enterpriseUserId, 'ENTERPRISE', 50, entOrg.id); // Minimum 50 seats for Enterprise

    // Create default template projects for all users (org-scoped for Pro/Enterprise)
    await Promise.all([
      createDefaultProjects(superadmin1Id, null),
      createDefaultProjects(accountingId, null),
      createDefaultProjects(basicUserId, null),
      createDefaultProjects(proUserId, proOrg.id),
      createDefaultProjects(enterpriseUserId, entOrg.id),
      createDefaultProjects(demoUserId, null),
    ]);

    logger.info('✅ Minimal dataset seeded successfully');
  }

  /**
   * Clear all seeded data
   */
  public static async clearDatabase(): Promise<void> {
    try {
      logger.info('🧹 Clearing database...');
      // Helper to delete a top-level collection in batches
      const deleteCollection = async (path: string) => {
        const batchSize = 500;
        let deleted = 0;
        while (true) {
          const snap = await db.collection(path).limit(batchSize).get();
          if (snap.empty) break;
          const batch = db.batch();
          snap.docs.forEach((d) => batch.delete(d.ref));
          await batch.commit();
          deleted += snap.size;
          // small delay to avoid overwhelming Firestore
          await new Promise((r) => setTimeout(r, 50));
        }
        if (deleted > 0) logger.info(`Cleared ${deleted} documents from ${path}`);
      };

      // Helper to delete a subcollection path in batches
      const deleteSubcollection = async (path: string) => {
        const batchSize = 500;
        let deleted = 0;
        while (true) {
          const snap = await db.collection(path).limit(batchSize).get();
          if (snap.empty) break;
          const batch = db.batch();
          snap.docs.forEach((d) => batch.delete(d.ref));
          await batch.commit();
          deleted += snap.size;
          await new Promise((r) => setTimeout(r, 50));
        }
        if (deleted > 0) logger.info(`Cleared ${deleted} documents from ${path}`);
      };

      // Gather known org IDs from organizations and tenant_mappings
      const orgIds = new Set<string>();
      try {
        const orgSnap = await db.collection('organizations').get();
        orgSnap.docs.forEach((d) => orgIds.add(d.id));
      } catch {}
      try {
        const tenantSnap = await db.collection('tenant_mappings').get();
        tenantSnap.docs.forEach((d) => orgIds.add((d.data() as any).orgId || d.id));
      } catch {}

      // Delete tenant subcollections for each org
      for (const orgId of orgIds) {
        await deleteSubcollection(`tenants/${orgId}/projects`);
        await deleteSubcollection(`tenants/${orgId}/project_participants`);
      }

      // Now delete top-level collections
      const collections = [
        'users',
        'subscriptions',
        'payments',
        'licenses',
        'audit_logs',
        'organizations',
        'org_members',
        'org_invitations',
        'license_delivery_logs',
        'webhook_events',
        'compliance_events',
        'usage_analytics',
        'privacy_consents',
        'email_logs',
        'tenant_mappings',
        'system_settings',
      ];

      for (const collectionName of collections) {
        await deleteCollection(collectionName);
      }

      logger.info('✅ Database cleared successfully!');
    } catch (error) {
      logger.error('❌ Database clearing failed:', error);
      throw error;
    }
  }
}

export default DatabaseSeeder;

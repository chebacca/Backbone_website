import { prisma } from '../utils/prisma.js';
import { PasswordUtil } from '../utils/password.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { LicenseService } from '../services/licenseService.js';
import { SubscriptionTier, LicenseStatus, SubscriptionStatus } from '@prisma/client';
import { InvoiceSeeder } from './invoiceSeeder.js';

async function main(): Promise<void> {
  // Create Che Bacca as SUPERADMIN
  const superAdminEmail = 'chebacca@gmail.com';
  const superAdminPassword = 'admin1234';
  const superAdminName = 'Che Bacca';

  const hashedSuperAdminPassword = await PasswordUtil.hash(superAdminPassword);

  const existingSuperAdmin = await prisma.user.findUnique({ where: { email: superAdminEmail } });

  if (existingSuperAdmin) {
    await prisma.user.update({
      where: { email: superAdminEmail },
      data: {
        name: superAdminName,
        password: hashedSuperAdminPassword,
        role: 'SUPERADMIN',
        isEmailVerified: true,
      },
    });
    logger.info('SuperAdmin user updated', { email: superAdminEmail, role: 'SUPERADMIN' });
  } else {
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: superAdminName,
        password: hashedSuperAdminPassword,
        role: 'SUPERADMIN',
        isEmailVerified: true,
        termsAcceptedAt: new Date(),
        privacyPolicyAcceptedAt: new Date(),
        registrationSource: 'seed',
      },
    });
    logger.info('SuperAdmin user created', { email: superAdminEmail, role: 'SUPERADMIN' });
  }

  // Remove existing admin users
  const usersToRemove = [
    'admin@dashboardv14.com'
  ];

  for (const email of usersToRemove) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await prisma.user.delete({ where: { email } });
      logger.info('Removed existing admin user', { email });
    }
  }

  // ---------------------------------------------------------------------------
  // Create test client users with subscriptions and mock licenses/analytics
  // ---------------------------------------------------------------------------
  const now = new Date();
  const oneMonthFromNow = new Date(now.getTime());
  oneMonthFromNow.setMonth(now.getMonth() + 1);

  type TestUserSpec = {
    email: string;
    name: string;
    password: string;
    tier: SubscriptionTier;
    seats: number;
    role?: 'USER' | 'ENTERPRISE_ADMIN';
  };

  const testUsers: TestUserSpec[] = [
    {
      email: 'alice.client@example.com',
      name: 'Alice Client',
      password: 'Client#1Pass!',
      tier: 'BASIC',
      seats: 1,
      role: 'USER',
    },
    {
      email: 'bob.client@example.com',
      name: 'Bob Client',
      password: 'Client#2Pass!',
      tier: 'PRO',
      seats: 3,
      role: 'USER',
    },
    {
      email: 'carol.client@example.com',
      name: 'Carol Client',
      password: 'Client#3Pass!',
      tier: 'ENTERPRISE',
      seats: 5,
      role: 'ENTERPRISE_ADMIN',
    },
    {
      email: 'dave.client@example.com',
      name: 'Dave Client',
      password: 'Client#4Pass!',
      tier: 'PRO',
      seats: 2,
      role: 'USER',
    },
    {
      email: 'eve.client@example.com',
      name: 'Eve Client',
      password: 'Client#5Pass!',
      tier: 'BASIC',
      seats: 1,
      role: 'USER',
    },
    {
      email: 'chrismole@gmail.com',
      name: 'Chris Mole',
      password: 'admin1234',
      tier: 'PRO',
      seats: 3, // 2 individual + 1 bulk license
      role: 'USER',
    },
  ];

  const priceByTier: Record<SubscriptionTier, number> = {
    BASIC: 15,
    PRO: 29,
    ENTERPRISE: 99,
  } as const;

  for (const u of testUsers) {
    const existingUser = await prisma.user.findUnique({ where: { email: u.email } });
    const hashed = await PasswordUtil.hash(u.password);

    const userRecord = existingUser
      ? await prisma.user.update({
          where: { email: u.email },
          data: {
            name: u.name,
            password: hashed,
            role: (u.role ?? 'USER') as any,
            isEmailVerified: true,
            termsAcceptedAt: new Date(),
            privacyPolicyAcceptedAt: new Date(),
            registrationSource: 'seed',
          },
        })
      : await prisma.user.create({
          data: {
            email: u.email,
            name: u.name,
            password: hashed,
            role: (u.role ?? 'USER') as any,
            isEmailVerified: true,
            termsAcceptedAt: new Date(),
            privacyPolicyAcceptedAt: new Date(),
            registrationSource: 'seed',
          },
        });

    // Ensure one active subscription per user
    const subscription = await prisma.subscription.create({
      data: {
        userId: userRecord.id,
        tier: u.tier,
        status: 'ACTIVE',
        seats: u.seats,
        pricePerSeat: priceByTier[u.tier],
        currentPeriodStart: now,
        currentPeriodEnd: oneMonthFromNow,
      },
    });

    // Generate licenses for the subscription
    const licenses = await LicenseService.generateLicenses(
      userRecord.id,
      subscription.id,
      u.tier,
      u.seats
    );

    // Activate a subset of licenses to create variety
    for (let i = 0; i < licenses.length; i++) {
      const license = licenses[i];
      if (i % 2 === 0) {
        await prisma.license.update({
          where: { id: license.id },
          data: {
            status: 'ACTIVE',
            activatedAt: new Date(),
            activationCount: 1,
          },
        });

        // Add some usage analytics events
        await prisma.usageAnalytics.createMany({
          data: [
            {
              userId: userRecord.id,
              licenseId: license.id,
              event: 'LICENSE_ACTIVATION',
              metadata: { note: 'Seed activation' } as any,
            },
            {
              userId: userRecord.id,
              licenseId: license.id,
              event: 'SDK_DOWNLOAD_REQUEST',
              metadata: { platform: 'macOS' } as any,
            },
          ],
        });
      }
    }

    logger.info('Seeded test user', {
      email: u.email,
      password: u.password,
      tier: u.tier,
      seats: u.seats,
    });
  }

  // ---------------------------------------------------------------------------
  // Seed invoices for all subscriptions
  // ---------------------------------------------------------------------------
  logger.info('Starting invoice seeding...');
  await InvoiceSeeder.run();
  logger.info('Invoice seeding completed');
}

main()
  .catch((err) => {
    logger.error('Seed failed', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



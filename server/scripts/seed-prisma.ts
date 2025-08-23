#!/usr/bin/env tsx

import { PrismaClient, UserRole, SubscriptionTier, SubscriptionStatus, PaymentStatus, AMLStatus, LicenseStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  const targetCount = 50;

  const firstNames = ['John','Sarah','Mike','Emily','David','Lisa','Alex','Nicole','Robert','Maria','James','Olivia','Daniel','Sophia','Matthew','Ava','Ethan','Isabella','Andrew','Mia','Joseph','Amelia','Benjamin','Charlotte','Henry','Harper','Samuel','Evelyn','Lucas','Abigail','Christopher','Ella','Joshua','Elizabeth','Nathan','Sofia','Ryan','Madison','Noah','Avery'];
  const lastNames = ['Doe','Wilson','Johnson','Chen','Brown','Garcia','Turner','White','Lee','Rodriguez','Miller','Davis','Martinez','Taylor','Anderson','Thomas','Hernandez','Moore','Martin','Jackson'];
  const domains = ['techcorp.com','startup.io','enterprise.com','design.co','consulting.com','media.net','finance.org','health.care','logistics.com','education.edu'];

  // Ensure one superadmin
  const adminEmail = 'chebacca@gmail.com';
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'System Administrator',
        role: 'SUPERADMIN',
        isEmailVerified: true,
        marketingConsent: false,
        dataProcessingConsent: true,
      },
    });
  }

  const existingCount = await prisma.user.count();
  const toCreate = Math.max(0, targetCount - existingCount);

  const creations = [] as Array<ReturnType<typeof prisma.user.create>>;
  for (let i = 0; i < toCreate; i++) {
    const first = pick(firstNames);
    const last = pick(lastNames);
    const emailNum = String(i + 1).padStart(2, '0');
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${emailNum}@${pick(domains)}`;

    creations.push(
      prisma.user.create({
        data: {
          email,
          name: `${first} ${last}`,
          role: (Math.random() > 0.95 ? 'ADMIN' : 'USER') as UserRole,
          isEmailVerified: Math.random() > 0.1,
          twoFactorEnabled: Math.random() > 0.6,
          marketingConsent: Math.random() > 0.5,
          dataProcessingConsent: true,
          registrationSource: 'seed',
          userAgent: 'seed-script',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        },
      })
    );
  }

  if (creations.length > 0) {
    await Promise.all(creations);
  }

  // Fetch all users for relational seeding
  const users = await prisma.user.findMany();

  // Build subscriptions for users without any
  const subsToCreate: Array<Parameters<typeof prisma.subscription.createMany>[0]['data'][number]> = [];
  const paymentsToCreate: Array<Parameters<typeof prisma.payment.createMany>[0]['data'][number]> = [];
  const licensesToCreate: Array<Parameters<typeof prisma.license.createMany>[0]['data'][number]> = [];

  const tiers: SubscriptionTier[] = ['BASIC', 'PRO', 'ENTERPRISE'];
  const pricePerSeatByTier: Record<SubscriptionTier, number> = {
    BASIC: 15,
    PRO: 29,
    ENTERPRISE: 99,
  };

  for (const user of users) {
    const existingSubs = await prisma.subscription.count({ where: { userId: user.id } });
    if (existingSubs > 0) continue;

    const tier = pick(tiers);
    const seats = tier === 'BASIC' ? 1 : tier === 'PRO' ? Math.floor(Math.random() * 41) + 10 : Math.floor(Math.random() * 51) + 50;
    const pricePerSeat = pricePerSeatByTier[tier];
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);
    const termDays = tier === 'BASIC' ? 30 : 30;
    const currentPeriodStart = new Date(createdAt.getTime() + Math.floor(Math.random() * termDays) * 24 * 60 * 60 * 1000);
    const currentPeriodEnd = new Date(currentPeriodStart.getTime() + termDays * 24 * 60 * 60 * 1000);
    const status: SubscriptionStatus = Math.random() > 0.92 ? 'CANCELLED' : (Math.random() > 0.9 ? 'PAST_DUE' : 'ACTIVE');

    const subId = randomUUID();
    subsToCreate.push({
      id: subId,
      userId: user.id,
      tier,
      status,
      seats,
      pricePerSeat,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: Math.random() > 0.85,
      createdAt,
      // updatedAt is auto via @updatedAt
    });

    // Payments: 2-5 per subscription
    const paymentCount = Math.floor(Math.random() * 4) + 2;
    const unitPrice = pricePerSeat;
    const taxRate = 0.08;
    for (let i = 0; i < paymentCount; i++) {
      const subtotal = unitPrice * seats;
      const taxAmount = Math.round(subtotal * taxRate * 100);
      const totalCents = subtotal * 100 + taxAmount;
      const createdAtPayment = new Date(createdAt.getTime() + i * termDays * 24 * 60 * 60 * 1000);
      const payStatus: PaymentStatus = i === paymentCount - 1 ? (Math.random() > 0.85 ? 'PENDING' : 'SUCCEEDED') : 'SUCCEEDED';
      const invoiceId = `INV-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

      paymentsToCreate.push({
        id: randomUUID(),
        userId: user.id,
        subscriptionId: subId,
        stripeInvoiceId: invoiceId,
        amount: totalCents,
        currency: 'usd',
        status: payStatus,
        description: `${tier} subscription - ${seats} seats`,
        receiptUrl: `https://example.com/receipts/${invoiceId}`,
        paymentMethod: 'card',
        billingAddressSnapshot: {
          firstName: (user.name || 'User').split(' ')[0] || 'User',
          lastName: (user.name || 'User').split(' ')[1] || 'Seed',
          addressLine1: `${Math.floor(Math.random() * 9999) + 1} Main St`,
          city: 'City', state: 'ST', postalCode: '00000', country: 'US',
        },
        taxAmount,
        taxRate,
        taxJurisdiction: 'US',
        complianceData: { invoiceNumber: invoiceId },
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent: 'seed-script',
        processingLocation: 'US',
        amlScreeningStatus: 'PASSED' as AMLStatus,
        amlScreeningDate: createdAtPayment,
        pciCompliant: true,
        createdAt: createdAtPayment,
      });
    }

    // Licenses: one per seat
    for (let i = 0; i < seats; i++) {
      const licenseKey = `LIC-${Math.random().toString(36).slice(2, 10).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const isExpired = Math.random() > 0.9;
      const isSuspended = Math.random() > 0.95;
      let statusLic: LicenseStatus = 'ACTIVE';
      if (isSuspended) statusLic = 'SUSPENDED';
      else if (isExpired) statusLic = 'EXPIRED';

      const activatedAt = new Date(currentPeriodStart.getTime() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000);
      const expiresAt = new Date(activatedAt.getTime() + 365 * 24 * 60 * 60 * 1000);

      licensesToCreate.push({
        id: randomUUID(),
        key: licenseKey,
        userId: user.id,
        subscriptionId: subId,
        status: statusLic,
        tier,
        activatedAt,
        expiresAt,
        deviceInfo: {},
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        activationCount: statusLic === 'ACTIVE' ? Math.floor(Math.random() * 2) : 0,
        maxActivations: tier === 'ENTERPRISE' ? 5 : tier === 'PRO' ? 3 : 1,
        features: { tier, features: tier === 'BASIC' ? ['core'] : tier === 'PRO' ? ['core','pro'] : ['core','pro','enterprise'] },
        createdAt,
      });
    }
  }

  if (subsToCreate.length > 0) {
    await prisma.subscription.createMany({ data: subsToCreate, skipDuplicates: true });
  }
  if (paymentsToCreate.length > 0) {
    await prisma.payment.createMany({ data: paymentsToCreate, skipDuplicates: true });
  }
  if (licensesToCreate.length > 0) {
    await prisma.license.createMany({ data: licensesToCreate, skipDuplicates: true });
  }

  const finalCount = await prisma.user.count();
  const subCount = await prisma.subscription.count();
  const payCount = await prisma.payment.count();
  const licCount = await prisma.license.count();
  // eslint-disable-next-line no-console
  console.log(`Seeded SQL data. Users: ${finalCount}, Subs: ${subCount}, Payments: ${payCount}, Licenses: ${licCount}`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



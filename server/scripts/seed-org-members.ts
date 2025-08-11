#!/usr/bin/env tsx

// Seed additional organization members for a given owner email
// Usage:
//   pnpm tsx scripts/seed-org-members.ts <ownerEmail> [countInvited] [countActive]
// Defaults:
//   ownerEmail = enterprise.test+invite@example.com
//   countInvited = 3
//   countActive = 1

process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import '../src/services/firestoreService.js';
import { firestoreService as db } from '../src/services/firestoreService.js';
import { PasswordUtil } from '../src/utils/password.js';
import { logger } from '../src/utils/logger.js';

async function ensureUser(email: string, name?: string) {
  const existing = await db.getUserByEmail(email).catch(() => null as any);
  if (existing) return existing;
  const password = PasswordUtil.generateSecurePassword(16);
  const hashed = await PasswordUtil.hash(password);
  const created = await db.createUser({
    email,
    name: name || email.split('@')[0],
    password: hashed,
    role: 'USER' as any,
    isEmailVerified: true,
    twoFactorEnabled: false,
    twoFactorBackupCodes: [],
    marketingConsent: false,
    dataProcessingConsent: false,
    identityVerified: false,
    kycStatus: 'PENDING' as any,
    privacyConsent: [],
    registrationSource: 'seed',
  } as any);
  logger.info(`Created user ${email} (${created.id}) with temp password (not shown)`);
  return created;
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const ownerEmail = args[0] || 'enterprise.test+invite@example.com';
  const countInvited = Number(args[1] || 3);
  const countActive = Number(args[2] || 1);

  const owner = await db.getUserByEmail(ownerEmail);
  if (!owner) {
    throw new Error(`Owner user not found: ${ownerEmail}`);
  }

  // Get or create organization owned by this user
  let orgs = await db.getOrganizationsOwnedByUser(owner.id).catch(() => [] as any[]);
  let orgId: string;
  if (!orgs || orgs.length === 0) {
    const org = await db.createOrganization({
      name: `${owner.name || owner.email}'s Organization`,
      ownerUserId: owner.id,
      tier: 'ENTERPRISE' as any,
    } as any);
    orgId = org.id;
    await db.createOrgMember({
      orgId,
      email: owner.email,
      userId: owner.id,
      role: 'OWNER' as any,
      status: 'ACTIVE' as any,
      seatReserved: true,
      invitedByUserId: owner.id,
      invitedAt: new Date(),
      joinedAt: new Date(),
    } as any);
    logger.info(`Created organization ${orgId} and seeded OWNER ${owner.email}`);
  } else {
    orgId = orgs[0].id;
    logger.info(`Using existing organization ${orgId} for ${ownerEmail}`);
  }

  // Create invited placeholders
  for (let i = 0; i < countInvited; i++) {
    const email = `member${i + 1}.${owner.email.split('@')[0]}@example.com`;
    await db.createOrgMember({
      orgId,
      email,
      role: 'MEMBER' as any,
      status: 'INVITED' as any,
      seatReserved: true,
      invitedByUserId: owner.id,
      invitedAt: new Date(),
    } as any);
    logger.info(`Created INVITED member ${email}`);
  }

  // Create active users and link them as members
  for (let i = 0; i < countActive; i++) {
    const email = `active${i + 1}.${owner.email.split('@')[0]}@example.com`;
    const user = await ensureUser(email, `Active ${i + 1}`);
    await db.createOrgMember({
      orgId,
      email,
      userId: user.id,
      role: i === 0 ? ('MANAGER' as any) : ('MEMBER' as any),
      status: 'ACTIVE' as any,
      seatReserved: true,
      invitedByUserId: owner.id,
      invitedAt: new Date(),
      joinedAt: new Date(),
    } as any);
    logger.info(`Created ACTIVE member ${email}`);
  }

  logger.info(`Seeding org members complete for ${ownerEmail} (org ${orgId})`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});



#!/usr/bin/env tsx

/*
  Import team members for the licensing website from the Dashboard-v14_2 enhanced seed users.

  - Owner (enterprise admin) email: enterprise.test+invite@example.com
  - Reads users from: /Users/chebrooks/Documents/IDE_Project/Dashboard-v14_2/apps/server/prisma/seeds/data/users.mjs
  - Ensures each user exists in Firestore users collection
  - Adds/links them as ACTIVE org members under the owner's organization
  - Role mapping: ADMIN -> ENTERPRISE_ADMIN; MANAGER -> MANAGER; others -> MEMBER

  Usage:
    pnpm tsx scripts/import-dashboard-users-team.ts [ownerEmail]
*/

process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import '../src/services/firestoreService.js';
import { firestoreService as db } from '../src/services/firestoreService.js';
import { logger } from '../src/utils/logger.js';

type DashboardSeedUser = {
  id: string;
  email: string;
  username?: string;
  password: string; // already hashed in the seed file
  name: string;
  role: string;
  status?: string;
  pod?: string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

function mapRoleToOrgRole(role: string): 'OWNER' | 'ENTERPRISE_ADMIN' | 'MANAGER' | 'MEMBER' {
  const upper = (role || '').toUpperCase();
  if (upper.includes('ADMIN')) return 'ENTERPRISE_ADMIN';
  if (upper.includes('MANAGER')) return 'MANAGER';
  return 'MEMBER';
}

async function ensureOwnerAndOrg(ownerEmail: string): Promise<{ ownerId: string; orgId: string }> {
  const owner = await db.getUserByEmail(ownerEmail);
  if (!owner) {
    throw new Error(`Owner user not found: ${ownerEmail}. Seed the enterprise test user first (pnpm --filter server seed:enterprise-test).`);
  }

  // Find or create organization
  const orgs = await db.getOrganizationsOwnedByUser(owner.id).catch(() => [] as any[]);
  if (orgs && orgs.length > 0) {
    return { ownerId: owner.id, orgId: orgs[0].id };
  }

  const org = await db.createOrganization({
    name: `${owner.name || owner.email}'s Organization`,
    ownerUserId: owner.id,
    tier: 'ENTERPRISE' as any,
  } as any);

  await db.createOrgMember({
    orgId: org.id,
    email: owner.email,
    userId: owner.id,
    role: 'OWNER' as any,
    status: 'ACTIVE' as any,
    seatReserved: true,
    invitedByUserId: owner.id,
    invitedAt: new Date(),
    joinedAt: new Date(),
  } as any);

  return { ownerId: owner.id, orgId: org.id };
}

async function ensureUser(userData: DashboardSeedUser) {
  const existing = await db.getUserByEmail(userData.email).catch(() => null as any);
  if (existing) return existing;

  // The seed file's password is already hashed; we store as-is
  const created = await db.createUser({
    email: userData.email,
    name: userData.name || userData.email.split('@')[0],
    password: userData.password,
    role: 'USER' as any,
    isEmailVerified: true,
    twoFactorEnabled: false,
    twoFactorBackupCodes: [],
    marketingConsent: false,
    dataProcessingConsent: false,
    identityVerified: false,
    kycStatus: 'PENDING' as any,
    privacyConsent: [],
    registrationSource: 'import-dashboard-users',
  } as any);
  logger.info(`Created user ${userData.email} (${created.id})`);
  return created;
}

async function linkAsActiveMember(orgId: string, ownerId: string, email: string, userId: string, desiredRole: 'OWNER' | 'ENTERPRISE_ADMIN' | 'MANAGER' | 'MEMBER') {
  // Check if a member record already exists for this email
  const existingMember = await db.getOrgMemberByEmail(orgId, email).catch(() => null as any);
  if (existingMember) {
    await db.updateOrgMember(existingMember.id, {
      userId,
      role: desiredRole,
      status: 'ACTIVE' as any,
      seatReserved: true,
      joinedAt: existingMember.joinedAt || new Date(),
    });
    logger.info(`Updated existing member ${email} -> ACTIVE (${desiredRole})`);
    return;
  }

  await db.createOrgMember({
    orgId,
    email,
    userId,
    role: desiredRole,
    status: 'ACTIVE' as any,
    seatReserved: true,
    invitedByUserId: ownerId,
    invitedAt: new Date(),
    joinedAt: new Date(),
  } as any);
  logger.info(`Created ACTIVE member ${email} (${desiredRole})`);
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--');
  const ownerEmail = args[0] || 'enterprise.test+invite@example.com';

  logger.info(`Importing Dashboard users as team members for ${ownerEmail}...`);

  const { ownerId, orgId } = await ensureOwnerAndOrg(ownerEmail);

  // Dynamic import of the enhanced seed users from Dashboard-v14_2
  const seedPath = '/Users/chebrooks/Documents/IDE_Project/Dashboard-v14_2/apps/server/prisma/seeds/data/users.mjs';
  const moduleUrl = `file://${seedPath}`;
  const imported = (await import(moduleUrl)) as { users: DashboardSeedUser[] };
  const users: DashboardSeedUser[] = imported.users || [];

  if (!users.length) {
    throw new Error('No users found in the Dashboard enhanced seed file.');
  }

  // De-duplicate by email and skip the owner
  const seen = new Set<string>();
  const filtered = users.filter((u) => {
    const email = (u.email || '').trim().toLowerCase();
    if (!email || email === ownerEmail.toLowerCase()) return false;
    if (seen.has(email)) return false;
    seen.add(email);
    return true;
  });

  logger.info(`Found ${filtered.length} unique users to import as members`);

  let createdCount = 0;
  let updatedCount = 0;

  for (const u of filtered) {
    try {
      const user = await ensureUser(u);
      const desiredRole = mapRoleToOrgRole(u.role);
      const existingMember = await db.getOrgMemberByEmail(orgId, u.email).catch(() => null as any);
      if (existingMember) {
        await db.updateOrgMember(existingMember.id, {
          userId: user.id,
          role: desiredRole,
          status: 'ACTIVE' as any,
          seatReserved: true,
          joinedAt: existingMember.joinedAt || new Date(),
        });
        updatedCount += 1;
        logger.info(`Updated member: ${u.email}`);
      } else {
        await linkAsActiveMember(orgId, ownerId, u.email, user.id, desiredRole);
        createdCount += 1;
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(`Failed to import member ${u.email}:`, err?.message || err);
    }
  }

  logger.info(`Import complete. Created ${createdCount}, updated ${updatedCount}. Org: ${orgId}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});



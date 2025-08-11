#!/usr/bin/env tsx

// Ensure Functions env shape similar to other scripts
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'maintenance';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import '../src/services/firestoreService.js';
import { firestoreService as db } from '../src/services/firestoreService.js';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '../src/utils/logger.js';

async function backfillEnterpriseOrgLinks(): Promise<void> {
  logger.info('Starting backfill: ENTERPRISE subscriptions -> organizations');

  // 1) Load all ENTERPRISE subscriptions
  // We don't have a direct method to list all subscriptions, so we query Firestore via the service layer internals.
  // The service does not expose a generic list, so we emulate here using admin SDK through firestoreService utilities.
  // We will read subscriptions collection directly using firebase-admin to avoid adding list API to service.
  const afs = getFirestore();

  const subsSnap = await afs
    .collection('subscriptions')
    .where('tier', '==', 'ENTERPRISE')
    .where('status', '==', 'ACTIVE')
    .get();

  logger.info(`Found ${subsSnap.size} active ENTERPRISE subscription(s)`);

  let processed = 0;
  let updated = 0;
  let createdOrgs = 0;
  let createdOwners = 0;

  for (const doc of subsSnap.docs) {
    const sub = doc.data();
    processed += 1;
    const userId: string = sub.userId;

    try {
      // Ensure org exists for user
      const existingOrgs = await db.getOrganizationsOwnedByUser(userId).catch(() => [] as any[]);
      let orgId: string;
      if (!existingOrgs || existingOrgs.length === 0) {
        const ownerUser = await db.getUserById(userId);
        const org = await db.createOrganization({
          name: `${ownerUser?.name || ownerUser?.email || 'Organization'}`,
          ownerUserId: userId,
          tier: 'ENTERPRISE',
        } as any);
        orgId = org.id;
        createdOrgs += 1;

        // Seed OWNER member
        await db.createOrgMember({
          orgId,
          email: ownerUser?.email || 'unknown@example.com',
          userId,
          role: 'OWNER',
          status: 'ACTIVE',
          seatReserved: true,
          invitedByUserId: userId,
          invitedAt: new Date(),
          joinedAt: new Date(),
        } as any);
        createdOwners += 1;
      } else {
        orgId = existingOrgs[0].id;
        // Ensure OWNER member exists and is active
        const ownerUser = await db.getUserById(userId);
        const existingMember = await db.getOrgMemberByEmail(orgId, ownerUser?.email || '');
        if (!existingMember) {
          await db.createOrgMember({
            orgId,
            email: ownerUser?.email || 'unknown@example.com',
            userId,
            role: 'OWNER',
            status: 'ACTIVE',
            seatReserved: true,
            invitedByUserId: userId,
            invitedAt: new Date(),
            joinedAt: new Date(),
          } as any);
          createdOwners += 1;
        } else if (existingMember.status !== 'ACTIVE' || !existingMember.userId) {
          await db.updateOrgMember(existingMember.id, { userId, status: 'ACTIVE', seatReserved: true, joinedAt: new Date() });
        }
      }

      // Link subscription to organization if missing or different
      if (sub.organizationId !== orgId) {
        await db.updateSubscription(sub.id, { organizationId: orgId } as any);
        updated += 1;
        logger.info(`Linked subscription ${sub.id} -> org ${orgId} (user ${userId})`);
      }
    } catch (e) {
      logger.warn?.(`Backfill failed for subscription ${sub.id}: ${(e as any)?.message || e}`);
    }
  }

  logger.info(`Backfill complete. Processed: ${processed}, Updated subs: ${updated}, Created orgs: ${createdOrgs}, Seeded/updated owners: ${createdOwners}`);
}

backfillEnterpriseOrgLinks()
  .catch((err) => {
    logger.error('❌ Backfill failed', err);
    process.exit(1);
  })
  .then(() => process.exit(0));



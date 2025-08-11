import { firestoreService } from '../src/services/firestoreService.js';
import { logger } from '../src/utils/logger.js';

/**
 * Cleanup script: for a target email, ensure at most one non-revoked license per subscription.
 * Older duplicates are set to REVOKED, keeping the most recently updated ACTIVE/PENDING if present,
 * otherwise the most recently updated license.
 *
 * Usage (ts-node): pnpm ts-node server/scripts/cleanup-duplicate-licenses.ts <email>
 */
async function main() {
  try {
    const email = process.argv[2];
    if (!email) {
      // eslint-disable-next-line no-console
      console.error('Usage: pnpm ts-node server/scripts/cleanup-duplicate-licenses.ts <email>');
      process.exit(1);
    }

    const user = await firestoreService.getUserByEmail(email);
    if (!user) {
      logger.info('User not found for email', { email });
      process.exit(0);
    }

    const licenses = await firestoreService.getLicensesByUserId(user.id);
    if (licenses.length === 0) {
      logger.info('No licenses found for user', { email, userId: user.id });
      process.exit(0);
    }

    const bySub: Map<string, any[]> = new Map();
    for (const lic of licenses) {
      const key = lic.subscriptionId || 'no-sub';
      const list = bySub.get(key) || [];
      list.push(lic);
      bySub.set(key, list);
    }

    for (const [subId, list] of bySub.entries()) {
      if (list.length <= 1) continue;
      // Sort newest first by updatedAt/createdAt
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      // Pick keeper: prefer ACTIVE/PENDING if present
      const keeper = list.find(l => l.status === 'ACTIVE' || l.status === 'PENDING') || list[0];
      for (const lic of list) {
        if (lic.id !== keeper.id && lic.status !== 'REVOKED') {
          await firestoreService.updateLicense(lic.id, { status: 'REVOKED' } as any);
          logger.info('Revoked duplicate license', { licenseId: lic.id, subscriptionId: subId, userId: user.id, email });
        }
      }
      logger.info('Kept license for subscription', { keepLicenseId: keeper.id, subscriptionId: subId, userId: user.id, email });
    }

    logger.info('Cleanup complete', { email, userId: user.id });
  } catch (err: any) {
    logger.error('Cleanup failed', { error: err?.message });
    process.exit(1);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();



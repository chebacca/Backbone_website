#!/usr/bin/env tsx

process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'maintenance';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import '../src/services/firestoreService.js';
import { getFirestore } from 'firebase-admin/firestore';

async function main() {
  const afs = getFirestore();
  const subsSnap = await afs
    .collection('subscriptions')
    .where('tier', '==', 'ENTERPRISE')
    .where('status', '==', 'ACTIVE')
    .limit(10)
    .get();

  const results: Array<{ userId: string; email: string; role: string; isEmailVerified?: boolean; subscriptionId: string; organizationId?: string }>
    = [];

  for (const doc of subsSnap.docs) {
    const sub = doc.data() as any;
    const userDoc = await afs.collection('users').doc(sub.userId).get();
    const user = userDoc.data() || {};
    results.push({
      userId: sub.userId,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      subscriptionId: doc.id,
      organizationId: sub.organizationId,
    });
  }

  // Print JSON to stdout
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ success: true, data: results }, null, 2));
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({ success: false, error: (e as any)?.message || String(e) }));
  process.exit(1);
});



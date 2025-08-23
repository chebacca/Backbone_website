#!/usr/bin/env tsx

// Ensure env hints similar to other scripts
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '../src/utils/logger.js';

// Firestore will be initialized after dynamic import of firestoreService
let db: ReturnType<typeof getFirestore>;

async function deleteBatch(refs: FirebaseFirestore.DocumentReference[]): Promise<void> {
  const batch = db.batch();
  refs.forEach((r) => batch.delete(r));
  await batch.commit();
}

async function clearSubcollectionsOfDoc(docRef: FirebaseFirestore.DocumentReference): Promise<void> {
  const subs = await docRef.listCollections();
  for (const sub of subs) {
    let totalDeleted = 0;
    // Delete subcollection docs in batches
    while (true) {
      const snap = await sub.limit(500).get();
      if (snap.empty) break;
      const refs = snap.docs.map((d) => d.ref);
      await deleteBatch(refs);
      totalDeleted += refs.length;
    }
    if (totalDeleted > 0) {
      logger.info(`Cleared ${totalDeleted} documents from subcollection ${sub.path}`);
    }
  }
}

async function clearCollection(col: FirebaseFirestore.CollectionReference): Promise<void> {
  logger.info(`🧹 Clearing collection ${col.id} ...`);
  let total = 0;
  while (true) {
    const snap = await col.limit(500).get();
    if (snap.empty) break;
    // Attempt to clear subcollections for each doc before deletion
    for (const doc of snap.docs) {
      try {
        await clearSubcollectionsOfDoc(doc.ref);
      } catch (err) {
        logger.warn(`Failed clearing subcollections for ${doc.ref.path}: ${(err as any)?.message || err}`);
      }
    }
    await deleteBatch(snap.docs.map((d) => d.ref));
    total += snap.size;
  }
  logger.info(`✅ Cleared ${total} documents from ${col.path}`);
}

async function main() {
  try {
    // Dynamically import after env is set so Firestore Admin sees env
    await import('../src/services/firestoreService.js');
    db = getFirestore();
    logger.info('🔎 Listing all root collections...');
    const collections = await db.listCollections();
    const names = collections.map((c) => c.id).sort();
    logger.info(`Found ${collections.length} collections: ${names.join(', ')}`);

    for (const col of collections) {
      await clearCollection(col);
    }

    logger.info('✅ All root collections cleared.');
  } catch (error) {
    logger.error('❌ Failed to clear Firestore:', error);
    process.exit(1);
  }
}

main();



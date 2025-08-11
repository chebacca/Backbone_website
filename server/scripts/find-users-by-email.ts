#!/usr/bin/env tsx
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'maintenance';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import '../src/services/firestoreService.js';
import { getFirestore } from 'firebase-admin/firestore';

async function main() {
  const email = process.argv[2] || 'enterprise.test+invite@example.com';
  const afs = getFirestore();
  const snap = await afs.collection('users').where('email', '==', email).get();
  const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ count: users.length, users }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });



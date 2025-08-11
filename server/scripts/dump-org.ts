#!/usr/bin/env tsx
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'maintenance';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import '../src/services/firestoreService.js';
import { getFirestore } from 'firebase-admin/firestore';

async function main() {
  const email = process.argv[2] || 'enterprise.test+invite@example.com';
  const afs = getFirestore();
  const userSnap = await afs.collection('users').where('email', '==', email).limit(1).get();
  if (userSnap.empty) {
    console.log(JSON.stringify({ error: 'user-not-found' }));
    return;
  }
  const userDoc = userSnap.docs[0];
  const orgs = await afs.collection('organizations').where('ownerUserId','==',userDoc.id).get();
  const out: any = { userId: userDoc.id, orgs: orgs.docs.map(d => ({ id: d.id, ...d.data() })) };
  if (!orgs.empty) {
    const orgId = orgs.docs[0].id;
    const members = await afs.collection('org_members').where('orgId','==',orgId).get();
    const subs = await afs.collection('subscriptions').where('organizationId','==',orgId).get();
    out.members = members.docs.map(d => d.data());
    out.subscriptions = subs.docs.map(d => d.data());
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });



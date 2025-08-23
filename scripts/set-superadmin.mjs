#!/usr/bin/env node

// Set a Firestore user's role to SUPERADMIN by email
// Usage: node set-superadmin.mjs <email>

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const [emailArg] = process.argv.slice(2);
if (!emailArg) {
  console.error('Usage: node set-superadmin.mjs <email>');
  process.exit(1);
}

const serviceAccountPath = join(__dirname, '..', 'config', 'serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (e) {
  console.error('Failed to read serviceAccountKey.json at:', serviceAccountPath);
  console.error(e.message);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'backbone-logic',
  });
}

const db = admin.firestore();

async function run() {
  const email = String(emailArg).toLowerCase();
  console.log('🔎 Looking up user by email:', email);

  const usersRef = db.collection('users');
  const snap = await usersRef.where('email', '==', email).limit(2).get();
  if (snap.empty) {
    console.error('❌ No user found with that email in Firestore users collection');
    process.exit(2);
  }
  if (snap.size > 1) {
    console.warn('⚠️ Multiple users found with that email; updating the first match');
  }

  const doc = snap.docs[0];
  const before = doc.data();
  console.log('📄 Current user doc:', { id: doc.id, role: before.role, isTeamMember: before.isTeamMember });

  const updates = {
    role: 'SUPERADMIN',
    isTeamMember: false,
    memberRole: admin.firestore.FieldValue.delete(),
    memberStatus: admin.firestore.FieldValue.delete(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await doc.ref.set(updates, { merge: true });
  const after = (await doc.ref.get()).data();
  console.log('✅ Updated user doc:', { id: doc.id, role: after.role, isTeamMember: after.isTeamMember });

  // Optionally, set custom claims in Firebase Auth for consistency
  try {
    const authUser = await admin.auth().getUserByEmail(email);
    const existingClaims = authUser.customClaims || {};
    await admin.auth().setCustomUserClaims(authUser.uid, { ...existingClaims, role: 'SUPERADMIN' });
    console.log('✅ Set Firebase Auth custom claims: { role: "SUPERADMIN" } for uid:', authUser.uid);
  } catch (e) {
    console.warn('⚠️ Could not set Firebase Auth custom claims (continuing):', e.message);
  }
}

run().then(() => process.exit(0)).catch(err => {
  console.error('💥 Failure:', err);
  process.exit(1);
});




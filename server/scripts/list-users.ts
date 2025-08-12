#!/usr/bin/env tsx
import { getFirestore } from 'firebase-admin/firestore';
// Initialize admin by importing service bootstrap
import '../src/services/firestoreService.js';

async function main() {
  const db = getFirestore();
  const snap = await db.collection('users').get();
  const users = snap.docs.map(d => d.data() as any).map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role, isEmailVerified: u.isEmailVerified }));
  console.log(JSON.stringify({ count: users.length, users }, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });



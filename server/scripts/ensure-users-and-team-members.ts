#!/usr/bin/env tsx

// Ensure Functions-like env for Firebase Admin when running locally
process.env.FUNCTION_TARGET = process.env.FUNCTION_TARGET || 'seeding';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'backbone-logic';

import { getAuth, ListUsersResult, UserRecord } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '../src/utils/logger.js';
// NOTE: Do NOT statically import firestoreService here. Use dynamic import inside main()
// so that env vars above are set before initialization.

let db: any;

const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || 'org-backbone';

type UserDoc = {
	email: string;
	displayName?: string;
	role: string;
	organizationId: string;
	createdAt?: FirebaseFirestore.FieldValue;
	updatedAt?: FirebaseFirestore.FieldValue;
};

async function listAllAuthUsers(): Promise<UserRecord[]> {
	const auth = getAuth();
	const collected: UserRecord[] = [];
	let nextPageToken: string | undefined = undefined;
	do {
		const res: ListUsersResult = await auth.listUsers(1000, nextPageToken);
		collected.push(...res.users);
		nextPageToken = res.pageToken;
	} while (nextPageToken);
	return collected;
}

async function getExistingDefaultOrgId(): Promise<string | null> {
	// Try to find any existing users doc with organizationId to reuse
	const snap = await db.collection('users').limit(1).get();
	if (!snap.empty) {
		const orgId = snap.docs[0].get('organizationId');
		if (typeof orgId === 'string' && orgId.trim().length > 0) return orgId;
	}
	return null;
}

function chooseRole(email: string): string {
	if (email.toLowerCase() === 'chebacca@gmail.com') return 'admin';
	return 'user';
}

async function ensureUserDocFor(authUser: UserRecord, fallbackOrgId: string): Promise<string> {
	const uid = authUser.uid;
	const email = authUser.email || `${uid}@unknown.local`;
	const usersRef = db.collection('users').doc(uid);
	const existing = await usersRef.get();

	// Prefer existing orgId if present; otherwise derive from team_members; else fallback
	let organizationId: string | null = null;
	if (existing.exists) {
		const val = existing.get('organizationId');
		if (typeof val === 'string' && val.trim().length > 0) organizationId = val;
	}
	if (!organizationId) {
		const teamMember = await db.collection('team_members').doc(email).get();
		const tmOrg = teamMember.exists ? teamMember.get('organizationId') : null;
		if (typeof tmOrg === 'string' && tmOrg.trim().length > 0) organizationId = tmOrg;
	}
	if (!organizationId) organizationId = fallbackOrgId;

	const role = existing.exists ? (existing.get('role') || chooseRole(email)) : chooseRole(email);
	const userDoc: UserDoc = {
		email,
		displayName: authUser.displayName || email.split('@')[0],
		role,
		organizationId,
		createdAt: existing.exists ? existing.get('createdAt') : (global as any).FieldValue?.serverTimestamp?.() || (await import('firebase-admin/firestore')).FieldValue.serverTimestamp(),
		updatedAt: (await import('firebase-admin/firestore')).FieldValue.serverTimestamp(),
	};

	await usersRef.set(userDoc, { merge: true });
	logger.info(`✅ Ensured users/${uid} (role=${role}, org=${organizationId})`);
	return organizationId;
}

async function ensureTeamMembersFor(authUser: UserRecord, organizationId: string): Promise<void> {
	const uid = authUser.uid;
	const email = (authUser.email || '').toLowerCase();
	if (!email) return;

	// Snake_case: team_members/{email}
	const tmSnakeRef = db.collection('team_members').doc(email);
	const tmSnake = await tmSnakeRef.get();
	if (!tmSnake.exists) {
		await tmSnakeRef.set({
			email,
			firebaseUid: uid,
			organizationId,
			createdBy: uid,
			createdAt: (await import('firebase-admin/firestore')).FieldValue.serverTimestamp(),
			updatedAt: (await import('firebase-admin/firestore')).FieldValue.serverTimestamp(),
		});
		logger.info(`✅ Created team_members/${email}`);
	}

	// CamelCase: teamMembers/{uid}
	const tmCamelRef = db.collection('teamMembers').doc(uid);
	const tmCamel = await tmCamelRef.get();
	if (!tmCamel.exists) {
		await tmCamelRef.set({
			id: uid,
			email,
			firebaseUid: uid,
			organizationId,
			createdBy: uid,
			createdAt: (await import('firebase-admin/firestore')).FieldValue.serverTimestamp(),
			updatedAt: (await import('firebase-admin/firestore')).FieldValue.serverTimestamp(),
		});
		logger.info(`✅ Created teamMembers/${uid}`);
	}
}

async function main() {
	try {
		// Initialize Firebase Admin after env vars are set
		await import('../src/services/firestoreService.js');
		// Refresh db reference after initialization
		db = getFirestore();
		logger.info('🔎 Ensuring users/{uid} and team member records align with Firebase Auth...');
		const allUsers = await listAllAuthUsers();
		if (allUsers.length === 0) {
			logger.warn('No Firebase Auth users found. Run ensure-firebase-auth-users.ts first.');
			return;
		}
		const fallbackOrg = (await getExistingDefaultOrgId()) || DEFAULT_ORG_ID;
		logger.info(`Using default organizationId: ${fallbackOrg}`);

		for (const authUser of allUsers) {
			const orgId = await ensureUserDocFor(authUser, fallbackOrg);
			await ensureTeamMembersFor(authUser, orgId);
		}
		logger.info('✅ Alignment complete.');
	} catch (error) {
		logger.error('❌ Failed to ensure Firestore alignment:', error);
		process.exit(1);
	}
}

main();

/**
 * Firestore License Service
 * Provides direct Firestore access for license operations in web-only mode
 */

import { 
    collection, 
    query, 
    where, 
    getDocs, 
    doc, 
    getDoc,
    updateDoc,
    orderBy,
    limit as firestoreLimit,
    serverTimestamp
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

export interface FirestoreLicense {
    id: string;
    key: string;
    tier: 'BASIC' | 'PRO' | 'ENTERPRISE';
    status: 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'PENDING' | 'REVOKED';
    userId?: string;
    subscriptionId?: string;
    organizationId?: string;
    assignedToUserId?: string;
    assignedToEmail?: string;
    activatedAt?: string;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
    maxActivations?: number;
    activationCount?: number;
    currentPeriodEnd?: string;
    type?: string;
}

export interface FirestoreUser {
    id: string;
    email: string;
    name?: string;
    role?: string;
    organizationId?: string;
}

export class FirestoreLicenseService {
    private static instance: FirestoreLicenseService;
    
    public static getInstance(): FirestoreLicenseService {
        if (!FirestoreLicenseService.instance) {
            FirestoreLicenseService.instance = new FirestoreLicenseService();
        }
        return FirestoreLicenseService.instance;
    }
    
    /**
     * Check if we're in web-only mode
     * Licensing website is ALWAYS in web-only mode
     */
    private isWebOnlyMode(): boolean {
        // Licensing website is always in web-only mode
        // This ensures consistent behavior across all environments
        return true;
    }
    
    /**
     * Get user guidance for Firebase Auth issues
     */
    public getFirebaseAuthGuidance(errorCode?: string): string {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'User not found in Firebase Auth. Contact your administrator to create a Firebase Auth user for your email address.';
            case 'auth/wrong-password':
                return 'Incorrect password for Firebase Auth. Please check your password and try again.';
            case 'auth/too-many-requests':
                return 'Too many authentication attempts. Please wait a few minutes and try again.';
            case 'auth/invalid-email':
                return 'Invalid email format. Please check your email address.';
            case 'auth/user-disabled':
                return 'Your account has been disabled. Contact your administrator to re-enable your account.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your internet connection and try again.';
            default:
                return 'Firebase Auth authentication failed. This may prevent access to some features. Contact support if the issue persists.';
        }
    }
    
    /**
     * Check if a user exists in Firebase Auth
     */
    public async checkFirebaseAuthUser(email: string): Promise<boolean> {
        try {
            const { auth } = await import('./firebase');
            const { fetchSignInMethodsForEmail } = await import('firebase/auth');
            
            const methods = await fetchSignInMethodsForEmail(auth, email);
            return methods.length > 0;
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Error checking Firebase Auth user:', error);
            return false;
        }
    }
    
    /**
     * Ensure Firebase Auth authentication for Firestore access
     */
    private async ensureFirebaseAuth(email: string, password: string): Promise<boolean> {
        try {
            const { auth } = await import('./firebase');
            
            // Check if already authenticated
            if (auth.currentUser && auth.currentUser.email === email) {
                console.log('✅ [FirestoreLicenseService] Already authenticated with Firebase Auth');
                return true;
            }
            
            // Sign out if different user
            if (auth.currentUser) {
                await signOut(auth);
                console.log('🔄 [FirestoreLicenseService] Signed out previous user');
            }
            
            // Check if user exists in Firebase Auth first
            const userExists = await this.checkFirebaseAuthUser(email);
            if (!userExists) {
                console.warn('⚠️ [FirestoreLicenseService] User not found in Firebase Auth - may need to create Firebase Auth user');
                console.log('💡 [FirestoreLicenseService] Contact your administrator to create a Firebase Auth user for this email');
                return false;
            }
            
            // Sign in with email/password
            console.log('🔑 [FirestoreLicenseService] Authenticating with Firebase Auth...');
            await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ [FirestoreLicenseService] Successfully authenticated with Firebase Auth');
            return true;
            
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Failed to authenticate with Firebase Auth:', error);
            
            // Provide specific error messages for common issues
            if (error && typeof error === 'object' && 'code' in error) {
                const errorCode = (error as any).code;
                if (errorCode === 'auth/user-not-found') {
                    console.warn('⚠️ [FirestoreLicenseService] User not found in Firebase Auth - may need to create Firebase Auth user');
                    console.log('💡 [FirestoreLicenseService] Contact your administrator to create a Firebase Auth user for this email');
                } else if (errorCode === 'auth/wrong-password') {
                    console.warn('⚠️ [FirestoreLicenseService] Wrong password for Firebase Auth');
                    console.log('💡 [FirestoreLicenseService] Please check your password and try again');
                } else if (errorCode === 'auth/too-many-requests') {
                    console.warn('⚠️ [FirestoreLicenseService] Too many authentication attempts - please try again later');
                } else if (errorCode === 'auth/invalid-email') {
                    console.warn('⚠️ [FirestoreLicenseService] Invalid email format');
                } else if (errorCode === 'auth/user-disabled') {
                    console.warn('⚠️ [FirestoreLicenseService] User account has been disabled');
                    console.log('💡 [FirestoreLicenseService] Contact your administrator to re-enable your account');
                }
            }
            
            return false;
        }
    }
    
    /**
     * Create a Firebase Auth user for Google/Apple users
     * This is needed when users log in with OAuth but don't have Firebase Auth accounts
     */
    public async createFirebaseAuthUser(email: string, password: string): Promise<boolean> {
        try {
            if (!this.isWebOnlyMode()) {
                throw new Error('FirestoreLicenseService should only be used in web-only mode');
            }
            
            console.log('🔍 [FirestoreLicenseService] Creating Firebase Auth user for:', email);
            
            const { auth } = await import('./firebase');
            const { createUserWithEmailAndPassword } = await import('firebase/auth');
            
            // Create the user in Firebase Auth
            await createUserWithEmailAndPassword(auth, email, password);
            console.log('✅ [FirestoreLicenseService] Successfully created Firebase Auth user');
            
            return true;
            
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Failed to create Firebase Auth user:', error);
            
            // If user already exists, try to sign in instead
            if (error && typeof error === 'object' && 'code' in error && (error as any).code === 'auth/email-already-in-use') {
                console.log('ℹ️ [FirestoreLicenseService] User already exists, trying to sign in...');
                try {
                    const authSuccess = await this.ensureFirebaseAuth(email, password);
                    return authSuccess;
                } catch (signInError) {
                    console.error('❌ [FirestoreLicenseService] Failed to sign in existing user:', signInError);
                    return false;
                }
            }
            
            return false;
        }
    }

    /**
     * Check if the current user is authenticated with Firebase Auth
     */
    public async isFirebaseAuthAuthenticated(): Promise<boolean> {
        try {
            const { auth } = await import('./firebase');
            return auth.currentUser !== null;
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Error checking Firebase Auth status:', error);
            return false;
        }
    }

    /**
     * Get current Firebase Auth user info
     */
    public async getCurrentFirebaseUser(): Promise<{ uid: string; email: string | null } | null> {
        try {
            const { auth } = await import('./firebase');
            if (auth.currentUser) {
                return {
                    uid: auth.currentUser.uid,
                    email: auth.currentUser.email
                };
            }
            return null;
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Error getting current Firebase user:', error);
            return null;
        }
    }

    /**
     * Get licenses for a specific user
     */
    public async getMyLicenses(userId: string, email?: string, password?: string): Promise<FirestoreLicense[]> {
        try {
            if (!this.isWebOnlyMode()) {
                throw new Error('FirestoreLicenseService should only be used in web-only mode');
            }
            
            console.log('🔍 [FirestoreLicenseService] Fetching licenses for user:', userId);
            
            // Ensure Firebase Auth authentication if credentials provided
            if (email && password) {
                const authSuccess = await this.ensureFirebaseAuth(email, password);
                if (!authSuccess) {
                    console.warn('⚠️ [FirestoreLicenseService] Firebase Auth failed, trying without authentication');
                }
            }
            
            const { db } = await import('./firebase');
            
            // Query licenses by multiple possible field names to be more flexible
            const licensesQuery = query(
                collection(db, 'licenses'),
                where('userId', '==', userId)
            );
            
            const snapshot = await getDocs(licensesQuery);
            const licenses: FirestoreLicense[] = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                licenses.push({
                    id: doc.id,
                    key: data.key || doc.id,
                    tier: (data.tier || data.type || 'BASIC').toUpperCase() as FirestoreLicense['tier'],
                    status: (data.status || 'ACTIVE').toUpperCase() as FirestoreLicense['status'],
                    userId: data.userId,
                    subscriptionId: data.subscriptionId,
                    organizationId: data.organizationId,
                    assignedToUserId: data.assignedToUserId,
                    assignedToEmail: data.assignedToEmail,
                    activatedAt: data.activatedAt?.toDate?.()?.toISOString() || data.activatedAt,
                    expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt || data.currentPeriodEnd,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
                    maxActivations: data.maxActivations || 1,
                    activationCount: data.activationCount || 0,
                    currentPeriodEnd: data.currentPeriodEnd?.toDate?.()?.toISOString() || data.currentPeriodEnd,
                    type: data.type
                });
            });
            
            console.log(`✅ [FirestoreLicenseService] Found ${licenses.length} licenses for user`);
            return licenses;
            
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Error fetching user licenses:', error);
            
            // Provide user guidance for Firebase Auth issues
            if (error && typeof error === 'object' && 'code' in error) {
                const errorCode = (error as any).code;
                const guidance = this.getFirebaseAuthGuidance(errorCode);
                console.log('💡 [FirestoreLicenseService] User guidance:', guidance);
            }
            
            return [];
        }
    }
    
    /**
     * Get licenses assigned to a specific email address
     */
    public async getLicensesByEmail(email: string): Promise<FirestoreLicense[]> {
        try {
            if (!this.isWebOnlyMode()) {
                throw new Error('FirestoreLicenseService should only be used in web-only mode');
            }
            
            console.log('🔍 [FirestoreLicenseService] Fetching licenses for email:', email);
            
            const { db } = await import('./firebase');
            
            // Query licenses by assignedToEmail
            const licensesQuery = query(
                collection(db, 'licenses'),
                where('assignedToEmail', '==', email)
            );
            
            const snapshot = await getDocs(licensesQuery);
            const licenses: FirestoreLicense[] = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                licenses.push({
                    id: doc.id,
                    key: data.key || doc.id,
                    tier: (data.tier || data.type || 'BASIC').toUpperCase() as FirestoreLicense['tier'],
                    status: (data.status || 'ACTIVE').toUpperCase() as FirestoreLicense['status'],
                    userId: data.userId,
                    subscriptionId: data.subscriptionId,
                    organizationId: data.organizationId,
                    assignedToUserId: data.assignedToUserId,
                    assignedToEmail: data.assignedToEmail,
                    activatedAt: data.activatedAt?.toDate?.()?.toISOString() || data.activatedAt,
                    expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt || data.currentPeriodEnd,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
                    maxActivations: data.maxActivations || 1,
                    activationCount: data.activationCount || 0,
                    currentPeriodEnd: data.currentPeriodEnd?.toDate?.()?.toISOString() || data.currentPeriodEnd,
                    type: data.type
                });
            });
            
            console.log(`✅ [FirestoreLicenseService] Found ${licenses.length} licenses for email`);
            return licenses;
            
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Error fetching licenses by email:', error);
            return [];
        }
    }

    /**
     * Get licenses by Firebase Auth UID
     * This is the most reliable method since it matches the authenticated user
     */
    public async getLicensesByFirebaseUid(firebaseUid: string): Promise<FirestoreLicense[]> {
        try {
            if (!this.isWebOnlyMode()) {
                throw new Error('FirestoreLicenseService should only be used in web-only mode');
            }
            
            console.log('🔍 [FirestoreLicenseService] Fetching licenses by Firebase UID:', firebaseUid);
            
            const { db } = await import('./firebase');
            
            // Query licenses by firebaseUid field (most reliable)
            const licensesQuery = query(
                collection(db, 'licenses'),
                where('firebaseUid', '==', firebaseUid)
            );
            
            const snapshot = await getDocs(licensesQuery);
            const licenses: FirestoreLicense[] = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                licenses.push({
                    id: doc.id,
                    key: data.key || doc.id,
                    tier: (data.tier || data.type || 'BASIC').toUpperCase() as FirestoreLicense['tier'],
                    status: (data.status || 'ACTIVE').toUpperCase() as FirestoreLicense['status'],
                    userId: data.userId,
                    subscriptionId: data.subscriptionId,
                    organizationId: data.organizationId,
                    assignedToUserId: data.assignedToUserId,
                    assignedToEmail: data.assignedToEmail,
                    activatedAt: data.activatedAt?.toDate?.()?.toISOString() || data.activatedAt,
                    expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt || data.currentPeriodEnd,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
                    maxActivations: data.maxActivations || 1,
                    activationCount: data.activationCount || 0,
                    currentPeriodEnd: data.currentPeriodEnd?.toDate?.()?.toISOString() || data.currentPeriodEnd,
                    type: data.type
                });
            });
            
            console.log(`✅ [FirestoreLicenseService] Found ${licenses.length} licenses by Firebase UID`);
            return licenses;
            
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Error fetching licenses by Firebase UID:', error);
            return [];
        }
    }

    /**
     * Get all licenses (admin only)
     */
    public async getAllLicenses(limit: number = 200, email?: string, password?: string): Promise<FirestoreLicense[]> {
        try {
            if (!this.isWebOnlyMode()) {
                throw new Error('FirestoreLicenseService should only be used in web-only mode');
            }
            
            console.log('🔍 [FirestoreLicenseService] Fetching all licenses (admin)');
            
            // Ensure Firebase Auth authentication if credentials provided
            if (email && password) {
                const authSuccess = await this.ensureFirebaseAuth(email, password);
                if (!authSuccess) {
                    console.warn('⚠️ [FirestoreLicenseService] Firebase Auth failed, trying without authentication');
                }
            }
            
            const { db } = await import('./firebase');
            
            // Query all licenses with limit
            const licensesQuery = query(
                collection(db, 'licenses'),
                orderBy('createdAt', 'desc'),
                firestoreLimit(limit)
            );
            
            const snapshot = await getDocs(licensesQuery);
            const licenses: FirestoreLicense[] = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                licenses.push({
                    id: doc.id,
                    key: data.key || doc.id,
                    tier: (data.tier || data.type || 'BASIC').toUpperCase() as FirestoreLicense['tier'],
                    status: (data.status || 'ACTIVE').toUpperCase() as FirestoreLicense['status'],
                    userId: data.userId,
                    subscriptionId: data.subscriptionId,
                    organizationId: data.organizationId,
                    assignedToUserId: data.assignedToUserId,
                    assignedToEmail: data.assignedToEmail,
                    activatedAt: data.activatedAt?.toDate?.()?.toISOString() || data.activatedAt,
                    expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt || data.currentPeriodEnd,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
                    maxActivations: data.maxActivations || 1,
                    activationCount: data.activationCount || 0,
                    currentPeriodEnd: data.currentPeriodEnd?.toDate?.()?.toISOString() || data.currentPeriodEnd,
                    type: data.type
                });
            });
            
            console.log(`✅ [FirestoreLicenseService] Found ${licenses.length} total licenses`);
            return licenses;
            
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Error fetching all licenses:', error);
            
            // Provide user guidance for Firebase Auth issues
            if (error && typeof error === 'object' && 'code' in error) {
                const errorCode = (error as any).code;
                const guidance = this.getFirebaseAuthGuidance(errorCode);
                console.log('💡 [FirestoreLicenseService] User guidance:', guidance);
            }
            
            return [];
        }
    }
    
    /**
     * Get all accessible licenses for the current user (fallback method)
     * This method tries to get all licenses and filters them client-side
     */
    public async getAllAccessibleLicenses(email?: string, password?: string): Promise<FirestoreLicense[]> {
        try {
            if (!this.isWebOnlyMode()) {
                throw new Error('FirestoreLicenseService should only be used in web-only mode');
            }
            
            console.log('🔍 [FirestoreLicenseService] Fetching all accessible licenses (fallback method)');
            
            // Ensure Firebase Auth authentication if credentials provided
            if (email && password) {
                const authSuccess = await this.ensureFirebaseAuth(email, password);
                if (!authSuccess) {
                    console.warn('⚠️ [FirestoreLicenseService] Firebase Auth failed, trying without authentication');
                }
            }
            
            const { db } = await import('./firebase');
            
            // Try to get all licenses (this will work if the user has read access)
            const licensesQuery = query(
                collection(db, 'licenses'),
                firestoreLimit(200)
            );
            
            const snapshot = await getDocs(licensesQuery);
            const licenses: FirestoreLicense[] = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                licenses.push({
                    id: doc.id,
                    key: data.key || doc.id,
                    tier: (data.tier || data.type || 'BASIC').toUpperCase() as FirestoreLicense['tier'],
                    status: (data.status || 'ACTIVE').toUpperCase() as FirestoreLicense['status'],
                    userId: data.userId,
                    subscriptionId: data.subscriptionId,
                    organizationId: data.organizationId,
                    assignedToUserId: data.assignedToUserId,
                    assignedToEmail: data.assignedToEmail,
                    activatedAt: data.activatedAt?.toDate?.()?.toISOString() || data.activatedAt,
                    expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt || data.currentPeriodEnd,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
                    maxActivations: data.maxActivations || 1,
                    activationCount: data.activationCount || 0,
                    currentPeriodEnd: data.currentPeriodEnd?.toDate?.()?.toISOString() || data.currentPeriodEnd,
                    type: data.type
                });
            });
            
            console.log(`✅ [FirestoreLicenseService] Found ${licenses.length} total accessible licenses`);
            return licenses;
            
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Error fetching all accessible licenses:', error);
            return [];
        }
    }

    /**
     * Get user information by Firebase UID
     * This is more reliable than getting by backend user ID
     */
    public async getUserInfoByFirebaseUid(firebaseUid: string): Promise<FirestoreUser | null> {
        try {
            const { db } = await import('./firebase');
            
            // Query users collection by firebaseUid field
            const usersQuery = query(
                collection(db, 'users'),
                where('firebaseUid', '==', firebaseUid)
            );
            
            const snapshot = await getDocs(usersQuery);
            if (snapshot.empty) {
                console.log('ℹ️ [FirestoreLicenseService] No user found with Firebase UID:', firebaseUid);
                return null;
            }
            
            const userDoc = snapshot.docs[0];
            const data = userDoc.data();
            
            return {
                id: userDoc.id,
                email: data.email,
                name: data.name,
                role: data.role,
                organizationId: data.organizationId
            };
            
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Error fetching user info by Firebase UID:', error);
            return null;
        }
    }

    /**
     * Get user information for license assignment
     */
    public async getUserInfo(userId: string): Promise<FirestoreUser | null> {
        try {
            const { db } = await import('./firebase');
            
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const data = userDoc.data();
                return {
                    id: userDoc.id,
                    email: data.email,
                    name: data.name,
                    role: data.role,
                    organizationId: data.organizationId
                };
            }
            
            return null;
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Error fetching user info:', error);
            return null;
        }
    }
    
    /**
     * Assign a license to a user by email
     */
    public async assignLicense(licenseId: string, email: string): Promise<boolean> {
        try {
            if (!this.isWebOnlyMode()) {
                throw new Error('FirestoreLicenseService should only be used in web-only mode');
            }
            
            console.log(`🔍 [FirestoreLicenseService] Assigning license ${licenseId} to ${email}`);
            
            const { db } = await import('./firebase');
            
            // First, check if this user already has a license assigned
            const existingLicensesQuery = query(
                collection(db, 'licenses'),
                where('assignedToEmail', '==', email)
            );
            
            const existingSnapshot = await getDocs(existingLicensesQuery);
            
            if (!existingSnapshot.empty) {
                const existingLicenses = existingSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                console.warn(`⚠️ [FirestoreLicenseService] User ${email} already has ${existingLicenses.length} licenses assigned`);
                
                // If the existing license is the same one we're trying to assign, that's fine
                if (existingLicenses.some(license => license.id === licenseId)) {
                    console.log(`✅ [FirestoreLicenseService] License ${licenseId} is already assigned to ${email}`);
                    return true;
                }
                
                throw new Error(`User ${email} already has a license assigned. Please unassign it first.`);
            }
            
            // Get user by email to get their ID
            const usersQuery = query(
                collection(db, 'users'),
                where('email', '==', email)
            );
            
            const usersSnapshot = await getDocs(usersQuery);
            let userId = null;
            
            if (!usersSnapshot.empty) {
                userId = usersSnapshot.docs[0].id;
            }
            
            // Update the license
            const licenseRef = doc(db, 'licenses', licenseId);
            await updateDoc(licenseRef, {
                assignedToUserId: userId || 'pending',
                assignedToEmail: email,
                assignedAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            console.log(`✅ [FirestoreLicenseService] Successfully assigned license ${licenseId} to ${email}`);
            return true;
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Failed to assign license:', error);
            throw error;
        }
    }
    
    /**
     * Get licenses for an organization (enterprise users)
     */
    public async getOrganizationLicenses(organizationId: string, email?: string, password?: string): Promise<FirestoreLicense[]> {
        try {
            console.log(`🔍 [FirestoreLicenseService] getOrganizationLicenses called with orgId: ${organizationId}`);
            
            if (!this.isWebOnlyMode()) {
                console.log('❌ [FirestoreLicenseService] Not in web-only mode, rejecting request');
                throw new Error('FirestoreLicenseService should only be used in web-only mode');
            }
            
            console.log('✅ [FirestoreLicenseService] Web-only mode confirmed');
            console.log('🔍 [FirestoreLicenseService] Fetching licenses for organization:', organizationId);
            
            // Ensure Firebase Auth authentication if credentials provided
            if (email && password) {
                const authSuccess = await this.ensureFirebaseAuth(email, password);
                if (!authSuccess) {
                    console.warn('⚠️ [FirestoreLicenseService] Firebase Auth failed, trying without authentication');
                }
            }
            
            const { db } = await import('./firebase');
            console.log('✅ [FirestoreLicenseService] Firebase imported successfully');
            
            // Query licenses by organizationId
            const licensesQuery = query(
                collection(db, 'licenses'),
                where('organizationId', '==', organizationId)
            );
            
            console.log('🔍 [FirestoreLicenseService] Executing query for organization licenses...');
            const snapshot = await getDocs(licensesQuery);
            console.log(`✅ [FirestoreLicenseService] Query completed, found ${snapshot.size} documents`);
            
            const licenses: FirestoreLicense[] = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log(`📄 [FirestoreLicenseService] Processing document ${doc.id}:`, {
                    organizationId: data.organizationId,
                    assignedToUserId: data.assignedToUserId,
                    assignedToEmail: data.assignedToEmail,
                    status: data.status
                });
                
                licenses.push({
                    id: doc.id,
                    key: data.key || doc.id,
                    tier: (data.tier || data.type || 'BASIC').toUpperCase() as FirestoreLicense['tier'],
                    status: (data.status || 'ACTIVE').toUpperCase() as FirestoreLicense['status'],
                    userId: data.userId,
                    subscriptionId: data.subscriptionId,
                    organizationId: data.organizationId,
                    assignedToUserId: data.assignedToUserId,
                    assignedToEmail: data.assignedToEmail,
                    activatedAt: data.activatedAt?.toDate?.()?.toISOString() || data.activatedAt,
                    expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt || data.currentPeriodEnd,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
                    maxActivations: data.maxActivations || 1,
                    activationCount: data.activationCount || 0,
                    currentPeriodEnd: data.currentPeriodEnd?.toDate?.()?.toISOString() || data.currentPeriodEnd,
                    type: data.type
                });
            });
            
            console.log(`✅ [FirestoreLicenseService] Found ${licenses.length} licenses for organization`);
            return licenses;
            
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Error fetching organization licenses:', error);
            
            // Provide user guidance for Firebase Auth issues
            if (error && typeof error === 'object' && 'code' in error) {
                const errorCode = (error as any).code;
                const guidance = this.getFirebaseAuthGuidance(errorCode);
                console.log('💡 [FirestoreLicenseService] User guidance:', guidance);
            }
            
            return [];
        }
    }

    /**
     * Get unassigned licenses for an organization (available for team members)
     */
    public async getUnassignedLicenses(organizationId: string, email?: string, password?: string): Promise<FirestoreLicense[]> {
        try {
            console.log(`🔍 [FirestoreLicenseService] getUnassignedLicenses called with orgId: ${organizationId}`);
            
            if (!this.isWebOnlyMode()) {
                console.log('❌ [FirestoreLicenseService] Not in web-only mode, rejecting request');
                throw new Error('FirestoreLicenseService should only be used in web-only mode');
            }
            
            console.log('✅ [FirestoreLicenseService] Web-only mode confirmed');
            console.log('🔍 [FirestoreLicenseService] Fetching unassigned licenses for organization:', organizationId);
            
            // Ensure Firebase Auth authentication if credentials provided
            if (email && password) {
                const authSuccess = await this.ensureFirebaseAuth(email, password);
                if (!authSuccess) {
                    console.warn('⚠️ [FirestoreLicenseService] Firebase Auth failed, trying without authentication');
                }
            }
            
            const { db } = await import('./firebase');
            console.log('✅ [FirestoreLicenseService] Firebase imported successfully');
            
            // Try the composite query first, but fall back to client-side filtering if it fails
            try {
                console.log('🔍 [FirestoreLicenseService] Attempting composite query...');
                const licensesQuery = query(
                    collection(db, 'licenses'),
                    where('organizationId', '==', organizationId),
                    where('assignedToUserId', '==', null)
                );
                
                console.log('🔍 [FirestoreLicenseService] Executing composite query for unassigned licenses...');
                const snapshot = await getDocs(licensesQuery);
                console.log(`✅ [FirestoreLicenseService] Composite query completed, found ${snapshot.size} documents`);
                
                const licenses: FirestoreLicense[] = [];
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    console.log(`📄 [FirestoreLicenseService] Processing document ${doc.id}:`, {
                        organizationId: data.organizationId,
                        assignedToUserId: data.assignedToUserId,
                        assignedToEmail: data.assignedToEmail,
                        status: data.status
                    });
                    
                    licenses.push({
                        id: doc.id,
                        key: data.key || doc.id,
                        tier: (data.tier || data.type || 'BASIC').toUpperCase() as FirestoreLicense['tier'],
                        status: (data.status || 'ACTIVE').toUpperCase() as FirestoreLicense['status'],
                        userId: data.userId,
                        subscriptionId: data.subscriptionId,
                        organizationId: data.organizationId,
                        assignedToUserId: data.assignedToUserId,
                        assignedToEmail: data.assignedToEmail,
                        activatedAt: data.activatedAt?.toDate?.()?.toISOString() || data.activatedAt,
                        expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt || data.currentPeriodEnd,
                        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
                        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
                        maxActivations: data.maxActivations || 1,
                        activationCount: data.activationCount || 0,
                        currentPeriodEnd: data.currentPeriodEnd?.toDate?.()?.toISOString() || data.currentPeriodEnd,
                        type: data.type
                    });
                });
                
                console.log(`✅ [FirestoreLicenseService] Found ${licenses.length} unassigned licenses for organization`);
                return licenses;
                
            } catch (compositeQueryError) {
                console.log('🔄 [FirestoreLicenseService] Composite query failed, falling back to client-side filtering...');
                console.log('📝 [FirestoreLicenseService] Composite query error:', compositeQueryError);
                
                // Fall back to getting all org licenses and filtering client-side
                const allOrgLicenses = await this.getOrganizationLicenses(organizationId, email, password);
                const unassigned = allOrgLicenses.filter(l => 
                    l.status === 'ACTIVE' && 
                    !l.assignedToUserId && 
                    !l.assignedToEmail
                );
                console.log(`✅ [FirestoreLicenseService] Client-side filtering found ${unassigned.length} unassigned licenses`);
                return unassigned;
            }
            
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Error fetching unassigned licenses:', error);
            
            // If the composite query fails, fall back to getting all org licenses and filtering client-side
            try {
                console.log('🔄 [FirestoreLicenseService] Final fallback to client-side filtering...');
                const allOrgLicenses = await this.getOrganizationLicenses(organizationId, email, password);
                const unassigned = allOrgLicenses.filter(l => 
                    l.status === 'ACTIVE' && 
                    !l.assignedToUserId && 
                    !l.assignedToEmail
                );
                console.log(`✅ [FirestoreLicenseService] Final fallback found ${unassigned.length} unassigned licenses`);
                return unassigned;
            } catch (fallbackError) {
                console.error('❌ [FirestoreLicenseService] Final fallback also failed:', fallbackError);
                return [];
            }
        }
    }

    /**
     * Get all unassigned licenses (available for any organization)
     */
    public async getAllUnassignedLicenses(email?: string, password?: string): Promise<FirestoreLicense[]> {
        try {
            if (!this.isWebOnlyMode()) {
                throw new Error('FirestoreLicenseService should only be used in web-only mode');
            }
            
            console.log('🔍 [FirestoreLicenseService] Fetching all unassigned licenses');
            
            // Ensure Firebase Auth authentication if credentials provided
            if (email && password) {
                const authSuccess = await this.ensureFirebaseAuth(email, password);
                if (!authSuccess) {
                    console.warn('⚠️ [FirestoreLicenseService] Firebase Auth failed, trying without authentication');
                }
            }
            
            const { db } = await import('./firebase');
            
            // Try to query for unassigned licenses directly
            try {
                const licensesQuery = query(
                    collection(db, 'licenses'),
                    where('assignedToUserId', '==', null)
                );
                
                const snapshot = await getDocs(licensesQuery);
                const licenses: FirestoreLicense[] = [];
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    licenses.push({
                        id: doc.id,
                        key: data.key || doc.id,
                        tier: (data.tier || data.type || 'BASIC').toUpperCase() as FirestoreLicense['tier'],
                        status: (data.status || 'ACTIVE').toUpperCase() as FirestoreLicense['status'],
                        userId: data.userId,
                        subscriptionId: data.subscriptionId,
                        organizationId: data.organizationId,
                        assignedToUserId: data.assignedToUserId,
                        assignedToEmail: data.assignedToEmail,
                        activatedAt: data.activatedAt?.toDate?.()?.toISOString() || data.activatedAt,
                        expiresAt: data.expiresAt?.toDate?.()?.toISOString() || data.expiresAt || data.currentPeriodEnd,
                        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString(),
                        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt || new Date().toISOString(),
                        maxActivations: data.maxActivations || 1,
                        activationCount: data.activationCount || 0,
                        currentPeriodEnd: data.currentPeriodEnd?.toDate?.()?.toISOString() || data.currentPeriodEnd,
                        type: data.type
                    });
                });
                
                console.log(`✅ [FirestoreLicenseService] Found ${licenses.length} total unassigned licenses`);
                return licenses;
                
            } catch (queryError) {
                console.log('🔄 [FirestoreLicenseService] Direct query failed, using fallback method...');
                // Fall back to getting all licenses and filtering client-side
                const allLicenses = await this.getAllAccessibleLicenses(email, password);
                const unassigned = allLicenses.filter(l => 
                    l.status === 'ACTIVE' && 
                    !l.assignedToUserId && 
                    !l.assignedToEmail
                );
                console.log(`✅ [FirestoreLicenseService] Fallback found ${unassigned.length} unassigned licenses`);
                return unassigned;
            }
            
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Error fetching all unassigned licenses:', error);
            return [];
        }
    }
    
    /**
     * Unassign a license from a user
     */
    public async unassignLicense(licenseId: string): Promise<boolean> {
        try {
            if (!this.isWebOnlyMode()) {
                throw new Error('FirestoreLicenseService should only be used in web-only mode');
            }
            
            console.log(`🔍 [FirestoreLicenseService] Unassigning license ${licenseId}`);
            
            const { db } = await import('./firebase');
            
            // Get the license first to check if it's assigned
            const licenseRef = doc(db, 'licenses', licenseId);
            const licenseDoc = await getDoc(licenseRef);
            
            if (!licenseDoc.exists()) {
                console.warn(`⚠️ [FirestoreLicenseService] License ${licenseId} not found`);
                throw new Error(`License ${licenseId} not found`);
            }
            
            const licenseData = licenseDoc.data();
            
            // Check if license is assigned
            if (!licenseData.assignedToUserId && !licenseData.assignedToEmail) {
                console.log(`ℹ️ [FirestoreLicenseService] License ${licenseId} is not assigned to anyone`);
                return true; // Already unassigned
            }
            
            // Log who the license is being unassigned from
            console.log(`🔍 [FirestoreLicenseService] Unassigning license ${licenseId} from ${licenseData.assignedToEmail || 'unknown user'}`);
            
            // Update the license to remove assignment
            await updateDoc(licenseRef, {
                assignedToUserId: null,
                assignedToEmail: null,
                assignedAt: null,
                updatedAt: serverTimestamp()
            });
            
            console.log(`✅ [FirestoreLicenseService] Successfully unassigned license ${licenseId}`);
            return true;
        } catch (error) {
            console.error('❌ [FirestoreLicenseService] Failed to unassign license:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const firestoreLicenseService = FirestoreLicenseService.getInstance();

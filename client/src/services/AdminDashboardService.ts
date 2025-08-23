/**
 * Admin Dashboard Service for WebOnly Mode
 * 
 * Provides direct Firestore access for admin functions when in webonly production mode.
 * Falls back to API endpoints when not in webonly mode.
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
  Timestamp,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db, isWebOnlyMode } from './firebase';
import { api, endpoints } from './api';
import { firestoreCollectionManager, COLLECTIONS } from './FirestoreCollectionManager';

// Admin Dashboard Interfaces
export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  pendingApprovals: number;
  systemHealth: 'healthy' | 'warning' | 'error';
  recentPayments?: any[];
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  role: string;
  status: string;
  subscription?: string;
  lastLogin: string;
  createdAt: string;
  subscriptions?: any[];
}

export interface AdminPayment {
  id: string;
  amount: number;
  status: string;
  createdAt: any;
  user?: {
    email: string;
    name?: string;
  };
  subscription?: {
    tier: string;
  };
}

export interface AdminLicense {
  id: string;
  key: string;
  userId: string;
  userEmail: string;
  tier: string;
  status: 'active' | 'inactive' | 'expired' | 'revoked';
  activatedAt: string;
  expiresAt: string;
  lastUsed: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy' | 'disabled';
  checkedAt?: string;
  database: {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'disabled';
    responseTimeMs?: number;
    error?: string;
    message?: string;
  };
  email: {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'disabled';
    responseTimeMs?: number;
    error?: string;
    message?: string;
  };
  payment: {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'disabled';
    responseTimeMs?: number;
    error?: string;
    message?: string;
  };
}

export class AdminDashboardService {
  
  /**
   * Check if we're in webonly mode
   */
  private static isWebOnlyMode(): boolean {
    return isWebOnlyMode();
  }

  /**
   * Get admin dashboard statistics
   */
  static async getDashboardStats(): Promise<AdminStats> {
    const webOnlyMode = this.isWebOnlyMode();
    console.log(`🔍 [AdminDashboardService] Mode detection: webOnlyMode=${webOnlyMode}, hostname=${window.location.hostname}`);
    
    if (webOnlyMode) {
      console.log('📊 [AdminDashboardService] Using Firestore direct access (webonly mode)');
      return this.getDashboardStatsFromFirestore();
    } else {
      console.log('🌐 [AdminDashboardService] Using API endpoints (non-webonly mode)');
      return this.getDashboardStatsFromAPI();
    }
  }

  /**
   * Get dashboard stats from Firestore (webonly mode)
   */
  private static async getDashboardStatsFromFirestore(): Promise<AdminStats> {
    try {
      // Getting dashboard stats from Firestore...

      // Get total users
      const usersQuery = query(collection(db, COLLECTIONS.USERS));
      const usersSnapshot = await getDocs(usersQuery);
      const totalUsers = usersSnapshot.size;

      // Get active subscriptions
      const subscriptionsQuery = query(
        collection(db, COLLECTIONS.SUBSCRIPTIONS),
        where('status', '==', 'ACTIVE')
      );
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
      const activeSubscriptions = subscriptionsSnapshot.size;

      // Get recent payments and calculate total revenue from both PAYMENTS and INVOICES collections
      let totalRevenue = 0;
      const recentPayments: any[] = [];
      
      // Get payments from PAYMENTS collection
      try {
        const paymentsQuery = query(
          collection(db, COLLECTIONS.PAYMENTS),
          where('status', '==', 'succeeded'),
          orderBy('createdAt', 'desc'),
          firestoreLimit(10)
        );
        const paymentsSnapshot = await getDocs(paymentsQuery);
        
        paymentsSnapshot.forEach(doc => {
          const paymentData = doc.data();
          const payment = { id: doc.id, ...paymentData };
          recentPayments.push(payment);
          if (paymentData.amount && typeof paymentData.amount === 'number') {
            totalRevenue += paymentData.amount;
          }
        });
      } catch (error) {
        console.warn('⚠️ [AdminDashboardService] Could not fetch from PAYMENTS collection:', error);
      }
      
      // Get invoices from INVOICES collection
      try {
        const invoicesQuery = query(
          collection(db, COLLECTIONS.INVOICES),
          orderBy('createdAt', 'desc'),
          firestoreLimit(10)
        );
        const invoicesSnapshot = await getDocs(invoicesQuery);
        
        invoicesSnapshot.forEach(doc => {
          const invoice = { id: doc.id, ...doc.data() };
          recentPayments.push(invoice);
          // Include all invoices in recent payments, regardless of status
        });
      } catch (error) {
        console.warn('⚠️ [AdminDashboardService] Could not fetch from INVOICES collection:', error);
      }
      
      // Get all payments for total revenue calculation (avoid double counting with invoices)
      totalRevenue = 0; // Reset and recalculate
      
      // Sum all successful payments (primary source for revenue)
      try {
        const allPaymentsQuery = query(
          collection(db, COLLECTIONS.PAYMENTS),
          where('status', '==', 'succeeded')
        );
        const allPaymentsSnapshot = await getDocs(allPaymentsQuery);
        
        allPaymentsSnapshot.forEach(doc => {
          const payment = doc.data();
          if (payment.amount && typeof payment.amount === 'number') {
            totalRevenue += payment.amount;
          }
        });
        
        console.log(`💰 [AdminDashboardService] Revenue from ${allPaymentsSnapshot.size} payments: $${totalRevenue}`);
      } catch (error) {
        console.warn('⚠️ [AdminDashboardService] Could not fetch all payments:', error);
        
        // Fallback to invoices if payments collection is not available
        try {
          const allInvoicesQuery = query(
            collection(db, COLLECTIONS.INVOICES),
            where('status', '==', 'succeeded')
          );
          const allInvoicesSnapshot = await getDocs(allInvoicesQuery);
          
          allInvoicesSnapshot.forEach(doc => {
            const invoice = doc.data();
            if (invoice.amount && typeof invoice.amount === 'number') {
              totalRevenue += invoice.amount;
            }
          });
          
          console.log(`💰 [AdminDashboardService] Fallback revenue from ${allInvoicesSnapshot.size} invoices: $${totalRevenue}`);
        } catch (invoiceError) {
          console.warn('⚠️ [AdminDashboardService] Could not fetch invoices either:', invoiceError);
        }
      }

      // Revenue is already in dollars, no conversion needed
      // totalRevenue = totalRevenue / 100;

      // Dashboard stats retrieved from Firestore
      
      return {
        totalUsers,
        activeSubscriptions,
        totalRevenue,
        pendingApprovals: 0, // TODO: Implement if needed
        systemHealth: 'healthy',
        recentPayments
      };
    } catch (error) {
      console.error('Error getting dashboard stats from Firestore:', error);
      return {
        totalUsers: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        systemHealth: 'error'
      };
    }
  }

  /**
   * Get dashboard stats from API (non-webonly mode)
   */
  private static async getDashboardStatsFromAPI(): Promise<AdminStats> {
    try {
      const response = await api.get(endpoints.admin.dashboardStats());
      const stats = response.data?.data?.stats || {};
      
      console.log('🌐 [AdminDashboardService] Raw API response:', JSON.stringify(stats, null, 2));
      console.log(`💰 [AdminDashboardService] API totalRevenue: ${stats.totalRevenue} (type: ${typeof stats.totalRevenue})`);
      
      const result = {
        totalUsers: stats.totalUsers || 0,
        activeSubscriptions: stats.activeSubscriptions || 0,
        totalRevenue: (stats.totalRevenue || 0), // Revenue is already in dollars
        pendingApprovals: stats.pendingApprovals || 0,
        systemHealth: stats.systemHealth || 'healthy',
        recentPayments: stats.recentPayments || []
      };
      
      console.log('📊 [AdminDashboardService] Processed API result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('❌ [AdminDashboardService] Error getting dashboard stats from API:', error);
      throw error;
    }
  }

  /**
   * Get all users for admin management
   */
  static async getUsers(page: number = 1, limit: number = 100): Promise<{ users: AdminUser[]; pagination?: any }> {
    if (this.isWebOnlyMode()) {
      return this.getUsersFromFirestore(page, limit);
    } else {
      return this.getUsersFromAPI(page, limit);
    }
  }

  /**
   * Get users from Firestore (webonly mode)
   */
  private static async getUsersFromFirestore(page: number, limit: number): Promise<{ users: AdminUser[]; pagination?: any }> {
    try {
      // Getting users from Firestore...

      // Get users with pagination
      let usersQuery = query(
        collection(db, COLLECTIONS.USERS),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limit)
      );

      // Add pagination if not first page
      if (page > 1) {
        // For simplicity, we'll skip pagination cursor logic for now
        // In production, you'd want to implement proper cursor-based pagination
      }

      const usersSnapshot = await getDocs(usersQuery);
      const users: AdminUser[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        // Get user's subscriptions
        const subscriptionsQuery = query(
          collection(db, COLLECTIONS.SUBSCRIPTIONS),
          where('userId', '==', userDoc.id),
          where('status', '==', 'ACTIVE')
        );
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        
        const subscriptions: any[] = [];
        subscriptionsSnapshot.forEach(subDoc => {
          subscriptions.push({ id: subDoc.id, ...subDoc.data() });
        });

        const user: AdminUser = {
          id: userDoc.id,
          email: userData.email || '',
          firstName: userData.firstName || userData.name?.split(' ')[0] || '',
          lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
          name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          role: userData.role || 'USER',
          status: userData.status || 'active',
          subscription: subscriptions[0]?.tier,
          lastLogin: userData.lastLoginAt || userData.updatedAt || userData.createdAt,
          createdAt: userData.createdAt,
          subscriptions
        };

        users.push(user);
      }

      // Users retrieved from Firestore
      
      return {
        users,
        pagination: {
          page,
          limit,
          total: users.length,
          pages: 1 // Simplified for now
        }
      };
    } catch (error) {
      console.error('Error getting users from Firestore:', error);
      return { users: [] };
    }
  }

  /**
   * Get users from API (non-webonly mode)
   */
  private static async getUsersFromAPI(page: number, limit: number): Promise<{ users: AdminUser[]; pagination?: any }> {
    try {
      const response = await api.get(`${endpoints.admin.users()}?page=${page}&limit=${limit}`);
      const usersData = response.data?.data?.users || [];
      const pagination = response.data?.data?.pagination;

      const users: AdminUser[] = usersData.map((u: any) => ({
        id: u.id,
        email: u.email,
        firstName: u.name?.split(' ')[0] || '',
        lastName: u.name?.split(' ').slice(1).join(' ') || '',
        name: u.name,
        role: u.role,
        status: u.status?.toLowerCase() || 'active',
        subscription: u.subscriptions?.[0]?.tier,
        lastLogin: u.lastLoginAt || new Date().toISOString(),
        createdAt: u.createdAt || new Date().toISOString(),
        subscriptions: u.subscriptions || []
      }));

      return { users, pagination };
    } catch (error) {
      console.error('❌ [AdminDashboardService] Error getting users from API:', error);
      throw error;
    }
  }

  /**
   * Get user details including subscriptions and licenses
   */
  static async getUserDetails(userId: string): Promise<{ user: AdminUser; subscriptions: any[]; licenses: AdminLicense[] }> {
    if (this.isWebOnlyMode()) {
      return this.getUserDetailsFromFirestore(userId);
    } else {
      return this.getUserDetailsFromAPI(userId);
    }
  }

  /**
   * Get user details from Firestore (webonly mode)
   */
  private static async getUserDetailsFromFirestore(userId: string): Promise<{ user: AdminUser; subscriptions: any[]; licenses: AdminLicense[] }> {
    try {
      console.log('🔍 [AdminDashboardService] Getting user details from Firestore:', userId);

      // Get user document
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      
      // Get user's subscriptions
      const subscriptionsQuery = query(
        collection(db, COLLECTIONS.SUBSCRIPTIONS),
        where('userId', '==', userId)
      );
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
      
      const subscriptions: any[] = [];
      subscriptionsSnapshot.forEach(subDoc => {
        subscriptions.push({ id: subDoc.id, ...subDoc.data() });
      });

      // Get user's licenses
      const licensesQuery = query(
        collection(db, COLLECTIONS.LICENSES),
        where('userId', '==', userId)
      );
      const licensesSnapshot = await getDocs(licensesQuery);
      
      const licenses: AdminLicense[] = [];
      licensesSnapshot.forEach(licenseDoc => {
        const licenseData = licenseDoc.data();
        licenses.push({
          id: licenseDoc.id,
          key: licenseData.key || '',
          userId: licenseData.userId || userId,
          userEmail: userData.email || '',
          tier: licenseData.tier || 'BASIC',
          status: licenseData.status || 'active',
          activatedAt: licenseData.activatedAt || licenseData.createdAt,
          expiresAt: licenseData.expiresAt || licenseData.createdAt,
          lastUsed: licenseData.updatedAt || licenseData.createdAt
        });
      });

      const user: AdminUser = {
        id: userDoc.id,
        email: userData.email || '',
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        role: userData.role || 'USER',
        status: userData.status || 'active',
        subscription: subscriptions[0]?.tier,
        lastLogin: userData.lastLoginAt || userData.updatedAt || userData.createdAt,
        createdAt: userData.createdAt,
        subscriptions
      };

      console.log('✅ [AdminDashboardService] User details retrieved from Firestore');
      
      return { user, subscriptions, licenses };
    } catch (error) {
      console.error('❌ [AdminDashboardService] Error getting user details from Firestore:', error);
      throw error;
    }
  }

  /**
   * Get user details from API (non-webonly mode)
   */
  private static async getUserDetailsFromAPI(userId: string): Promise<{ user: AdminUser; subscriptions: any[]; licenses: AdminLicense[] }> {
    try {
      const response = await api.get(endpoints.admin.userDetails(userId));
      const data = response.data?.data || {};
      
      const userData = data.user || {};
      const subscriptions = data.user?.subscriptions || [];
      const licenses = (data.user?.licenses || []).map((l: any) => ({
        id: l.id,
        key: l.key,
        userId: l.userId || userId,
        userEmail: userData.email,
        tier: l.tier,
        status: l.status,
        activatedAt: l.activatedAt || l.createdAt,
        expiresAt: l.expiresAt || l.createdAt,
        lastUsed: l.updatedAt || l.createdAt
      }));

      const user: AdminUser = {
        id: userData.id || userId,
        email: userData.email || '',
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName: userData.lastName || userData.name?.split(' ').slice(1).join(' ') || '',
        name: userData.name,
        role: userData.role || 'USER',
        status: userData.status?.toLowerCase() || 'active',
        subscription: subscriptions[0]?.tier,
        lastLogin: userData.lastLoginAt || new Date().toISOString(),
        createdAt: userData.createdAt || new Date().toISOString(),
        subscriptions
      };

      return { user, subscriptions, licenses };
    } catch (error) {
      console.error('❌ [AdminDashboardService] Error getting user details from API:', error);
      throw error;
    }
  }

  /**
   * Update user information
   */
  static async updateUser(userId: string, updates: { role?: string; status?: string }): Promise<void> {
    if (this.isWebOnlyMode()) {
      return this.updateUserInFirestore(userId, updates);
    } else {
      return this.updateUserViaAPI(userId, updates);
    }
  }

  /**
   * Update user in Firestore (webonly mode)
   */
  private static async updateUserInFirestore(userId: string, updates: { role?: string; status?: string }): Promise<void> {
    try {
      console.log('🔍 [AdminDashboardService] Updating user in Firestore:', userId, updates);

      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const updateData: any = {
        updatedAt: Timestamp.now()
      };

      if (updates.role) {
        updateData.role = updates.role;
      }
      if (updates.status) {
        updateData.status = updates.status.toLowerCase();
      }

      await updateDoc(userRef, updateData);
      
      console.log('✅ [AdminDashboardService] User updated in Firestore');
    } catch (error) {
      console.error('❌ [AdminDashboardService] Error updating user in Firestore:', error);
      throw error;
    }
  }

  /**
   * Update user via API (non-webonly mode)
   */
  private static async updateUserViaAPI(userId: string, updates: { role?: string; status?: string }): Promise<void> {
    try {
      await api.put(endpoints.admin.updateUser(userId), {
        role: updates.role,
        status: updates.status?.toUpperCase()
      });
    } catch (error) {
      console.error('❌ [AdminDashboardService] Error updating user via API:', error);
      throw error;
    }
  }

  /**
   * Get payments for admin review
   */
  static async getPayments(page: number = 1, limit: number = 100, filters?: any): Promise<{ payments: AdminPayment[]; pagination?: any }> {
    if (this.isWebOnlyMode()) {
      return this.getPaymentsFromFirestore(page, limit, filters);
    } else {
      return this.getPaymentsFromAPI(page, limit, filters);
    }
  }

  /**
   * Get payments from Firestore (webonly mode)
   */
  private static async getPaymentsFromFirestore(page: number, limit: number, filters?: any): Promise<{ payments: AdminPayment[]; pagination?: any }> {
    try {
      console.log('🔍 [AdminDashboardService] Getting payments from Firestore...');

      const allPayments: AdminPayment[] = [];
      
      // Get payments from PAYMENTS collection
      try {
        let paymentsQuery = query(
          collection(db, COLLECTIONS.PAYMENTS),
          orderBy('createdAt', 'desc'),
          firestoreLimit(limit)
        );

        // Apply filters if provided
        if (filters?.status) {
          paymentsQuery = query(paymentsQuery, where('status', '==', filters.status));
        }

        const paymentsSnapshot = await getDocs(paymentsQuery);
        
        for (const paymentDoc of paymentsSnapshot.docs) {
          const paymentData = paymentDoc.data();
          
          // Get user information if userId is available
          let user: any = {};
          if (paymentData.userId) {
            try {
              const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, paymentData.userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                user = {
                  email: userData.email,
                  name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
                };
              }
            } catch (error) {
              console.warn('Could not fetch user data for payment:', paymentDoc.id);
            }
          }

          const payment: AdminPayment = {
            id: paymentDoc.id,
            amount: paymentData.amount || 0,
            status: paymentData.status || 'unknown',
            createdAt: paymentData.createdAt,
            user,
            subscription: paymentData.subscription || {}
          };

          allPayments.push(payment);
        }
        
        console.log('✅ [AdminDashboardService] Payments retrieved from PAYMENTS collection:', paymentsSnapshot.size);
      } catch (error) {
        console.warn('⚠️ [AdminDashboardService] Could not fetch from PAYMENTS collection:', error);
      }
      
      // Note: Invoices collection is not fetched here as payments represent actual money received
      // Invoices are for billing purposes and may not have complete subscription/tier data
      console.log('ℹ️ [AdminDashboardService] Skipping INVOICES collection - using PAYMENTS only for accurate data');
      
      // Sort all payments by creation date
      allPayments.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPayments = allPayments.slice(startIndex, endIndex);

      console.log('✅ [AdminDashboardService] Total payments/invoices retrieved:', allPayments.length);
      
      return {
        payments: paginatedPayments,
        pagination: {
          page,
          limit,
          total: allPayments.length,
          pages: Math.ceil(allPayments.length / limit)
        }
      };
    } catch (error) {
      console.error('❌ [AdminDashboardService] Error getting payments from Firestore:', error);
      return { payments: [] };
    }
  }

  /**
   * Get payments from API (non-webonly mode)
   */
  private static async getPaymentsFromAPI(page: number, limit: number, filters?: any): Promise<{ payments: AdminPayment[]; pagination?: any }> {
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      
      if (filters?.status) params.set('status', filters.status);
      if (filters?.email) params.set('email', filters.email);
      if (filters?.from) params.set('from', filters.from);
      if (filters?.to) params.set('to', filters.to);

      const response = await api.get(`${endpoints.admin.payments()}?${params.toString()}`);
      const paymentsData = response.data?.data?.payments || [];
      const pagination = response.data?.data?.pagination;

      const payments: AdminPayment[] = paymentsData.map((p: any) => ({
        id: p.id,
        amount: p.amount || 0,
        status: p.status || 'unknown',
        createdAt: p.createdAt,
        user: p.user || {},
        subscription: p.subscription || {}
      }));

      return { payments, pagination };
    } catch (error) {
      console.error('❌ [AdminDashboardService] Error getting payments from API:', error);
      throw error;
    }
  }

  /**
   * Get system health status
   */
  static async getSystemHealth(): Promise<SystemHealth> {
    if (this.isWebOnlyMode()) {
      return this.getSystemHealthFromFirestore();
    } else {
      return this.getSystemHealthFromAPI();
    }
  }

  /**
   * Get system health from Firestore (webonly mode)
   */
  private static async getSystemHealthFromFirestore(): Promise<SystemHealth> {
    try {
      console.log('🔍 [AdminDashboardService] Checking system health from Firestore...');

      // Test database connectivity
      const startTime = Date.now();
      const testQuery = query(collection(db, COLLECTIONS.USERS), firestoreLimit(1));
      await getDocs(testQuery);
      const dbResponseTime = Date.now() - startTime;

      const health: SystemHealth = {
        overall: 'healthy',
        checkedAt: new Date().toISOString(),
        database: {
          status: dbResponseTime < 1000 ? 'healthy' : dbResponseTime < 3000 ? 'degraded' : 'unhealthy',
          responseTimeMs: dbResponseTime,
          message: `Database responding in ${dbResponseTime}ms`
        },
        email: {
          status: 'healthy', // Assume healthy in webonly mode
          message: 'Email service status unknown in webonly mode'
        },
        payment: {
          status: 'healthy', // Assume healthy in webonly mode
          message: 'Payment service status unknown in webonly mode'
        }
      };

      // Determine overall health
      const statuses = [health.database.status, health.email.status, health.payment.status];
      if (statuses.includes('unhealthy')) {
        health.overall = 'unhealthy';
      } else if (statuses.includes('degraded')) {
        health.overall = 'degraded';
      }

      console.log('✅ [AdminDashboardService] System health checked from Firestore');
      return health;
    } catch (error) {
      console.error('❌ [AdminDashboardService] Error checking system health from Firestore:', error);
      return {
        overall: 'unhealthy',
        checkedAt: new Date().toISOString(),
        database: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        email: {
          status: 'disabled',
          message: 'Cannot check email service in webonly mode'
        },
        payment: {
          status: 'disabled',
          message: 'Cannot check payment service in webonly mode'
        }
      };
    }
  }

  /**
   * Get system health from API (non-webonly mode)
   */
  private static async getSystemHealthFromAPI(): Promise<SystemHealth> {
    try {
      const response = await api.get(endpoints.admin.systemHealth());
      const healthData = response.data?.data?.health || response.data?.data;
      
      return {
        overall: healthData?.overall || healthData?.status || 'healthy',
        checkedAt: healthData?.checkedAt || new Date().toISOString(),
        database: healthData?.database || { status: 'healthy' },
        email: healthData?.email || { status: 'healthy' },
        payment: healthData?.payment || { status: 'healthy' }
      };
    } catch (error) {
      console.error('❌ [AdminDashboardService] Error getting system health from API:', error);
      throw error;
    }
  }

  /**
   * Get payment details
   */
  static async getPaymentDetails(paymentId: string): Promise<{ payment: AdminPayment; licenses: AdminLicense[] }> {
    if (this.isWebOnlyMode()) {
      return this.getPaymentDetailsFromFirestore(paymentId);
    } else {
      return this.getPaymentDetailsFromAPI(paymentId);
    }
  }

  /**
   * Get payment details from Firestore (webonly mode)
   */
  private static async getPaymentDetailsFromFirestore(paymentId: string): Promise<{ payment: AdminPayment; licenses: AdminLicense[] }> {
    try {
      console.log('🔍 [AdminDashboardService] Getting payment details from Firestore:', paymentId);

      // Get payment document
      const paymentDoc = await getDoc(doc(db, COLLECTIONS.PAYMENTS, paymentId));
      if (!paymentDoc.exists()) {
        throw new Error('Payment not found');
      }

      const paymentData = paymentDoc.data();
      
      // Get user information
      let user: any = {};
      if (paymentData.userId) {
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, paymentData.userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          user = {
            email: userData.email,
            name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
          };
        }
      }

      const payment: AdminPayment = {
        id: paymentDoc.id,
        amount: paymentData.amount || 0,
        status: paymentData.status || 'unknown',
        createdAt: paymentData.createdAt,
        user,
        subscription: paymentData.subscription || {}
      };

      // Get related licenses (if any)
      const licenses: AdminLicense[] = [];
      if (paymentData.userId) {
        const licensesQuery = query(
          collection(db, COLLECTIONS.LICENSES),
          where('userId', '==', paymentData.userId)
        );
        const licensesSnapshot = await getDocs(licensesQuery);
        
        licensesSnapshot.forEach(licenseDoc => {
          const licenseData = licenseDoc.data();
          licenses.push({
            id: licenseDoc.id,
            key: licenseData.key || '',
            userId: licenseData.userId || paymentData.userId,
            userEmail: user.email || '',
            tier: licenseData.tier || 'BASIC',
            status: licenseData.status || 'active',
            activatedAt: licenseData.activatedAt || licenseData.createdAt,
            expiresAt: licenseData.expiresAt || licenseData.createdAt,
            lastUsed: licenseData.updatedAt || licenseData.createdAt
          });
        });
      }

      console.log('✅ [AdminDashboardService] Payment details retrieved from Firestore');
      return { payment, licenses };
    } catch (error) {
      console.error('❌ [AdminDashboardService] Error getting payment details from Firestore:', error);
      throw error;
    }
  }

  /**
   * Get payment details from API (non-webonly mode)
   */
  private static async getPaymentDetailsFromAPI(paymentId: string): Promise<{ payment: AdminPayment; licenses: AdminLicense[] }> {
    try {
      const response = await api.get(endpoints.admin.paymentDetails(paymentId));
      const data = response.data?.data || {};
      
      const payment: AdminPayment = {
        id: data.payment?.id || paymentId,
        amount: data.payment?.amount || 0,
        status: data.payment?.status || 'unknown',
        createdAt: data.payment?.createdAt,
        user: data.payment?.user || {},
        subscription: data.payment?.subscription || {}
      };

      const licenses: AdminLicense[] = (data.licenses || []).map((l: any) => ({
        id: l.id,
        key: l.key,
        userId: l.userId,
        userEmail: l.userEmail || payment.user?.email || '',
        tier: l.tier,
        status: l.status,
        activatedAt: l.activatedAt || l.createdAt,
        expiresAt: l.expiresAt || l.createdAt,
        lastUsed: l.updatedAt || l.createdAt
      }));

      return { payment, licenses };
    } catch (error) {
      console.error('❌ [AdminDashboardService] Error getting payment details from API:', error);
      throw error;
    }
  }
}

export default AdminDashboardService;

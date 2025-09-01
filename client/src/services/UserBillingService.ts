import { db } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit as limit,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const COLLECTIONS = {
  USERS: 'users',
  PAYMENTS: 'payments',
  INVOICES: 'invoices',
  SUBSCRIPTIONS: 'subscriptions',
  LICENSES: 'licenses',
} as const;

export interface UserInvoice {
  id: string;
  stripeInvoiceId?: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'succeeded' | 'cancelled' | 'refunded';
  description: string;
  downloadUrl?: string;
  receiptUrl?: string;
  currency?: string;
  createdAt?: string;
  subscription?: {
    tier?: string;
    seats?: number;
  };
}

export interface UserSubscription {
  id: string;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  seats: number;
  amount: number;
  nextPaymentDate: string;
  tier?: string;
}

export class UserBillingService {
  private static getCurrentUserId(): string | null {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    console.log('🔍 [UserBillingService] Auth state:', { 
      hasAuth: !!auth, 
      currentUser: currentUser ? { uid: currentUser.uid, email: currentUser.email } : null 
    });
    
    if (!currentUser) {
      console.warn('⚠️ [UserBillingService] No authenticated user found');
      return null;
    }
    
    console.log('✅ [UserBillingService] Current user ID:', currentUser.uid);
    return currentUser.uid;
  }

  /**
   * Get current user's subscription
   */
  static async getCurrentUserSubscription(): Promise<UserSubscription | null> {
    try {
      const firebaseUid = this.getCurrentUserId();
      if (!firebaseUid) {
        throw new Error('No authenticated user');
      }

      console.log('🔍 [UserBillingService] Getting subscription for Firebase UID:', firebaseUid);

      // Query subscriptions directly by firebaseUid (most reliable method)
      const subscriptionsQuery = query(
        collection(db, COLLECTIONS.SUBSCRIPTIONS),
        where('firebaseUid', '==', firebaseUid),
        limit(10)
      );

      const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
      console.log(`📋 [UserBillingService] Found ${subscriptionsSnapshot.size} subscriptions for Firebase UID: ${firebaseUid}`);

      if (subscriptionsSnapshot.empty) {
        console.log('ℹ️ [UserBillingService] No subscriptions found for Firebase UID');
        return null;
      }

      // Get the first (primary) subscription
      const subDoc = subscriptionsSnapshot.docs[0];
      const subData = subDoc.data();
      console.log('📊 [UserBillingService] Subscription data:', subData);

      const userSubscription: UserSubscription = {
        id: subDoc.id,
        plan: (subData.tier?.toUpperCase() || 'PRO') as any,
        status: (subData.status?.toLowerCase() || 'active') as any,
        currentPeriodStart: subData.currentPeriodStart || subData.createdAt,
        currentPeriodEnd: subData.currentPeriodEnd || subData.createdAt,
        seats: subData.seats || 1,
        amount: subData.amount || 0,
        nextPaymentDate: subData.currentPeriodEnd || subData.createdAt,
        tier: subData.tier,
      };

      console.log('✅ [UserBillingService] Subscription found and mapped:', userSubscription);
      return userSubscription;

    } catch (error) {
      console.error('❌ [UserBillingService] Error getting user subscription:', error);
      return null;
    }
  }

  /**
   * Get current user's billing history (payments and invoices)
   */
  static async getCurrentUserBillingHistory(options: { limit?: number } = {}): Promise<UserInvoice[]> {
    try {
      const firebaseUid = this.getCurrentUserId();
      if (!firebaseUid) {
        throw new Error('No authenticated user');
      }

      const limitCount = options.limit || 25;
      console.log('🔍 [UserBillingService] Getting billing history for Firebase UID:', firebaseUid);

      const allInvoices: UserInvoice[] = [];

      // Get payments from PAYMENTS collection by firebaseUid
      try {
        let paymentsQuery = query(
          collection(db, COLLECTIONS.PAYMENTS),
          where('firebaseUid', '==', firebaseUid),
          limit(limitCount)
        );

        const paymentsSnapshot = await getDocs(paymentsQuery);
        console.log(`💳 [UserBillingService] Found ${paymentsSnapshot.size} payments for Firebase UID: ${firebaseUid}`);

        // Process payments
        for (const paymentDoc of paymentsSnapshot.docs) {
          const paymentData = paymentDoc.data();
          console.log('🔍 [UserBillingService] Raw payment data amount:', {
            id: paymentDoc.id,
            rawAmount: paymentData.amount,
            type: typeof paymentData.amount
          });
          
          const invoice: UserInvoice = {
            id: paymentDoc.id,
            stripeInvoiceId: paymentData.stripeInvoiceId,
            number: paymentData.stripeInvoiceId || `PAY-${paymentDoc.id.substring(0, 8).toUpperCase()}`,
            date: paymentData.createdAt?.toDate?.()?.toISOString() || paymentData.createdAt,
            amount: paymentData.amount || 0,
            status: paymentData.status?.toLowerCase() || 'pending',
            description: paymentData.description || `${paymentData.subscription?.tier || 'Subscription'} Plan - ${paymentData.subscription?.seats || 1} seat(s)`,
            downloadUrl: paymentData.receiptUrl,
            receiptUrl: paymentData.receiptUrl,
            currency: paymentData.currency || 'USD',
            createdAt: paymentData.createdAt?.toDate?.()?.toISOString() || paymentData.createdAt,
            subscription: paymentData.subscription,
          };

          allInvoices.push(invoice);
        }

        console.log(`✅ [UserBillingService] Processed ${allInvoices.length} payments`);
      } catch (error) {
        console.warn('⚠️ [UserBillingService] Could not fetch payments:', error);
      }

      // Also try to get invoices from INVOICES collection by firebaseUid
      try {
        let invoicesQuery = query(
          collection(db, COLLECTIONS.INVOICES),
          where('firebaseUid', '==', firebaseUid),
          limit(limitCount)
        );

        const invoicesSnapshot = await getDocs(invoicesQuery);
        console.log(`📋 [UserBillingService] Found ${invoicesSnapshot.size} invoices for Firebase UID: ${firebaseUid}`);

        // Process invoices
        for (const invoiceDoc of invoicesSnapshot.docs) {
          const invoiceData = invoiceDoc.data();
          
          const invoice: UserInvoice = {
            id: invoiceDoc.id,
            stripeInvoiceId: invoiceData.stripeInvoiceId,
            number: invoiceData.stripeInvoiceId || `INV-${invoiceDoc.id.substring(0, 8).toUpperCase()}`,
            date: invoiceData.createdAt?.toDate?.()?.toISOString() || invoiceData.createdAt,
            amount: invoiceData.amount || 0,
            status: invoiceData.status?.toLowerCase() || 'pending',
            description: invoiceData.description || `${invoiceData.subscription?.tier || 'Subscription'} Plan - ${invoiceData.subscription?.seats || 1} seat(s)`,
            downloadUrl: invoiceData.receiptUrl,
            receiptUrl: invoiceData.receiptUrl,
            currency: invoiceData.currency || 'USD',
            createdAt: invoiceData.createdAt?.toDate?.()?.toISOString() || invoiceData.createdAt,
            subscription: invoiceData.subscription,
          };

          allInvoices.push(invoice);
        }

        console.log(`✅ [UserBillingService] Processed ${allInvoices.length} total items`);
      } catch (error) {
        console.warn('⚠️ [UserBillingService] Could not fetch invoices:', error);
      }

      // Sort by creation date (same as AdminDashboardService)
      allInvoices.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0);
        const dateB = new Date(b.createdAt || b.date || 0);
        return dateB.getTime() - dateA.getTime();
      });

      console.log(`✅ [UserBillingService] Total billing history items: ${allInvoices.length}`);
      return allInvoices;

    } catch (error) {
      console.error('❌ [UserBillingService] Error getting user billing history:', error);
      return [];
    }
  }

  /**
   * Format currency amount
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }
}

export default UserBillingService;

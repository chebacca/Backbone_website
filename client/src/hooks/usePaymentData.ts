/**
 * 💰 Payment Data Hooks
 * 
 * React hooks for managing payment, subscription, and invoice data
 * using the UnifiedDataService with proper caching and error handling.
 */

import { useState, useEffect } from 'react';
import { unifiedDataService } from '@/services/UnifiedDataService';

// ============================================================================
// TYPES
// ============================================================================

interface UsePaymentDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UsePurchaseLicensesResult {
  purchaseLicenses: (purchaseData: {
    planId: string;
    quantity: number;
    paymentMethodId: string;
    billingAddress: any;
    total: number;
  }) => Promise<any>;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// SUBSCRIPTION HOOKS
// ============================================================================

/**
 * Hook to get organization subscription data
 */
export const useOrganizationSubscription = (): UsePaymentDataResult<any> => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const subscription = await unifiedDataService.getSubscriptionForOrganization();
      setData(subscription);
    } catch (err: any) {
      console.error('❌ [useOrganizationSubscription] Error:', err);
      setError(err.message || 'Failed to fetch subscription');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// ============================================================================
// INVOICE HOOKS
// ============================================================================

/**
 * Hook to get organization invoices
 */
export const useOrganizationInvoices = (): UsePaymentDataResult<any[]> => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const invoices = await unifiedDataService.getInvoicesForOrganization();
      setData(invoices);
    } catch (err: any) {
      console.error('❌ [useOrganizationInvoices] Error:', err);
      setError(err.message || 'Failed to fetch invoices');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// ============================================================================
// PAYMENT HOOKS
// ============================================================================

/**
 * Hook to get organization payments
 */
export const useOrganizationPayments = (): UsePaymentDataResult<any[]> => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const payments = await unifiedDataService.getPaymentsForOrganization();
      setData(payments);
    } catch (err: any) {
      console.error('❌ [useOrganizationPayments] Error:', err);
      setError(err.message || 'Failed to fetch payments');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// ============================================================================
// PURCHASE HOOKS
// ============================================================================

/**
 * Hook to purchase licenses
 */
export const usePurchaseLicenses = (): UsePurchaseLicensesResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchaseLicenses = async (purchaseData: {
    planId: string;
    quantity: number;
    paymentMethodId: string;
    billingAddress: any;
    total: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🛒 [usePurchaseLicenses] Starting purchase:', purchaseData);
      
      const result = await unifiedDataService.purchaseLicenses(purchaseData);
      
      console.log('✅ [usePurchaseLicenses] Purchase completed:', result);
      
      return result;
    } catch (err: any) {
      console.error('❌ [usePurchaseLicenses] Error:', err);
      setError(err.message || 'Failed to purchase licenses');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    purchaseLicenses,
    loading,
    error,
  };
};

// ============================================================================
// BILLING SUMMARY HOOK
// ============================================================================

/**
 * Hook to get comprehensive billing summary
 */
export const useBillingSummary = () => {
  const subscription = useOrganizationSubscription();
  const invoices = useOrganizationInvoices();
  const payments = useOrganizationPayments();

  const loading = subscription.loading || invoices.loading || payments.loading;
  const error = subscription.error || invoices.error || payments.error;

  // Calculate billing metrics
  const billingMetrics = {
    monthlyTotal: subscription.data?.totalAmount || 0,
    totalSeats: subscription.data?.seats || 0,
    daysUntilRenewal: subscription.data?.currentPeriodEnd 
      ? Math.max(0, Math.ceil((new Date(subscription.data.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0,
    activeInvoices: invoices.data?.filter(inv => inv.status === 'paid' || inv.status === 'pending').length || 0,
    totalPaid: payments.data
      ?.filter(payment => payment.status === 'succeeded')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0,
    lastPayment: payments.data
      ?.filter(payment => payment.status === 'succeeded')
      .sort((a, b) => new Date(b.processedAt || b.createdAt).getTime() - new Date(a.processedAt || a.createdAt).getTime())[0] || null,
  };

  const refetch = async () => {
    await Promise.all([
      subscription.refetch(),
      invoices.refetch(),
      payments.refetch(),
    ]);
  };

  return {
    subscription: subscription.data,
    invoices: invoices.data,
    payments: payments.data,
    metrics: billingMetrics,
    loading,
    error,
    refetch,
  };
};

// ============================================================================
// EXPORT ALL HOOKS
// ============================================================================

export default {
  useOrganizationSubscription,
  useOrganizationInvoices,
  useOrganizationPayments,
  usePurchaseLicenses,
  useBillingSummary,
};

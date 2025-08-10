import { api, endpoints, apiUtils } from './api';

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  price: number | null;
  priceId: string;
  features: string[];
  maxSeats: number | null;
  popular?: boolean;
  enterprise?: boolean;
}

export interface TaxCalculationRequest {
  amount: number;
  billingAddress: {
    country: string;
    state?: string;
    postalCode?: string;
  };
  userType?: 'individual' | 'business';
}

export interface TaxCalculation {
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  taxJurisdiction: string;
  breakdown: Array<{
    type: string;
    rate: number;
    amount: number;
  }>;
}

export interface BillingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface TaxInformation {
  taxResidency: string;
  taxId?: string;
  taxIdType?: 'SSN' | 'EIN' | 'VAT' | 'GST' | 'OTHER';
  vatNumber?: string;
  taxExempt?: boolean;
}

export interface BusinessProfile {
  companyName: string;
  companyType: 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP' | 'LLC' | 'CORPORATION' | 'NON_PROFIT' | 'GOVERNMENT' | 'OTHER';
  incorporationCountry: string;
  incorporationState?: string;
  businessDescription?: string;
  website?: string;
  industry?: string;
  revenueRange?: string;
  employeeCount?: string;
}

export interface CreateSubscriptionRequest {
  tier: string;
  seats: number;
  paymentMethodId: string;
  billingAddress: BillingAddress;
  taxInformation?: TaxInformation;
  businessProfile?: BusinessProfile;
}

export interface CreateSubscriptionResponse {
  subscription: {
    id: string;
    tier: string;
    status: string;
    seats: number;
    pricePerSeat: number;
    currentPeriodEnd: string;
  };
  payment: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    receiptUrl: string;
  };
  taxCalculation: TaxCalculation;
}

export interface PaymentHistory {
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    description: string;
    receiptUrl: string;
    taxAmount: number;
    createdAt: string;
    subscription?: {
      tier: string;
      seats: number;
    };
  }>;
  total: number;
}

export const paymentService = {
  /**
   * Get pricing tiers
   */
  async getPricingTiers(): Promise<PricingTier[]> {
    const response = await api.get(endpoints.payments.pricing());
    
    if (response.data.success) {
      return response.data.data.pricingTiers;
    } else {
      throw new Error(response.data.message || 'Failed to get pricing');
    }
  },

  /**
   * Calculate tax for a given amount and address
   */
  async calculateTax(request: TaxCalculationRequest): Promise<TaxCalculation> {
    const response = await api.post(endpoints.payments.calculateTax(), request);
    
    if (response.data.success) {
      return response.data.data.taxCalculation;
    } else {
      throw new Error(response.data.message || 'Failed to calculate tax');
    }
  },

  /**
   * Create a subscription with payment
   */
  async createSubscription(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    const response = await api.post(endpoints.payments.createSubscription(), request);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to create subscription');
    }
  },

  /**
   * Get payment history
   */
  async getPaymentHistory(options: { page?: number; limit?: number } = {}): Promise<PaymentHistory> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const response = await api.get(`${endpoints.payments.history()}?${params}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to get payment history');
    }
  },

  /**
   * Get user invoices
   */
  async getUserInvoices(options: { page?: number; limit?: number } = {}): Promise<any[]> {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());

    const response = await api.get(`${endpoints.invoices.list()}?${params}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to get invoices');
    }
  },

  /**
   * Get specific payment details
   */
  async getPaymentDetails(paymentId: string): Promise<any> {
    const response = await api.get(endpoints.payments.details(paymentId));
    
    if (response.data.success) {
      return response.data.data.payment;
    } else {
      throw new Error(response.data.message || 'Failed to get payment details');
    }
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    options: {
      reason?: string;
      cancelAtPeriodEnd?: boolean;
      feedback?: string;
    } = {}
  ): Promise<any> {
    const response = await api.post(endpoints.payments.cancelSubscription(subscriptionId), options);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to cancel subscription');
    }
  },

  /**
   * Update payment method
   */
  async updatePaymentMethod(subscriptionId: string, paymentMethodId: string): Promise<any> {
    const response = await api.put(endpoints.payments.updatePaymentMethod(subscriptionId), {
      paymentMethodId,
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to update payment method');
    }
  },

  /**
   * Validate billing address
   */
  validateBillingAddress(address: BillingAddress): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!address.firstName?.trim()) errors.push('First name is required');
    if (!address.lastName?.trim()) errors.push('Last name is required');
    if (!address.addressLine1?.trim()) errors.push('Address is required');
    if (!address.city?.trim()) errors.push('City is required');
    if (!address.postalCode?.trim()) errors.push('Postal code is required');
    if (!address.country?.trim() || address.country.length !== 2) {
      errors.push('Valid country code is required');
    }

    // Country-specific validations
    if (address.country === 'US' && !address.state?.trim()) {
      errors.push('State is required for US addresses');
    }

    if (address.country === 'CA' && !address.state?.trim()) {
      errors.push('Province is required for Canadian addresses');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100); // Assuming amounts are in cents
  },

  /**
   * Format tax rate as percentage
   */
  formatTaxRate(rate: number): string {
    return `${(rate * 100).toFixed(2)}%`;
  },

  /**
   * Get payment status display information
   */
  getPaymentStatusInfo(status: string): { color: string; label: string } {
    switch (status.toLowerCase()) {
      case 'succeeded':
        return { color: 'success', label: 'Successful' };
      case 'pending':
        return { color: 'warning', label: 'Pending' };
      case 'failed':
        return { color: 'error', label: 'Failed' };
      case 'canceled':
        return { color: 'default', label: 'Canceled' };
      case 'requires_action':
        return { color: 'info', label: 'Action Required' };
      default:
        return { color: 'default', label: status };
    }
  },

  /**
   * Calculate subscription pricing
   */
  calculateSubscriptionPricing(
    pricePerSeat: number,
    seats: number,
    taxRate: number = 0,
    isYearly: boolean = false
  ): {
    subtotal: number;
    discount: number;
    taxAmount: number;
    total: number;
  } {
    let subtotal = pricePerSeat * seats;
    
    // Apply yearly discount (typically 2 months free)
    const discount = isYearly ? Math.round(subtotal * 2 / 12) : 0;
    const discountedSubtotal = subtotal - discount;
    
    // Calculate tax on discounted amount
    const taxAmount = Math.round(discountedSubtotal * taxRate);
    const total = discountedSubtotal + taxAmount;

    return {
      subtotal,
      discount,
      taxAmount,
      total,
    };
  },

  /**
   * Validate payment form data
   */
  validatePaymentForm(data: {
    tier: string;
    seats: number;
    billingAddress: Partial<BillingAddress>;
    acceptTerms: boolean;
    acceptPrivacy: boolean;
  }): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    // Validate tier
    if (!data.tier) {
      errors.tier = 'Please select a plan';
    }

    // Validate seats
    if (!data.seats || data.seats < 1) {
      errors.seats = 'At least 1 seat is required';
    }

    if (data.tier === 'BASIC' && data.seats > 1) {
      errors.seats = 'Basic plan is limited to 1 seat';
    }

    if (data.tier === 'PRO' && data.seats > 50) {
      errors.seats = 'Pro plan is limited to 50 seats';
    }

    if (data.tier === 'ENTERPRISE' && data.seats < 10) {
      errors.seats = 'Enterprise plan requires minimum 10 seats';
    }

    // Validate billing address
    const addressValidation = this.validateBillingAddress(data.billingAddress as BillingAddress);
    if (!addressValidation.valid) {
      errors.billingAddress = addressValidation.errors.join(', ');
    }

    // Validate legal agreements
    if (!data.acceptTerms) {
      errors.acceptTerms = 'You must accept the Terms of Service';
    }

    if (!data.acceptPrivacy) {
      errors.acceptPrivacy = 'You must accept the Privacy Policy';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

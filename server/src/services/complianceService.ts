import { logger } from '../utils/logger.js';
import { firestoreService } from './firestoreService.js';

// Type aliases replacing Prisma enums
export type AuditAction =
  | 'REGISTER'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PROFILE_UPDATE'
  | 'PASSWORD_CHANGE'
  | 'EMAIL_CHANGE'
  | 'SUBSCRIPTION_CREATE'
  | 'SUBSCRIPTION_UPDATE'
  | 'SUBSCRIPTION_CANCEL'
  | 'PAYMENT_PROCESS'
  | 'LICENSE_ACTIVATE'
  | 'LICENSE_DEACTIVATE'
  | 'DATA_EXPORT'
  | 'DATA_DELETE'
  | 'CONSENT_GRANT'
  | 'CONSENT_WITHDRAW';

export type ComplianceEventType =
  | 'AML_ALERT'
  | 'KYC_FAILURE'
  | 'GDPR_VIOLATION'
  | 'REGULATORY_BREACH'
  | 'SUSPICIOUS_TRANSACTION';

export type ComplianceSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type KYCStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
export type AMLStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'REQUIRES_REVIEW';

export class ComplianceService {
  /**
   * Create comprehensive audit log for user actions
   */
  static async createAuditLog(
    userId: string,
    action: AuditAction,
    description: string,
    metadata: any = {},
    request?: { ip?: string; userAgent?: string }
  ) {
    try {
      await firestoreService.createAuditLog({
        userId,
        action,
        description,
        metadata,
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
      });

      logger.info(`Audit log created for user ${userId}`, {
        action,
        description,
      });

      return;
    } catch (error) {
      logger.error('Failed to create audit log', error);
      throw error;
    }
  }

  /**
   * Create compliance event
   */
  static async createComplianceEvent(
    eventType: ComplianceEventType,
    severity: ComplianceSeverity,
    description: string,
    userId?: string,
    paymentId?: string,
    metadata: any = {}
  ) {
    try {
      await firestoreService.createComplianceEvent({
        eventType,
        severity,
        description,
        userId,
        paymentId,
        metadata,
      });

      // Alert if high or critical severity
      if (severity === 'HIGH' || severity === 'CRITICAL') {
        await this.alertComplianceTeam({
          id: 'n/a',
          eventType,
          severity,
          description,
        } as any);
      }

      logger.warn(`Compliance event created: ${eventType}`, {
        severity,
        userId,
        paymentId,
      });

      return;
    } catch (error) {
      logger.error('Failed to create compliance event', error);
      throw error;
    }
  }

  /**
   * Perform KYC (Know Your Customer) verification
   */
  static async performKYC(userId: string, kycData: any) {
    try {
      const user = await firestoreService.getUserById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Create or update compliance profile
      const complianceProfile = {
        firstName: kycData.firstName,
        lastName: kycData.lastName,
        dateOfBirth: kycData.dateOfBirth ? new Date(kycData.dateOfBirth) : null,
        nationality: kycData.nationality,
        countryOfResidence: kycData.countryOfResidence,
        phoneNumber: kycData.phoneNumber,
        governmentIdType: kycData.governmentIdType,
        governmentIdNumber: kycData.governmentIdNumber,
        governmentIdCountry: kycData.governmentIdCountry,
        governmentIdExpiry: kycData.governmentIdExpiry ? new Date(kycData.governmentIdExpiry) : null,
      } as any;
      await firestoreService.updateUser(userId, { complianceProfile });

      // Perform sanctions screening
      const sanctionsResult = await this.performSanctionsScreening(user, complianceProfile);
      
      // Perform PEP screening
      const pepResult = await this.performPEPScreening(user, complianceProfile);

      // Update KYC status based on results
      let kycStatus: KYCStatus = 'COMPLETED';
      
      if (sanctionsResult.status !== 'CLEAR' || pepResult.status !== 'NOT_PEP') {
        kycStatus = 'FAILED';
        await this.createComplianceEvent(
          'KYC_FAILURE',
          'HIGH',
          `KYC failed for user ${userId}: Sanctions=${sanctionsResult.status}, PEP=${pepResult.status}`,
          userId,
          undefined,
          { sanctionsResult, pepResult }
        );
      }

      // Update user KYC status
      await firestoreService.updateUser(userId, {
        kycStatus,
        kycCompletedAt: new Date(),
        identityVerified: kycStatus === 'COMPLETED',
      } as any);

      await this.createAuditLog(
        userId,
        'PROFILE_UPDATE',
        `KYC verification completed with status: ${kycStatus}`
      );

      return {
        status: kycStatus,
        sanctionsResult,
        pepResult,
        complianceProfile,
      };
    } catch (error) {
      logger.error('KYC verification failed', error);
      throw error;
    }
  }

  /**
   * Perform AML (Anti-Money Laundering) screening for payments
   */
  static async performAMLScreening(paymentId: string, paymentData: any) {
    try {
      let amlStatus: AMLStatus = 'PASSED';
      let riskScore = 0;

      // Risk factors
      const riskFactors = [];

      // Check payment amount (large transactions are higher risk)
      if (paymentData.amount > 10000) { // $100
        riskScore += 30;
        riskFactors.push('Large transaction amount');
      }

      // Check country risk
      const highRiskCountries = ['AF', 'IR', 'KP', 'SY']; // Example high-risk countries
      if (highRiskCountries.includes(paymentData.country)) {
        riskScore += 50;
        riskFactors.push('High-risk country');
      }

      // Check payment pattern
      const recentPayments = await firestoreService.getPaymentsByUserId(paymentData.userId);
      const recentPaymentsLast24h = recentPayments.filter(p => new Date(p.createdAt).getTime() >= Date.now() - 24 * 60 * 60 * 1000);

      if (recentPaymentsLast24h.length > 5) {
        riskScore += 25;
        riskFactors.push('Multiple payments in short timeframe');
      }

      // Determine AML status based on risk score
      if (riskScore >= 75) {
        amlStatus = 'FAILED';
      } else if (riskScore >= 50) {
        amlStatus = 'REQUIRES_REVIEW';
      }

      // Update payment with AML results
      await firestoreService.updatePayment(paymentId, {
        amlScreeningStatus: amlStatus,
        amlScreeningDate: new Date(),
        amlRiskScore: riskScore,
      });

      // Create compliance event if high risk
      if (amlStatus !== 'PASSED') {
        await this.createComplianceEvent(
          'AML_ALERT',
          amlStatus === 'FAILED' ? 'CRITICAL' : 'HIGH',
          `AML screening flagged payment ${paymentId} with score ${riskScore}`,
          paymentData.userId,
          paymentId,
          { riskScore, riskFactors }
        );
      }

      logger.info(`AML screening completed for payment ${paymentId}`, {
        status: amlStatus,
        riskScore,
        riskFactors,
      });

      return {
        status: amlStatus,
        riskScore,
        riskFactors,
      };
    } catch (error) {
      logger.error('AML screening failed', error);
      throw error;
    }
  }

  /**
   * Record privacy consent
   */
  static async recordConsent(
    userId: string,
    consentType: string,
    granted: boolean,
    version: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      const consent = await firestoreService.createPrivacyConsent({
        userId,
        consentType,
        consentGranted: granted,
        consentVersion: version,
        ipAddress,
        userAgent,
        legalBasis: 'CONSENT',
      });

      await this.createAuditLog(
        userId,
        granted ? 'CONSENT_GRANT' : 'CONSENT_WITHDRAW',
        `Privacy consent ${granted ? 'granted' : 'withdrawn'} for ${consentType}`,
        { consentType, version }
      );

      return consent;
    } catch (error) {
      logger.error('Failed to record consent', error);
      throw error;
    }
  }

  /**
   * Validate billing address
   */
  static async validateBillingAddress(addressData: any) {
    try {
      // Basic validation
      const errors = [];
      
      if (!addressData.firstName?.trim()) errors.push('First name is required');
      if (!addressData.lastName?.trim()) errors.push('Last name is required');
      if (!addressData.addressLine1?.trim()) errors.push('Address line 1 is required');
      if (!addressData.city?.trim()) errors.push('City is required');
      if (!addressData.postalCode?.trim()) errors.push('Postal code is required');
      if (!addressData.country?.trim()) errors.push('Country is required');

      // Country-specific validation
      if (addressData.country === 'US' && !addressData.state?.trim()) {
        errors.push('State is required for US addresses');
      }

      if (errors.length > 0) {
        return { valid: false, errors };
      }

      // Here you would integrate with an address validation service
      // For now, we'll mark it as validated
      return { 
        valid: true, 
        errors: [],
        standardized: addressData // Would contain standardized address from service
      };
    } catch (error) {
      logger.error('Address validation failed', error);
      return { valid: false, errors: ['Address validation service unavailable'] };
    }
  }

  /**
   * Calculate tax for payment
   */
  static async calculateTax(amount: number, billingAddress: any, userType: 'individual' | 'business') {
    try {
      let taxRate = 0;
      let taxAmount = 0;
      let jurisdiction = '';

      // Tax calculation logic based on location
      // This is simplified - in production you'd use a tax service like Avalara
      
      if (billingAddress.country === 'US') {
        // US sales tax (varies by state)
        const stateTaxRates: Record<string, number> = {
          'CA': 0.0825, // California
          'NY': 0.08,   // New York
          'TX': 0.0625, // Texas
          'FL': 0.06,   // Florida
          // Add more states as needed
        };
        
        taxRate = stateTaxRates[billingAddress.state] || 0;
        jurisdiction = `${billingAddress.state}, US`;
      } else if (billingAddress.country === 'GB') {
        // UK VAT
        taxRate = 0.20; // 20% VAT
        jurisdiction = 'UK';
      } else if (['DE', 'FR', 'IT', 'ES'].includes(billingAddress.country)) {
        // EU VAT (simplified)
        taxRate = 0.19; // Varies by country, this is simplified
        jurisdiction = `EU-${billingAddress.country}`;
      }

      taxAmount = amount * taxRate;

      return {
        taxRate,
        taxAmount,
        jurisdiction,
        taxableAmount: amount,
        totalAmount: amount + taxAmount,
      };
    } catch (error) {
      logger.error('Tax calculation failed', error);
      throw error;
    }
  }

  // Private helper methods

  private static async performSanctionsScreening(user: any, profile: any) {
    // In production, integrate with sanctions screening service
    // For now, return clear status
    await firestoreService.updateUser(user.id, {
      complianceProfile: {
        ...(user.complianceProfile || {}),
        sanctionsScreened: true,
        sanctionsScreenDate: new Date(),
        sanctionsStatus: 'CLEAR',
      },
    } as any);

    return { status: 'CLEAR' };
  }

  private static async performPEPScreening(user: any, profile: any) {
    // In production, integrate with PEP screening service
    // For now, return not PEP status
    await firestoreService.updateUser(user.id, {
      complianceProfile: {
        ...(user.complianceProfile || {}),
        pepScreened: true,
        pepScreenDate: new Date(),
        pepStatus: 'NOT_PEP',
      },
    } as any);

    return { status: 'NOT_PEP' };
  }

  private static async alertComplianceTeam(event: any) {
    // In production, send alerts to compliance team
    logger.warn('COMPLIANCE ALERT', {
      eventId: event.id,
      type: event.eventType,
      severity: event.severity,
      description: event.description,
    });
  }

  private static getDataCategoryForAction(action: AuditAction): string {
    const mapping: Record<AuditAction, string> = {
      REGISTER: 'Personal Data',
      LOGIN: 'Authentication Data',
      LOGOUT: 'Authentication Data',
      PROFILE_UPDATE: 'Personal Data',
      PASSWORD_CHANGE: 'Authentication Data',
      EMAIL_CHANGE: 'Contact Data',
      SUBSCRIPTION_CREATE: 'Financial Data',
      SUBSCRIPTION_UPDATE: 'Financial Data',
      SUBSCRIPTION_CANCEL: 'Financial Data',
      PAYMENT_PROCESS: 'Financial Data',
      LICENSE_ACTIVATE: 'License Data',
      LICENSE_DEACTIVATE: 'License Data',
      DATA_EXPORT: 'All Data Categories',
      DATA_DELETE: 'All Data Categories',
      CONSENT_GRANT: 'Consent Data',
      CONSENT_WITHDRAW: 'Consent Data',
    };
    
    return mapping[action] || 'General Data';
  }

  private static getPurposeForAction(action: AuditAction): string {
    const mapping: Record<AuditAction, string> = {
      REGISTER: 'Account Creation',
      LOGIN: 'Authentication',
      LOGOUT: 'Authentication',
      PROFILE_UPDATE: 'Account Management',
      PASSWORD_CHANGE: 'Security',
      EMAIL_CHANGE: 'Account Management',
      SUBSCRIPTION_CREATE: 'Service Provision',
      SUBSCRIPTION_UPDATE: 'Service Provision',
      SUBSCRIPTION_CANCEL: 'Service Provision',
      PAYMENT_PROCESS: 'Payment Processing',
      LICENSE_ACTIVATE: 'License Management',
      LICENSE_DEACTIVATE: 'License Management',
      DATA_EXPORT: 'Data Portability',
      DATA_DELETE: 'Data Deletion',
      CONSENT_GRANT: 'Consent Management',
      CONSENT_WITHDRAW: 'Consent Management',
    };
    
    return mapping[action] || 'General Processing';
  }

  private static getLegalBasisForAction(action: AuditAction): string {
    const mapping: Record<AuditAction, string> = {
      REGISTER: 'Consent',
      LOGIN: 'Contract',
      LOGOUT: 'Contract',
      PROFILE_UPDATE: 'Contract',
      PASSWORD_CHANGE: 'Contract',
      EMAIL_CHANGE: 'Contract',
      SUBSCRIPTION_CREATE: 'Contract',
      SUBSCRIPTION_UPDATE: 'Contract',
      SUBSCRIPTION_CANCEL: 'Contract',
      PAYMENT_PROCESS: 'Contract',
      LICENSE_ACTIVATE: 'Contract',
      LICENSE_DEACTIVATE: 'Contract',
      DATA_EXPORT: 'Legal Obligation',
      DATA_DELETE: 'Legal Obligation',
      CONSENT_GRANT: 'Consent',
      CONSENT_WITHDRAW: 'Consent',
    };
    
    return mapping[action] || 'Legitimate Interest';
  }

  private static getRetentionForAction(action: AuditAction): string {
    // Simplified retention periods
    if (['PAYMENT_PROCESS', 'SUBSCRIPTION_CREATE', 'SUBSCRIPTION_UPDATE'].includes(action)) {
      return '7 years'; // Financial records
    } else if (['REGISTER', 'PROFILE_UPDATE'].includes(action)) {
      return '2 years after account deletion'; // Personal data
    } else {
      return '1 year'; // General activity logs
    }
  }
}

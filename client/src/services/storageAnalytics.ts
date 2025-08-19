/**
 * Storage Analytics Service
 * 
 * Handles storage usage tracking, warnings, and capacity management
 * for different subscription tiers.
 */

import { api, endpoints } from './api';
import { LICENSE_CONFIGURATIONS, STORAGE_WARNING_THRESHOLDS, LicenseTier } from '../components/DatasetCreationWizard-ProductionEnhanced';

export interface StorageUsage {
    used: number; // in GB
    limit: number; // in GB, -1 for unlimited
    percentage: number; // 0-100
    tier: LicenseTier;
    warningLevel: 'none' | 'warning' | 'critical' | 'emergency';
    canPurchaseAdditional: boolean;
    additionalStoragePrice?: number;
}

export interface StorageBreakdown {
    firestore: number;
    gcs: number;
    s3: number;
    azure: number;
    local: number;
    total: number;
}

export interface StorageAlert {
    id: string;
    type: 'warning' | 'critical' | 'emergency';
    title: string;
    message: string;
    actionRequired: boolean;
    canUpgrade: boolean;
    canPurchaseStorage: boolean;
    timestamp: Date;
}

export class StorageAnalyticsService {
    /**
     * Get current storage usage for a user
     */
    static async getStorageUsage(userId?: string): Promise<StorageUsage> {
        try {
            // Get user's subscription and license info
            const [subscriptionRes, storageRes] = await Promise.all([
                api.get(endpoints.subscriptions.mySubscriptions()),
                api.get('storage/usage') // Remove leading /api/ since baseURL already includes it
            ]);

            const subscriptions = subscriptionRes.data?.data?.subscriptions || [];
            const activeSubscription = subscriptions.find((sub: any) => sub.status === 'ACTIVE') || subscriptions[0];
            
            const tier: LicenseTier = activeSubscription?.tier?.toLowerCase() || 'free';
            const licenseConfig = LICENSE_CONFIGURATIONS[tier];
            
            const storageData = storageRes.data?.data || { used: 0, breakdown: {} };
            const usedGB = storageData.used / (1024 * 1024 * 1024); // Convert bytes to GB
            const limitGB = licenseConfig.maxStorageQuota;
            
            let percentage = 0;
            let warningLevel: StorageUsage['warningLevel'] = 'none';
            
            if (limitGB > 0) {
                percentage = (usedGB / limitGB) * 100;
                
                if (percentage >= STORAGE_WARNING_THRESHOLDS.emergency * 100) {
                    warningLevel = 'emergency';
                } else if (percentage >= STORAGE_WARNING_THRESHOLDS.critical * 100) {
                    warningLevel = 'critical';
                } else if (percentage >= STORAGE_WARNING_THRESHOLDS.warning * 100) {
                    warningLevel = 'warning';
                }
            }

            return {
                used: Math.round(usedGB * 100) / 100,
                limit: limitGB,
                percentage: Math.round(percentage * 100) / 100,
                tier,
                warningLevel,
                canPurchaseAdditional: licenseConfig.additionalStorageAvailable || false,
                additionalStoragePrice: licenseConfig.additionalStoragePrice
            };
        } catch (error) {
            console.error('Failed to fetch storage usage:', error);
            // Return safe defaults
            return {
                used: 0,
                limit: 1,
                percentage: 0,
                tier: 'free',
                warningLevel: 'none',
                canPurchaseAdditional: false
            };
        }
    }

    /**
     * Get detailed storage breakdown by provider
     */
    static async getStorageBreakdown(): Promise<StorageBreakdown> {
        try {
            const response = await api.get('storage/breakdown');
            const data = response.data?.data || {};
            
            return {
                firestore: data.firestore || 0,
                gcs: data.gcs || 0,
                s3: data.s3 || 0,
                azure: data.azure || 0,
                local: data.local || 0,
                total: data.total || 0
            };
        } catch (error) {
            console.error('Failed to fetch storage breakdown:', error);
            return {
                firestore: 0,
                gcs: 0,
                s3: 0,
                azure: 0,
                local: 0,
                total: 0
            };
        }
    }

    /**
     * Generate storage alerts based on usage
     */
    static generateStorageAlerts(usage: StorageUsage): StorageAlert[] {
        const alerts: StorageAlert[] = [];
        
        if (usage.warningLevel === 'none' || usage.limit === -1) {
            return alerts;
        }

        const baseAlert = {
            id: `storage-${usage.warningLevel}-${Date.now()}`,
            timestamp: new Date(),
            canUpgrade: usage.tier !== 'enterprise',
            canPurchaseStorage: usage.canPurchaseAdditional
        };

        switch (usage.warningLevel) {
            case 'warning':
                alerts.push({
                    ...baseAlert,
                    type: 'warning',
                    title: 'Storage Usage Warning',
                    message: `You're using ${usage.percentage}% of your ${usage.limit}GB storage limit. Consider upgrading your plan or purchasing additional storage.`,
                    actionRequired: false
                });
                break;

            case 'critical':
                alerts.push({
                    ...baseAlert,
                    type: 'critical',
                    title: 'Critical Storage Usage',
                    message: `You're using ${usage.percentage}% of your ${usage.limit}GB storage limit. Your account may be restricted soon. Please upgrade or purchase additional storage immediately.`,
                    actionRequired: true
                });
                break;

            case 'emergency':
                alerts.push({
                    ...baseAlert,
                    type: 'emergency',
                    title: 'Storage Limit Almost Reached',
                    message: `URGENT: You're using ${usage.percentage}% of your ${usage.limit}GB storage limit. New uploads will be blocked soon. Upgrade your plan or purchase additional storage now.`,
                    actionRequired: true
                });
                break;
        }

        return alerts;
    }

    /**
     * Get storage upgrade recommendations
     */
    static getUpgradeRecommendations(usage: StorageUsage): Array<{
        tier: LicenseTier;
        storageLimit: number;
        price: string;
        recommended: boolean;
    }> {
        const recommendations = [];
        
        if (usage.tier === 'free') {
            recommendations.push(
                {
                    tier: 'pro' as LicenseTier,
                    storageLimit: 50,
                    price: '$29/month',
                    recommended: usage.used > 0.8 // Recommend Pro if using >80% of free tier
                },
                {
                    tier: 'enterprise' as LicenseTier,
                    storageLimit: -1,
                    price: 'Contact Sales',
                    recommended: usage.used > 40 // Recommend Enterprise if using >40GB
                }
            );
        } else if (usage.tier === 'pro') {
            recommendations.push({
                tier: 'enterprise' as LicenseTier,
                storageLimit: -1,
                price: 'Contact Sales',
                recommended: usage.percentage > 80
            });
        }

        return recommendations;
    }

    /**
     * Calculate additional storage pricing
     */
    static calculateAdditionalStorageCost(additionalGB: number, tier: LicenseTier): number {
        const config = LICENSE_CONFIGURATIONS[tier];
        if (!config.additionalStorageAvailable || !config.additionalStoragePrice) {
            return 0;
        }
        return additionalGB * config.additionalStoragePrice;
    }

    /**
     * Request additional storage purchase
     */
    static async purchaseAdditionalStorage(additionalGB: number): Promise<{ success: boolean; paymentUrl?: string; error?: string }> {
        try {
            const response = await api.post('storage/purchase', {
                additionalGB
            });
            
            return {
                success: true,
                paymentUrl: response.data?.paymentUrl
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to initiate storage purchase'
            };
        }
    }
}

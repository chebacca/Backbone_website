/**
 * Production-Enhanced Dataset Creation Wizard
 * 
 * This enhancement adds automatic mode determination based on:
 * - License tier limitations
 * - Project configuration
 * - Deployment environment (webonly vs desktop)
 * - User permissions
 */

import React, { useEffect, useState } from 'react';
import { Alert, Chip, Box, Typography } from '@mui/material';
import {
    Security as SecurityIcon,
    CloudOff as OfflineIcon,
    Business as BusinessIcon,
    Person as PersonIcon
} from '@mui/icons-material';

// License tier definitions (matches your subscription system)
export type LicenseTier = 'free' | 'pro' | 'enterprise' | 'on-premises';

export interface UserLicense {
    tier: LicenseTier;
    maxCollaborators: number;
    allowedStorageBackends: string[];
    maxStorageQuota: number; // in GB, -1 for unlimited
    storageWarningEnabled?: boolean;
    additionalStorageAvailable?: boolean;
    additionalStoragePrice?: number; // per GB per month
    features: {
        cloudStorage: boolean;
        localStorage: boolean;
        encryption: boolean;
        backup: boolean;
        analytics: boolean;
        customSchemas: boolean;
    };
}

export interface ProductionModeConfig {
    isWebOnlyMode: boolean;
    applicationMode: 'standalone' | 'shared_network';
    userLicense: UserLicense;
    projectStorageBackend?: string;
    availableStorageOptions: string[];
    collaborationEnabled: boolean;
    maxDatasetSize: number;
}

// Storage capacity warning thresholds
export const STORAGE_WARNING_THRESHOLDS = {
    warning: 0.85, // 85%
    critical: 0.95, // 95%
    emergency: 0.98 // 98%
} as const;

// License tier configurations with enhanced storage management
export const LICENSE_CONFIGURATIONS: Record<LicenseTier, UserLicense> = {
    free: {
        tier: 'free',
        maxCollaborators: 2,
        allowedStorageBackends: ['firestore'],
        maxStorageQuota: 1, // 1GB
        storageWarningEnabled: true,
        additionalStorageAvailable: false, // Cannot purchase additional storage on free tier
        features: {
            cloudStorage: true,
            localStorage: false, // Not available in free tier
            encryption: false,
            backup: false,
            analytics: false,
            customSchemas: false
        }
    },
    pro: {
        tier: 'pro',
        maxCollaborators: 10,
        allowedStorageBackends: ['firestore', 'gcs', 's3'],
        maxStorageQuota: 50, // 50GB
        storageWarningEnabled: true,
        additionalStorageAvailable: true, // Can purchase additional storage
        additionalStoragePrice: 0.10, // $0.10 per GB per month
        features: {
            cloudStorage: true,
            localStorage: true, // Available in desktop mode
            encryption: true,
            backup: true,
            analytics: true,
            customSchemas: true
        }
    },
    enterprise: {
        tier: 'enterprise',
        maxCollaborators: -1, // Unlimited
        allowedStorageBackends: ['firestore', 'gcs', 's3', 'aws', 'azure', 'local'],
        maxStorageQuota: -1, // Unlimited
        storageWarningEnabled: false, // No warnings for unlimited storage
        additionalStorageAvailable: true, // Custom pricing available
        additionalStoragePrice: 0.08, // $0.08 per GB per month (volume discount)
        features: {
            cloudStorage: true,
            localStorage: true,
            encryption: true,
            backup: true,
            analytics: true,
            customSchemas: true
        }
    },
    'on-premises': {
        tier: 'on-premises',
        maxCollaborators: -1, // Unlimited
        allowedStorageBackends: ['local', 'private-cloud'],
        maxStorageQuota: -1, // Unlimited
        storageWarningEnabled: false, // No cloud storage warnings for on-premises
        additionalStorageAvailable: false, // Managed by customer
        features: {
            cloudStorage: false, // No external cloud
            localStorage: true,
            encryption: true,
            backup: true,
            analytics: true,
            customSchemas: true
        }
    }
};

export const detectProductionMode = (): ProductionModeConfig => {
    // Licensing website is ALWAYS in web-only mode
    const isWebOnlyMode = true;

    // Get user license from context/auth (this would come from your auth system)
    const userLicenseString = typeof window !== 'undefined' 
        ? localStorage.getItem('user_license') || 'free'
        : 'free';
    const userLicenseTier = userLicenseString as LicenseTier;
    const userLicense = LICENSE_CONFIGURATIONS[userLicenseTier];

    // Get application mode from project or default
    const applicationMode = typeof window !== 'undefined'
        ? (localStorage.getItem('application_mode') as 'standalone' | 'shared_network') || 'shared_network'
        : 'shared_network';

    // Determine available storage options based on license and environment
    let availableStorageOptions = [...userLicense.allowedStorageBackends];
    
    if (isWebOnlyMode) {
        // In webonly mode, remove local storage options
        availableStorageOptions = availableStorageOptions.filter(
            backend => !['local', 'filesystem'].includes(backend)
        );
        
        // Add browser storage for webonly mode
        if (userLicense.features.localStorage) {
            availableStorageOptions.push('browser');
        }
    }

    return {
        isWebOnlyMode,
        applicationMode,
        userLicense,
        availableStorageOptions,
        collaborationEnabled: userLicense.maxCollaborators > 1,
        maxDatasetSize: userLicense.maxStorageQuota
    };
};

export const ProductionModeIndicator: React.FC<{ config: ProductionModeConfig }> = ({ config }) => {
    const { userLicense, isWebOnlyMode, applicationMode, availableStorageOptions } = config;

    const getLicenseTierColor = (tier: LicenseTier) => {
        switch (tier) {
            case 'free': return 'default';
            case 'pro': return 'primary';
            case 'enterprise': return 'secondary';
            case 'on-premises': return 'success';
            default: return 'default';
        }
    };

    const getEnvironmentIcon = () => {
        if (isWebOnlyMode) return <SecurityIcon />;
        return <OfflineIcon />;
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Alert 
                severity="info" 
                icon={getEnvironmentIcon()}
                sx={{ mb: 2 }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2">
                        <strong>Current Configuration:</strong>
                    </Typography>
                    
                    <Chip 
                        label={`${userLicense.tier.toUpperCase()} License`}
                        color={getLicenseTierColor(userLicense.tier)}
                        size="small"
                        icon={userLicense.tier === 'enterprise' ? <BusinessIcon /> : <PersonIcon />}
                    />
                    
                    <Chip 
                        label={isWebOnlyMode ? 'Web-Only' : 'Desktop'}
                        color={isWebOnlyMode ? 'primary' : 'success'}
                        size="small"
                    />
                    
                    <Chip 
                        label={applicationMode === 'standalone' ? 'Standalone' : 'Collaborative'}
                        variant="outlined"
                        size="small"
                    />
                </Box>
                
                <Typography variant="body2" sx={{ mt: 1 }}>
                    Available storage options: {availableStorageOptions.join(', ')}
                    {userLicense.maxCollaborators > 0 && (
                        <> • Max collaborators: {userLicense.maxCollaborators === -1 ? 'Unlimited' : userLicense.maxCollaborators}</>
                    )}
                    {userLicense.maxStorageQuota > 0 && (
                        <> • Storage quota: {userLicense.maxStorageQuota === -1 ? 'Unlimited' : `${userLicense.maxStorageQuota}GB`}</>
                    )}
                </Typography>
            </Alert>
        </Box>
    );
};

export const validateDatasetCreationPermissions = (
    config: ProductionModeConfig,
    datasetOptions: any
): { allowed: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const { userLicense, availableStorageOptions, maxDatasetSize } = config;

    // Check storage backend permission
    if (datasetOptions.storageBackend && !availableStorageOptions.includes(datasetOptions.storageBackend)) {
        errors.push(`Storage backend '${datasetOptions.storageBackend}' not available with ${userLicense.tier} license`);
    }

    // Check feature permissions
    if (datasetOptions.encryption && !userLicense.features.encryption) {
        errors.push('Encryption feature not available with current license tier');
    }

    if (datasetOptions.backup && !userLicense.features.backup) {
        errors.push('Backup feature not available with current license tier');
    }

    if (datasetOptions.customSchema && !userLicense.features.customSchemas) {
        errors.push('Custom schemas not available with current license tier');
    }

    // Check storage quota
    if (maxDatasetSize > 0 && datasetOptions.estimatedSize > maxDatasetSize) {
        errors.push(`Dataset size (${datasetOptions.estimatedSize}GB) exceeds license quota (${maxDatasetSize}GB)`);
    }

    // Warnings for suboptimal configurations
    if (config.isWebOnlyMode && datasetOptions.storageBackend === 'local') {
        warnings.push('Local storage not available in web-only mode. Consider cloud storage options.');
    }

    if (userLicense.tier === 'free' && datasetOptions.collaborators > userLicense.maxCollaborators) {
        warnings.push(`Collaboration limited to ${userLicense.maxCollaborators} users with free license`);
    }

    return {
        allowed: errors.length === 0,
        errors,
        warnings
    };
};

export const getRecommendedStorageBackend = (config: ProductionModeConfig): string => {
    const { availableStorageOptions, isWebOnlyMode, userLicense } = config;

    // For on-premises, prefer local storage
    if (userLicense.tier === 'on-premises') {
        return availableStorageOptions.includes('local') ? 'local' : availableStorageOptions[0];
    }

    // For webonly mode, prefer cloud storage
    if (isWebOnlyMode) {
        if (availableStorageOptions.includes('firestore')) return 'firestore';
        if (availableStorageOptions.includes('gcs')) return 'gcs';
        return availableStorageOptions[0];
    }

    // For desktop mode, prefer based on license tier
    if (userLicense.tier === 'enterprise') {
        return availableStorageOptions.includes('aws') ? 'aws' : availableStorageOptions[0];
    }

    if (userLicense.tier === 'pro') {
        return availableStorageOptions.includes('gcs') ? 'gcs' : availableStorageOptions[0];
    }

    // Default to first available option
    return availableStorageOptions[0];
};

export const getAvailableSchemaTemplates = (config: ProductionModeConfig) => {
    const { userLicense } = config;
    
    const baseTemplates = [
        'inventory',
        'sessions',
        'media',
        'users',
        'analytics'
    ];

    if (userLicense.features.customSchemas) {
        return ['custom', ...baseTemplates];
    }

    return baseTemplates;
};

export default {
    detectProductionMode,
    ProductionModeIndicator,
    validateDatasetCreationPermissions,
    getRecommendedStorageBackend,
    getAvailableSchemaTemplates,
    LICENSE_CONFIGURATIONS
};

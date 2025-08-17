/**
 * Local Storage Enhancement for Dataset Creation Wizard
 * 
 * This module adds browser-compatible local storage options for webonly=true mode
 * and file system access for desktop/local mode.
 */

import React from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    TextField,
    Alert,
    Button,
    FormControlLabel,
    Switch,
    Chip,
    Link
} from '@mui/material';
import {
    Storage as StorageIcon,
    Folder as FolderIcon,
    CloudOff as OfflineIcon,
    Security as SecurityIcon,
    Info as InfoIcon
} from '@mui/icons-material';

export interface LocalStorageConfig {
    type: 'browser' | 'filesystem' | 'indexeddb';
    path?: string;
    maxSize?: number;
    encryption?: boolean;
    compression?: boolean;
    autoBackup?: boolean;
}

export interface LocalStorageProviderProps {
    config: LocalStorageConfig;
    onChange: (config: LocalStorageConfig) => void;
    isWebOnlyMode: boolean;
}

export const LocalStorageProvider: React.FC<LocalStorageProviderProps> = ({
    config,
    onChange,
    isWebOnlyMode
}) => {
    const handleConfigChange = (updates: Partial<LocalStorageConfig>) => {
        onChange({ ...config, ...updates });
    };

    if (isWebOnlyMode) {
        return (
            <Box>
                <Typography variant="h6" gutterBottom>
                    Browser Storage Configuration
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Web-Only Mode:</strong> Data will be stored in your browser's local storage. 
                        This is perfect for personal datasets and maintains privacy by keeping data on your device.
                    </Typography>
                </Alert>

                <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <StorageIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle1">
                                Browser Storage (IndexedDB)
                            </Typography>
                            <Chip 
                                label="Recommended" 
                                size="small" 
                                color="primary" 
                                sx={{ ml: 1 }} 
                            />
                        </Box>

                        <Typography variant="body2" color="text.secondary" paragraph>
                            Uses your browser's IndexedDB for efficient local storage. Data persists between sessions 
                            and can handle large datasets (up to several GB depending on browser).
                        </Typography>

                        <Box sx={{ mt: 2 }}>
                            <TextField
                                fullWidth
                                label="Storage Quota (MB)"
                                type="number"
                                value={config.maxSize || 1000}
                                onChange={(e) => handleConfigChange({ maxSize: parseInt(e.target.value) })}
                                helperText="Maximum storage space to use (browser dependent)"
                                sx={{ mb: 2 }}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={config.encryption || false}
                                        onChange={(e) => handleConfigChange({ encryption: e.target.checked })}
                                    />
                                }
                                label="Enable client-side encryption"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={config.compression || true}
                                        onChange={(e) => handleConfigChange({ compression: e.target.checked })}
                                    />
                                }
                                label="Enable data compression"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={config.autoBackup || false}
                                        onChange={(e) => handleConfigChange({ autoBackup: e.target.checked })}
                                    />
                                }
                                label="Auto-backup to downloads folder"
                            />
                        </Box>

                        <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                <SecurityIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                                <strong>Privacy:</strong> All data stays on your device. Nothing is sent to external servers.
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Important:</strong> Browser storage is tied to this specific browser and domain. 
                        Clearing browser data will remove your datasets. Consider enabling auto-backup for important data.
                    </Typography>
                </Alert>
            </Box>
        );
    }

    // Desktop/Local mode - full file system access
    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Local File System Configuration
            </Typography>
            
            <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                    <strong>Desktop Mode:</strong> Full access to your local file system. 
                    Choose any folder on your computer for dataset storage.
                </Typography>
            </Alert>

            <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle1">
                            File System Storage
                        </Typography>
                        <Chip 
                            label="Full Control" 
                            size="small" 
                            color="success" 
                            sx={{ ml: 1 }} 
                        />
                    </Box>

                    <Typography variant="body2" color="text.secondary" paragraph>
                        Store datasets directly on your local file system. Perfect for large datasets, 
                        backup integration, and when you need full control over data location.
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Storage Path"
                            value={config.path || ''}
                            onChange={(e) => handleConfigChange({ path: e.target.value })}
                            placeholder="/Users/yourname/Documents/Datasets"
                            helperText="Choose a folder on your computer for dataset storage"
                            sx={{ mb: 2 }}
                            InputProps={{
                                endAdornment: (
                                    <Button 
                                        size="small" 
                                        onClick={() => {
                                            // In desktop mode, this would open a folder picker
                                            console.log('Open folder picker');
                                        }}
                                    >
                                        Browse
                                    </Button>
                                )
                            }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={config.encryption || false}
                                    onChange={(e) => handleConfigChange({ encryption: e.target.checked })}
                                />
                            }
                            label="Enable file encryption"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={config.compression || true}
                                    onChange={(e) => handleConfigChange({ compression: e.target.checked })}
                                />
                            }
                            label="Enable file compression"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={config.autoBackup || true}
                                    onChange={(e) => handleConfigChange({ autoBackup: e.target.checked })}
                                />
                            }
                            label="Auto-backup to secondary location"
                        />
                    </Box>

                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            <OfflineIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                            <strong>Offline Ready:</strong> Works completely offline. Sync with cloud storage when needed.
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            <Alert severity="info">
                <Typography variant="body2">
                    <InfoIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                    You can also combine local storage with cloud backup by creating datasets with both 
                    local and cloud storage configurations.
                </Typography>
            </Alert>
        </Box>
    );
};

// Utility functions for different storage modes
export const getStorageCapabilities = (isWebOnlyMode: boolean) => {
    if (isWebOnlyMode) {
        return {
            type: 'browser',
            maxSize: 'Browser dependent (typically 1-10GB)',
            features: [
                'IndexedDB storage',
                'Client-side encryption',
                'Data compression',
                'Export/import capabilities',
                'Auto-backup to downloads'
            ],
            limitations: [
                'Browser-specific storage',
                'Cleared with browser data',
                'No direct file system access',
                'Limited by browser quotas'
            ]
        };
    }

    return {
        type: 'filesystem',
        maxSize: 'Limited by available disk space',
        features: [
            'Direct file system access',
            'Full folder control',
            'File encryption',
            'Compression options',
            'Integration with backup systems',
            'Unlimited storage size'
        ],
        limitations: [
            'Requires desktop application',
            'Platform-specific paths',
            'File permissions dependent'
        ]
    };
};

export const validateStorageConfig = (config: LocalStorageConfig, isWebOnlyMode: boolean): string[] => {
    const errors: string[] = [];

    if (!isWebOnlyMode && config.type === 'filesystem') {
        if (!config.path || config.path.trim() === '') {
            errors.push('Storage path is required for file system storage');
        }
    }

    if (config.maxSize && config.maxSize < 10) {
        errors.push('Storage quota must be at least 10MB');
    }

    return errors;
};

export default LocalStorageProvider;

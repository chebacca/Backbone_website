/**
 * Storage Warning Card Component
 * 
 * Displays storage usage warnings and upgrade options based on subscription tier
 */

import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Box,
    Alert,
    AlertTitle,
    Button,
    ButtonGroup,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Stack,
    IconButton,
    Collapse
} from '@mui/material';
import {
    Storage as StorageIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    Upgrade as UpgradeIcon,
    ShoppingCart as PurchaseIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import { StorageAnalyticsService, StorageUsage, StorageAlert } from '@/services/storageAnalytics';

interface StorageWarningCardProps {
    onUpgrade?: () => void;
    onPurchaseStorage?: (additionalGB: number) => void;
    compact?: boolean;
}

const StorageWarningCard: React.FC<StorageWarningCardProps> = ({
    onUpgrade,
    onPurchaseStorage,
    compact = false
}) => {
    const { user } = useAuth();
    const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
    const [alerts, setAlerts] = useState<StorageAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
    const [additionalStorage, setAdditionalStorage] = useState(10);
    const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchStorageData();
        // Refresh every 5 minutes
        const interval = setInterval(fetchStorageData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [user]);

    const fetchStorageData = async () => {
        try {
            setLoading(true);
            const usage = await StorageAnalyticsService.getStorageUsage();
            setStorageUsage(usage);
            
            const generatedAlerts = StorageAnalyticsService.generateStorageAlerts(usage);
            setAlerts(generatedAlerts);
        } catch (error) {
            console.error('Failed to fetch storage data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDismissAlert = (alertId: string) => {
        setDismissedAlerts(prev => new Set([...prev, alertId]));
    };

    const handlePurchaseStorage = async () => {
        if (onPurchaseStorage) {
            onPurchaseStorage(additionalStorage);
        } else {
            // Default implementation
            try {
                const result = await StorageAnalyticsService.purchaseAdditionalStorage(additionalStorage);
                if (result.success && result.paymentUrl) {
                    window.open(result.paymentUrl, '_blank');
                }
            } catch (error) {
                console.error('Failed to purchase storage:', error);
            }
        }
        setPurchaseDialogOpen(false);
    };

    const getProgressColor = (warningLevel: StorageUsage['warningLevel']) => {
        switch (warningLevel) {
            case 'emergency': return 'error';
            case 'critical': return 'error';
            case 'warning': return 'warning';
            default: return 'primary';
        }
    };

    const getAlertSeverity = (type: StorageAlert['type']) => {
        switch (type) {
            case 'emergency': return 'error';
            case 'critical': return 'error';
            case 'warning': return 'warning';
            default: return 'info';
        }
    };

    if (loading || !storageUsage) {
        return (
            <Card>
                <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                        <StorageIcon />
                        <Typography variant="h6">Loading storage usage...</Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    // Don't show for unlimited storage unless there are alerts
    if (storageUsage.limit === -1 && alerts.length === 0) {
        return null;
    }

    const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));
    const calculatedCost = storageUsage.additionalStoragePrice 
        ? StorageAnalyticsService.calculateAdditionalStorageCost(additionalStorage, storageUsage.tier)
        : 0;

    return (
        <>
            <Card sx={{ mb: 2 }}>
                <CardContent>
                    {/* Header */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <StorageIcon color={storageUsage.warningLevel !== 'none' ? 'warning' : 'primary'} />
                            <Typography variant="h6">
                                Cloud Storage Usage
                            </Typography>
                            {storageUsage.warningLevel !== 'none' && (
                                <Chip 
                                    label={storageUsage.warningLevel.toUpperCase()} 
                                    color={getProgressColor(storageUsage.warningLevel) as any}
                                    size="small"
                                />
                            )}
                        </Box>
                        
                        <IconButton 
                            onClick={() => setShowDetails(!showDetails)}
                            size="small"
                        >
                            {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                    </Box>

                    {/* Usage Progress */}
                    <Box mb={2}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="textSecondary">
                                {storageUsage.used}GB used
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                {storageUsage.limit === -1 ? 'Unlimited' : `${storageUsage.limit}GB limit`}
                            </Typography>
                        </Box>
                        
                        {storageUsage.limit > 0 && (
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(storageUsage.percentage, 100)}
                                color={getProgressColor(storageUsage.warningLevel) as any}
                                sx={{ height: 8, borderRadius: 4 }}
                            />
                        )}
                        
                        {storageUsage.limit > 0 && (
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                                {storageUsage.percentage}% used
                            </Typography>
                        )}
                    </Box>

                    {/* Alerts */}
                    {visibleAlerts.map((alert) => (
                        <Alert
                            key={alert.id}
                            severity={getAlertSeverity(alert.type)}
                            sx={{ mb: 1 }}
                            action={
                                <IconButton
                                    size="small"
                                    onClick={() => handleDismissAlert(alert.id)}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            }
                        >
                            <AlertTitle>{alert.title}</AlertTitle>
                            {alert.message}
                        </Alert>
                    ))}

                    {/* Action Buttons */}
                    {(storageUsage.warningLevel !== 'none' || !compact) && (
                        <Box mt={2}>
                            <ButtonGroup variant="outlined" size="small" fullWidth>
                                {storageUsage.tier !== 'enterprise' && (
                                    <Button
                                        startIcon={<UpgradeIcon />}
                                        onClick={onUpgrade}
                                        color="primary"
                                    >
                                        Upgrade Plan
                                    </Button>
                                )}
                                
                                {storageUsage.canPurchaseAdditional && (
                                    <Button
                                        startIcon={<PurchaseIcon />}
                                        onClick={() => setPurchaseDialogOpen(true)}
                                        color="secondary"
                                    >
                                        Buy Storage
                                    </Button>
                                )}
                            </ButtonGroup>
                        </Box>
                    )}

                    {/* Detailed Information */}
                    <Collapse in={showDetails}>
                        <Box mt={2} pt={2} borderTop={1} borderColor="divider">
                            <Typography variant="subtitle2" gutterBottom>
                                Current Plan: {storageUsage.tier.toUpperCase()}
                            </Typography>
                            
                            {storageUsage.additionalStoragePrice && (
                                <Typography variant="body2" color="textSecondary">
                                    Additional storage: ${storageUsage.additionalStoragePrice}/GB/month
                                </Typography>
                            )}
                            
                            <Stack direction="row" spacing={1} mt={1}>
                                <Chip label={`${storageUsage.tier} tier`} size="small" />
                                {storageUsage.canPurchaseAdditional && (
                                    <Chip label="Storage expansion available" size="small" color="primary" />
                                )}
                            </Stack>
                        </Box>
                    </Collapse>
                </CardContent>
            </Card>

            {/* Purchase Storage Dialog */}
            <Dialog open={purchaseDialogOpen} onClose={() => setPurchaseDialogOpen(false)}>
                <DialogTitle>Purchase Additional Storage</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Add more cloud storage to your {storageUsage.tier} plan.
                    </Typography>
                    
                    <TextField
                        label="Additional Storage (GB)"
                        type="number"
                        value={additionalStorage}
                        onChange={(e) => setAdditionalStorage(Math.max(1, parseInt(e.target.value) || 1))}
                        fullWidth
                        sx={{ mb: 2 }}
                        inputProps={{ min: 1, max: 1000 }}
                    />
                    
                    {calculatedCost > 0 && (
                        <Alert severity="info">
                            <Typography variant="body2">
                                Cost: ${calculatedCost.toFixed(2)}/month for {additionalStorage}GB
                            </Typography>
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPurchaseDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handlePurchaseStorage}
                        variant="contained"
                        startIcon={<PurchaseIcon />}
                    >
                        Purchase ${calculatedCost.toFixed(2)}/month
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default StorageWarningCard;

/**
 * Simplified Mode Selection Component
 * 
 * A clear, user-friendly mode selection interface that eliminates confusion
 * and provides proper guidance for choosing between Standalone and Network modes.
 */

import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Grid,
    Chip,
    Alert,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    useTheme
} from '@mui/material';
import {
    Computer as ComputerIcon,
    NetworkWifi as NetworkIcon,
    Cloud as CloudIcon,
    Storage as StorageIcon,
    Group as GroupIcon,
    Security as SecurityIcon,
    Sync as SyncIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    Warning as WarningIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ApplicationMode } from '../types/applicationMode';
import { StorageMode, simplifiedStartupSequencer } from '../services/SimplifiedStartupSequencer';

interface SimplifiedModeSelectionProps {
    onModeSelected?: (mode: ApplicationMode, storageMode: StorageMode) => void;
}

interface ModeOption {
    mode: ApplicationMode;
    title: string;
    description: string;
    icon: React.ReactNode;
    benefits: string[];
    recommendedFor: string[];
    requirements: string[];
    availableStorageModes: StorageMode[];
    defaultStorageMode: StorageMode;
}

const MODE_OPTIONS: ModeOption[] = [
    {
        mode: 'standalone',
        title: 'Standalone Mode',
        description: 'Work offline with local projects and data storage',
        icon: <ComputerIcon fontSize="large" />,
        benefits: [
            'No internet connection required',
            'Maximum privacy and data control',
            'Fast local performance',
            'No subscription fees',
            'Complete offline capability'
        ],
        recommendedFor: ['Individual users', 'Offline work', 'Privacy-focused', 'Local development'],
        requirements: [],
        availableStorageModes: ['local'],
        defaultStorageMode: 'local'
    },
    {
        mode: 'shared_network',
        title: 'Network Mode',
        description: 'Collaborate with teams and access cloud projects',
        icon: <NetworkIcon fontSize="large" />,
        benefits: [
            'Real-time collaboration',
            'Cloud backup and sync',
            'Team project sharing',
            'Cross-device access',
            'Advanced features and integrations'
        ],
        recommendedFor: ['Teams', 'Collaboration', 'Cloud-first', 'Enterprise'],
        requirements: ['Active subscription', 'Internet connection'],
        availableStorageModes: ['cloud', 'hybrid'],
        defaultStorageMode: 'cloud'
    }
];

export const SimplifiedModeSelection: React.FC<SimplifiedModeSelectionProps> = ({
    onModeSelected
}) => {
    const [selectedMode, setSelectedMode] = useState<ApplicationMode | null>(null);
    const [selectedStorageMode, setSelectedStorageMode] = useState<StorageMode>('local');
    const [showStorageDialog, setShowStorageDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();

    const handleModeSelect = (modeOption: ModeOption) => {
        setSelectedMode(modeOption.mode);
        setSelectedStorageMode(modeOption.defaultStorageMode);
        
        // If only one storage mode available, proceed directly
        if (modeOption.availableStorageModes.length === 1) {
            handleProceed(modeOption.mode, modeOption.defaultStorageMode);
        } else {
            setShowStorageDialog(true);
        }
    };

    const handleProceed = async (mode: ApplicationMode, storageMode: StorageMode) => {
        setIsLoading(true);
        
        try {
            await simplifiedStartupSequencer.selectMode(mode, storageMode);
            onModeSelected?.(mode, storageMode);
        } catch (error) {
            console.error('Mode selection failed:', error);
            // Handle error - could show a toast or error message
        } finally {
            setIsLoading(false);
            setShowStorageDialog(false);
        }
    };

    const getStorageDescription = (storageMode: StorageMode): string => {
        switch (storageMode) {
            case 'local':
                return 'Store all project data on your local machine. No internet required, maximum privacy.';
            case 'cloud':
                return 'Store project data in the cloud for sharing, backup, and access from multiple devices.';
            case 'hybrid':
                return 'Combine local and cloud storage for optimal performance and flexibility.';
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography 
                    variant="h3" 
                    component="h1" 
                    gutterBottom
                    sx={{ 
                        fontWeight: 700,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 2
                    }}
                >
                    Choose Your Workspace Mode
                </Typography>
                <Typography 
                    variant="h6" 
                    color="text.secondary" 
                    sx={{ 
                        maxWidth: '600px', 
                        mx: 'auto',
                        opacity: 0.8
                    }}
                >
                    Select how you want to work with your projects. You can change this later in settings.
                </Typography>
            </Box>

            {/* Mode Selection Cards */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                {MODE_OPTIONS.map((option, index) => (
                    <Grid item xs={12} md={6} key={option.mode}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card
                                sx={{
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: selectedMode === option.mode ? 2 : 1,
                                    borderColor: selectedMode === option.mode ? 'primary.main' : 'divider',
                                    backgroundColor: selectedMode === option.mode ? 'background.elevated' : 'background.paper',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        transform: 'translateY(-4px)',
                                        boxShadow: (theme) => theme.shadows[8],
                                        backgroundColor: 'background.elevated'
                                    }
                                }}
                                onClick={() => handleModeSelect(option)}
                            >
                                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ 
                                            color: 'primary.main', 
                                            mr: 2,
                                            p: 1,
                                            borderRadius: 2,
                                            backgroundColor: 'rgba(0, 212, 255, 0.1)'
                                        }}>
                                            {option.icon}
                                        </Box>
                                        <Box>
                                            <Typography 
                                                variant="h5" 
                                                component="h2" 
                                                fontWeight="bold"
                                                color="text.primary"
                                            >
                                                {option.title}
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary"
                                                sx={{ opacity: 0.8 }}
                                            >
                                                {option.description}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mb: 3, flexGrow: 1 }}>
                                        <Typography 
                                            variant="subtitle2" 
                                            gutterBottom 
                                            color="primary"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            Benefits:
                                        </Typography>
                                        <List dense sx={{ py: 0 }}>
                                            {option.benefits.map((benefit, idx) => (
                                                <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                                        <CheckCircleIcon 
                                                            color="success" 
                                                            fontSize="small"
                                                            sx={{ color: 'success.main' }}
                                                        />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={benefit}
                                                        primaryTypographyProps={{ 
                                                            variant: 'body2',
                                                            color: 'text.primary'
                                                        }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography 
                                            variant="subtitle2" 
                                            gutterBottom
                                            color="text.primary"
                                            sx={{ fontWeight: 600 }}
                                        >
                                            Perfect for:
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {option.recommendedFor.map((use, idx) => (
                                                <Chip
                                                    key={idx}
                                                    label={use}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    sx={{
                                                        borderColor: 'primary.main',
                                                        color: 'primary.main',
                                                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(0, 212, 255, 0.2)'
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </Box>

                                    {option.requirements.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography 
                                                variant="subtitle2" 
                                                gutterBottom 
                                                color="warning.main"
                                                sx={{ fontWeight: 600 }}
                                            >
                                                Requirements:
                                            </Typography>
                                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                                {option.requirements.map((req, idx) => (
                                                    <Typography 
                                                        key={idx} 
                                                        component="li" 
                                                        variant="body2" 
                                                        color="text.secondary"
                                                    >
                                                        {req}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                </CardContent>

                                <CardActions sx={{ p: 3, pt: 0 }}>
                                    <Button
                                        fullWidth
                                        variant={selectedMode === option.mode ? "contained" : "outlined"}
                                        size="large"
                                        startIcon={selectedMode === option.mode ? <CheckCircleIcon /> : undefined}
                                        disabled={isLoading}
                                        sx={{
                                            height: 48,
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            borderRadius: 2,
                                            ...(selectedMode === option.mode ? {
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                                color: '#000000',
                                                boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)',
                                                '&:hover': {
                                                    background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
                                                    boxShadow: '0 6px 20px rgba(0, 212, 255, 0.4)',
                                                    transform: 'translateY(-1px)'
                                                }
                                            } : {
                                                borderColor: 'primary.main',
                                                color: 'primary.main',
                                                borderWidth: 2,
                                                '&:hover': {
                                                    borderColor: 'primary.light',
                                                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                                                    boxShadow: '0 4px 12px rgba(0, 212, 255, 0.2)',
                                                    transform: 'translateY(-1px)'
                                                }
                                            })
                                        }}
                                    >
                                        {selectedMode === option.mode ? 'Selected' : `Choose ${option.title}`}
                                    </Button>
                                </CardActions>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {/* Storage Mode Selection Dialog */}
            <Dialog 
                open={showStorageDialog} 
                onClose={() => setShowStorageDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        backgroundColor: 'background.paper',
                        borderRadius: 3,
                        border: 1,
                        borderColor: 'divider'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    pb: 1,
                    color: 'text.primary',
                    fontWeight: 600
                }}>
                    Choose Storage Mode
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Select how you want to store your project data for {selectedMode === 'standalone' ? 'Standalone' : 'Network'} mode.
                    </Typography>
                    
                    <FormControl component="fieldset" fullWidth>
                        <FormLabel component="legend" sx={{ color: 'text.primary', mb: 2 }}>
                            Storage Options
                        </FormLabel>
                        <RadioGroup
                            value={selectedStorageMode}
                            onChange={(e) => setSelectedStorageMode(e.target.value as StorageMode)}
                        >
                            {MODE_OPTIONS.find(o => o.mode === selectedMode)?.availableStorageModes.map((storageMode) => (
                                <FormControlLabel
                                    key={storageMode}
                                    value={storageMode}
                                    control={<Radio sx={{ color: 'primary.main' }} />}
                                    label={
                                        <Box>
                                            <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
                                                {storageMode.charAt(0).toUpperCase() + storageMode.slice(1)} Storage
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {getStorageDescription(storageMode)}
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ 
                                        mb: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        border: 1,
                                        borderColor: selectedStorageMode === storageMode ? 'primary.main' : 'divider',
                                        backgroundColor: selectedStorageMode === storageMode ? 'rgba(0, 212, 255, 0.05)' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 212, 255, 0.05)'
                                        }
                                    }}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 1 }}>
                    <Button 
                        onClick={() => setShowStorageDialog(false)}
                        sx={{
                            color: 'text.secondary',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleProceed(selectedMode!, selectedStorageMode)}
                        variant="contained"
                        disabled={isLoading}
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            color: '#000000',
                            fontWeight: 600,
                            px: 3,
                            '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`,
                                boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)'
                            }
                        }}
                    >
                        {isLoading ? 'Processing...' : 'Continue'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Help Text */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }}>
                    Need help choosing? <Button 
                        color="primary" 
                        sx={{ 
                            textTransform: 'none',
                            fontWeight: 500,
                            '&:hover': {
                                backgroundColor: 'rgba(0, 212, 255, 0.1)'
                            }
                        }}
                    >
                        Learn more about modes
                    </Button>
                </Typography>
            </Box>
        </Container>
    );
};

export default SimplifiedModeSelection;

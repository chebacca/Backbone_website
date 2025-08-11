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
    Divider
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
    requirements: string[];
    recommendedFor: string[];
    defaultStorageMode: StorageMode;
    availableStorageModes: StorageMode[];
}

const MODE_OPTIONS: ModeOption[] = [
    {
        mode: 'standalone',
        title: 'Standalone Mode',
        description: 'Work on projects individually with full control over your data and setup.',
        icon: <ComputerIcon sx={{ fontSize: 48 }} />,
        benefits: [
            'Work offline without internet connection',
            'Full control over project files and data',
            'No authentication required for local projects',
            'Perfect for individual work and prototyping',
            'Can optionally share via local network'
        ],
        requirements: [
            'Local storage space for project files',
            'Sufficient system resources'
        ],
        recommendedFor: [
            'Individual developers and designers',
            'Prototype and proof-of-concept work',
            'Offline or limited connectivity environments',
            'Maximum privacy and data control'
        ],
        defaultStorageMode: 'local',
        availableStorageModes: ['local', 'cloud', 'hybrid']
    },
    {
        mode: 'shared_network',
        title: 'Network Mode',
        description: 'Collaborate with team members in real-time with shared projects and resources.',
        icon: <NetworkIcon sx={{ fontSize: 48 }} />,
        benefits: [
            'Real-time collaboration with team members',
            'Shared project access and permissions',
            'Centralized data and asset management',
            'Built-in version control and conflict resolution',
            'Cross-platform synchronization'
        ],
        requirements: [
            'Stable internet connection',
            'User authentication and account',
            'Team organization setup'
        ],
        recommendedFor: [
            'Teams and collaborative projects',
            'Professional production environments',
            'Multi-user content management',
            'Organizations requiring shared workflows'
        ],
        defaultStorageMode: 'cloud',
        availableStorageModes: ['cloud', 'hybrid']
    }
];

export const SimplifiedModeSelection: React.FC<SimplifiedModeSelectionProps> = ({
    onModeSelected
}) => {
    const [selectedMode, setSelectedMode] = useState<ApplicationMode | null>(null);
    const [selectedStorageMode, setSelectedStorageMode] = useState<StorageMode>('local');
    const [showStorageDialog, setShowStorageDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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

    const getStorageIcon = (storageMode: StorageMode) => {
        switch (storageMode) {
            case 'local':
                return <ComputerIcon />;
            case 'cloud':
                return <CloudIcon />;
            case 'hybrid':
                return <StorageIcon />;
        }
    };

    const selectedModeOption = MODE_OPTIONS.find(option => option.mode === selectedMode);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Choose Your Workspace Mode
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
                    Select how you want to work with your projects. You can change this later.
                </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 4 }}>
                <Typography variant="body2">
                    <strong>New to the Dashboard?</strong> Standalone mode is perfect for getting started individually, 
                    while Network mode is ideal for team collaboration.
                </Typography>
            </Alert>

            <Grid container spacing={4} justifyContent="center">
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
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        transform: 'translateY(-4px)',
                                        boxShadow: (theme) => theme.shadows[8]
                                    }
                                }}
                                onClick={() => handleModeSelect(option)}
                            >
                                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ color: 'primary.main', mr: 2 }}>
                                            {option.icon}
                                        </Box>
                                        <Box>
                                            <Typography variant="h5" component="h2" fontWeight="bold">
                                                {option.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {option.description}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mb: 3, flexGrow: 1 }}>
                                        <Typography variant="subtitle2" gutterBottom color="primary">
                                            Benefits:
                                        </Typography>
                                        <List dense sx={{ py: 0 }}>
                                            {option.benefits.map((benefit, idx) => (
                                                <ListItem key={idx} sx={{ py: 0.5, px: 0 }}>
                                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                                        <CheckCircleIcon color="success" fontSize="small" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={benefit}
                                                        primaryTypographyProps={{ variant: 'body2' }}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>
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
                                                />
                                            ))}
                                        </Box>
                                    </Box>

                                    {option.requirements.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom color="warning.main">
                                                Requirements:
                                            </Typography>
                                            <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                                {option.requirements.map((req, idx) => (
                                                    <Typography key={idx} component="li" variant="body2" color="text.secondary">
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
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StorageIcon />
                        Choose Storage Mode
                    </Box>
                </DialogTitle>
                
                <DialogContent>
                    <Typography variant="body1" paragraph>
                        How would you like to store your project data for <strong>{selectedModeOption?.title}</strong>?
                    </Typography>

                    <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                            value={selectedStorageMode}
                            onChange={(e) => setSelectedStorageMode(e.target.value as StorageMode)}
                        >
                            {selectedModeOption?.availableStorageModes.map((storageMode) => (
                                <FormControlLabel
                                    key={storageMode}
                                    value={storageMode}
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ py: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                {getStorageIcon(storageMode)}
                                                <Typography variant="subtitle1" fontWeight="medium">
                                                    {storageMode.charAt(0).toUpperCase() + storageMode.slice(1)} Storage
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {getStorageDescription(storageMode)}
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ alignItems: 'flex-start', mx: 0, mb: 1 }}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>

                    {selectedStorageMode === 'cloud' && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                Cloud storage requires authentication and an active internet connection.
                            </Typography>
                        </Alert>
                    )}

                    {selectedStorageMode === 'hybrid' && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            <Typography variant="body2">
                                Hybrid storage provides the best of both worlds but requires careful sync management.
                            </Typography>
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 3 }}>
                    <Button
                        onClick={() => setShowStorageDialog(false)}
                        disabled={isLoading}
                    >
                        Back
                    </Button>
                    <Button
                        onClick={() => handleProceed(selectedMode!, selectedStorageMode)}
                        variant="contained"
                        disabled={isLoading}
                        startIcon={<CheckCircleIcon />}
                    >
                        {isLoading ? 'Setting up...' : 'Continue'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SimplifiedModeSelection;

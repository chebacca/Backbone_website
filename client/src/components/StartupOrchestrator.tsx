/**
 * Startup Orchestrator Component
 * 
 * The main component that manages the entire application startup flow
 * using the simplified startup sequencer. This replaces the complex
 * ApplicationStartupSequencer with a clean, linear flow.
 */

// @ts-nocheck
import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    CircularProgress,
    Typography,
    Alert,
    Button,
    LinearProgress,
    Fade,
    useTheme
} from '@mui/material';
import { 
    simplifiedStartupSequencer, 
    StartupState, 
    StartupStep,
    StorageMode 
} from '../services/SimplifiedStartupSequencer';
import { ApplicationMode } from '../types/applicationMode';
import SimplifiedModeSelection from './SimplifiedModeSelection';
import UnifiedProjectSelection from './UnifiedProjectSelection';
import LoginPage from '../pages/auth/LoginPage';

interface StartupOrchestratorProps {
    onStartupComplete?: (projectId: string) => void;
}

const STEP_TITLES: Record<StartupStep, string> = {
    mode_selection: 'Choose Your Workspace Mode',
    authentication: 'Sign In to Continue',
    project_selection: 'Select or Create a Project',
    complete: 'Loading Your Workspace'
};

const STEP_DESCRIPTIONS: Record<StartupStep, string> = {
    mode_selection: 'Select how you want to work with your projects',
    authentication: 'Authentication required for this mode',
    project_selection: 'Choose an existing project or create a new one',
    complete: 'Setting up your workspace...'
};

export const StartupOrchestrator: React.FC<StartupOrchestratorProps> = ({
    onStartupComplete
}) => {
    const [startupState, setStartupState] = useState<StartupState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const theme = useTheme();

    useEffect(() => {
        // Subscribe to startup sequencer state changes
        const unsubscribe = simplifiedStartupSequencer.subscribe((state) => {
            setStartupState(state);
            setIsLoading(false);

            // Handle startup completion
            if (state.currentStep === 'complete' && state.selectedProjectId) {
                setTimeout(() => {
                    onStartupComplete?.(state.selectedProjectId!);
                }, 1000); // Brief delay to show completion state
            }
        });

        return unsubscribe;
    }, [onStartupComplete]);

    const handleAuthenticationSuccess = (user: any) => {
        simplifiedStartupSequencer.onAuthenticationSuccess(user);
    };

    const handleModeSelected = (mode: ApplicationMode, storageMode: StorageMode) => {
        // The sequencer will automatically transition to the next step
        console.log('Mode selected:', mode, 'Storage:', storageMode);
    };

    const handleProjectSelected = (projectId: string) => {
        // The sequencer will complete the startup process
        console.log('Project selected:', projectId);
    };

    const handleBack = () => {
        if (startupState?.currentStep === 'authentication' || startupState?.currentStep === 'project_selection') {
            simplifiedStartupSequencer.selectMode(startupState.selectedMode || 'standalone', startupState.storageMode);
        }
    };

    const handleRetry = () => {
        simplifiedStartupSequencer.reset();
    };

    // Show loading while initializing
    if (!startupState) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 3, backgroundColor: 'background.default', color: 'text.primary' }} >
                <CircularProgress 
                    size={80} 
                    sx={{ 
                        color: 'primary.main',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                        }
                    }}
                />
                <Typography 
                    variant="h4" 
                    component="h1"
                    sx={{ 
                        fontWeight: 600,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textAlign: 'center'
                    }}
                >
                    Initializing Dashboard v14
                </Typography>
                <Typography 
                    variant="h6" 
                    color="text.secondary" 
                    textAlign="center"
                    sx={{ maxWidth: '400px' }}
                >
                    Setting up your workspace environment...
                </Typography>
            </Box>
        );
    }

    const renderStepContent = () => {
        switch (startupState.currentStep) {
            case 'mode_selection':
                return (
                    <SimplifiedModeSelection
                        onModeSelected={handleModeSelected}
                    />
                );

            case 'authentication':
                return (
                    <Container maxWidth="sm">
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Typography 
                                variant="h4" 
                                component="h1" 
                                gutterBottom
                                sx={{ 
                                    fontWeight: 600,
                                    color: 'text.primary'
                                }}
                            >
                                Authentication Required
                            </Typography>
                            <Typography 
                                variant="h6" 
                                color="text.secondary" 
                                paragraph
                                sx={{ mb: 3 }}
                            >
                                {startupState.selectedMode === 'shared_network' 
                                    ? 'Network mode requires authentication to access shared projects'
                                    : 'Cloud storage requires authentication to sync your data'
                                }
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={handleBack}
                                sx={{ 
                                    mt: 2,
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    '&:hover': {
                                        borderColor: 'primary.light',
                                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                                        boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)'
                                    }
                                }}
                            >
                                Back to Mode Selection
                            </Button>
                        </Box>
                        <LoginPage
                            onSuccess={handleAuthenticationSuccess}
                            mode={startupState.selectedMode}
                            redirectTo="/startup"
                        />
                    </Container>
                );

            case 'project_selection':
                return (
                    <UnifiedProjectSelection
                        mode={startupState.selectedMode!}
                        storageMode={startupState.storageMode}
                        onProjectSelected={handleProjectSelected}
                        onBack={handleBack}
                    />
                );

            case 'complete':
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 3, backgroundColor: 'background.default', color: 'text.primary' }} >
                        <CircularProgress 
                            size={80} 
                            sx={{ 
                                color: 'primary.main',
                                '& .MuiCircularProgress-circle': {
                                    strokeLinecap: 'round',
                                }
                            }}
                        />
                        <Typography 
                            variant="h4" 
                            component="h1" 
                            gutterBottom
                            sx={{ 
                                fontWeight: 600,
                                textAlign: 'center'
                            }}
                        >
                            Setting Up Your Workspace
                        </Typography>
                        <Typography 
                            variant="h6" 
                            color="text.secondary" 
                            textAlign="center"
                            sx={{ maxWidth: '500px' }}
                        >
                            Loading project "{startupState.selectedProjectId}" in{' '}
                            {startupState.selectedMode === 'standalone' ? 'Standalone' : 'Network'} mode
                        </Typography>
                        <LinearProgress 
                            sx={{ 
                                width: '300px', 
                                mt: 2,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                                }
                            }} 
                        />
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', color: 'text.primary' }}>
            {/* Progress Indicator */}
            {startupState.currentStep !== 'complete' && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
                    <LinearProgress
                        variant="determinate"
                        value={
                            startupState.currentStep === 'mode_selection' ? 25 :
                            startupState.currentStep === 'authentication' ? 50 :
                            startupState.currentStep === 'project_selection' ? 75 : 100
                        }
                        sx={{ 
                            height: 4,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiLinearProgress-bar': {
                                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                            }
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, backgroundColor: 'background.paper', borderBottom: 1, borderColor: 'divider', backdropFilter: 'blur(10px)', boxShadow: '0 2px 20px rgba(0, 0, 0, 0.3)' }} >
                        <Box>
                            <Typography 
                                variant="h5" 
                                component="h1"
                                sx={{ 
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    mb: 1
                                }}
                            >
                                {STEP_TITLES[startupState.currentStep]}
                            </Typography>
                            <Typography 
                                variant="body1" 
                                color="text.secondary"
                                sx={{ opacity: 0.8 }}
                            >
                                {STEP_DESCRIPTIONS[startupState.currentStep]}
                            </Typography>
                        </Box>
                        
                        {startupState.selectedMode && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, backgroundColor: 'background.elevated', px: 2, py: 1, borderRadius: 2, border: 1, borderColor: 'divider' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Mode: {startupState.selectedMode === 'standalone' ? 'Standalone' : 'Network'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Storage: {startupState.storageMode}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}

            {/* Error Handling */}
            {startupState.error && (
                <Container maxWidth="sm" sx={{ pt: startupState.currentStep !== 'complete' ? '140px' : '20px' }}>
                    <Alert
                        severity="error"
                        action={
                            <Button 
                                color="inherit" 
                                size="small" 
                                onClick={handleRetry}
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    color: 'error.contrastText',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                                    }
                                }}
                            >
                                Retry
                            </Button>
                        }
                        sx={{ 
                            mb: 3,
                            backgroundColor: 'error.dark',
                            color: 'error.contrastText',
                            '& .MuiAlert-icon': {
                                color: 'error.contrastText'
                            }
                        }}
                    >
                        <Typography variant="body2">
                            {startupState.error}
                        </Typography>
                    </Alert>
                </Container>
            )}

            {/* Main Content */}
            <Box sx={{ pt: startupState.currentStep !== 'complete' ? '140px' : 0 }}>
                {renderStepContent()}
            </Box>

            {/* Loading State Overlay */}
            <Fade in={startupState.isLoading}>
                <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(4px)' }} >
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, backgroundColor: 'background.paper', p: 4, borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)', border: 1, borderColor: 'divider' }} >
                        <CircularProgress 
                            size={60} 
                            sx={{ 
                                color: 'primary.main',
                                '& .MuiCircularProgress-circle': {
                                    strokeLinecap: 'round',
                                }
                            }}
                        />
                        <Typography variant="h6" color="text.primary">
                            Processing...
                        </Typography>
                    </Box>
                </Box>
            </Fade>
        </Box>
    );
};

export default StartupOrchestrator;

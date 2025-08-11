/**
 * Startup Orchestrator Component
 * 
 * The main component that manages the entire application startup flow
 * using the simplified startup sequencer. This replaces the complex
 * ApplicationStartupSequencer with a clean, linear flow.
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    CircularProgress,
    Typography,
    Alert,
    Button,
    LinearProgress,
    Fade
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
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
        // Navigate back to mode selection
        simplifiedStartupSequencer.reset();
    };

    const handleRetry = () => {
        // Retry the current step
        if (startupState?.currentStep === 'authentication') {
            // Refresh authentication
            window.location.reload();
        } else {
            // Reset to mode selection
            simplifiedStartupSequencer.reset();
        }
    };

    if (isLoading || !startupState) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: 2
                }}
            >
                <CircularProgress size={60} />
                <Typography variant="h6" color="text.secondary">
                    Initializing Dashboard...
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
                            <Typography variant="h4" component="h1" gutterBottom>
                                Authentication Required
                            </Typography>
                            <Typography variant="h6" color="text.secondary" paragraph>
                                {startupState.selectedMode === 'shared_network' 
                                    ? 'Network mode requires authentication to access shared projects'
                                    : 'Cloud storage requires authentication to sync your data'
                                }
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={handleBack}
                                sx={{ mt: 2 }}
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
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '50vh',
                            gap: 3
                        }}
                    >
                        <CircularProgress size={80} />
                        <Typography variant="h4" component="h1" gutterBottom>
                            Setting Up Your Workspace
                        </Typography>
                        <Typography variant="h6" color="text.secondary" textAlign="center">
                            Loading project "{startupState.selectedProjectId}" in{' '}
                            {startupState.selectedMode === 'standalone' ? 'Standalone' : 'Network'} mode
                        </Typography>
                        <LinearProgress sx={{ width: '300px', mt: 2 }} />
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
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
                        sx={{ height: 3 }}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            backgroundColor: 'background.paper',
                            borderBottom: 1,
                            borderColor: 'divider'
                        }}
                    >
                        <Box>
                            <Typography variant="h6" component="h1">
                                {STEP_TITLES[startupState.currentStep]}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {STEP_DESCRIPTIONS[startupState.currentStep]}
                            </Typography>
                        </Box>
                        
                        {startupState.selectedMode && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                <Container maxWidth="sm" sx={{ pt: startupState.currentStep !== 'complete' ? '120px' : '20px' }}>
                    <Alert
                        severity="error"
                        action={
                            <Button color="inherit" size="small" onClick={handleRetry}>
                                Retry
                            </Button>
                        }
                        sx={{ mb: 3 }}
                    >
                        <Typography variant="body2">
                            {startupState.error}
                        </Typography>
                    </Alert>
                </Container>
            )}

            {/* Main Content */}
            <Box sx={{ pt: startupState.currentStep !== 'complete' ? '120px' : 0 }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={startupState.currentStep}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>
            </Box>

            {/* Loading State Overlay */}
            <Fade in={startupState.isLoading}>
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000
                    }}
                >
                    <Box
                        sx={{
                            backgroundColor: 'background.paper',
                            borderRadius: 2,
                            p: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            minWidth: 200
                        }}
                    >
                        <CircularProgress />
                        <Typography variant="body1">
                            {startupState.currentStep === 'mode_selection' ? 'Applying mode...' :
                             startupState.currentStep === 'authentication' ? 'Authenticating...' :
                             startupState.currentStep === 'project_selection' ? 'Loading project...' :
                             'Processing...'}
                        </Typography>
                    </Box>
                </Box>
            </Fade>
        </Box>
    );
};

export default StartupOrchestrator;

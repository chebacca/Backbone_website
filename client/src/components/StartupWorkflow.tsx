/**
 * Startup Workflow Component
 * 
 * This component provides a unified startup experience that integrates
 * with the Global Theme provider and handles the complete startup sequence
 * for the desktop application.
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    CircularProgress,
    Typography,
    useTheme,
    Fade,
    Slide
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { StartupOrchestrator } from './StartupOrchestrator';

interface StartupWorkflowProps {
    onStartupComplete?: (projectId: string) => void;
    onStartupError?: (error: string) => void;
}

interface StartupState {
    isInitializing: boolean;
    currentStep: 'initializing' | 'startup' | 'complete' | 'error';
    error?: string;
}

export const StartupWorkflow: React.FC<StartupWorkflowProps> = ({
    onStartupComplete,
    onStartupError
}) => {
    const [startupState, setStartupState] = useState<StartupState>({
        isInitializing: true,
        currentStep: 'initializing'
    });
    const theme = useTheme();

    useEffect(() => {
        // Simulate initialization process
        const initializeApp = async () => {
            try {
                // Show initialization for a brief moment
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                setStartupState({
                    isInitializing: false,
                    currentStep: 'startup'
                });
            } catch (error) {
                setStartupState({
                    isInitializing: false,
                    currentStep: 'error',
                    error: 'Failed to initialize application'
                });
                onStartupError?.('Failed to initialize application');
            }
        };

        initializeApp();
    }, [onStartupError]);

    const handleStartupComplete = (projectId: string) => {
        setStartupState({
            isInitializing: false,
            currentStep: 'complete'
        });
        
        // Brief delay to show completion state
        setTimeout(() => {
            onStartupComplete?.(projectId);
        }, 1000);
    };

    const handleStartupError = (error: string) => {
        setStartupState({
            isInitializing: false,
            currentStep: 'error',
            error
        });
        onStartupError?.(error);
    };

    // Show initialization screen
    if (startupState.currentStep === 'initializing') {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: 4,
                    backgroundColor: 'background.default',
                    color: 'text.primary',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background gradient effect */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `radial-gradient(circle at 50% 50%, ${theme.palette.primary.main}15 0%, transparent 70%)`,
                        animation: 'pulse 4s ease-in-out infinite'
                    }}
                />
                
                {/* Logo/Brand */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <Box
                        sx={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 8px 32px ${theme.palette.primary.main}40`,
                            mb: 3
                        }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 700,
                                color: '#000000',
                                textAlign: 'center'
                            }}
                        >
                            D14
                        </Typography>
                    </Box>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                >
                    <Typography
                        variant="h3"
                        component="h1"
                        sx={{
                            fontWeight: 700,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textAlign: 'center',
                            mb: 2
                        }}
                    >
                        Dashboard v14
                    </Typography>
                </motion.div>

                {/* Subtitle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                >
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{
                            textAlign: 'center',
                            maxWidth: '500px',
                            opacity: 0.8,
                            mb: 4
                        }}
                    >
                        Professional project management and collaboration platform
                    </Typography>
                </motion.div>

                {/* Loading indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
                >
                    <CircularProgress
                        size={60}
                        sx={{
                            color: 'primary.main',
                            '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                            }
                        }}
                    />
                </motion.div>

                {/* Status text */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
                >
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                            textAlign: 'center',
                            opacity: 0.7
                        }}
                    >
                        Initializing application...
                    </Typography>
                </motion.div>
            </Box>
        );
    }

    // Show startup sequence
    if (startupState.currentStep === 'startup') {
        return (
            <Slide direction="up" in={true} mountOnEnter unmountOnExit>
                <Box sx={{ minHeight: '100vh' }}>
                    <StartupOrchestrator
                        onStartupComplete={handleStartupComplete}
                    />
                </Box>
            </Slide>
        );
    }

    // Show completion state
    if (startupState.currentStep === 'complete') {
        return (
            <Fade in={true}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        gap: 3,
                        backgroundColor: 'background.default',
                        color: 'text.primary'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 4px 20px ${theme.palette.success.main}40`
                            }}
                        >
                            <Typography
                                variant="h3"
                                sx={{
                                    color: 'success.contrastText',
                                    fontWeight: 700
                                }}
                            >
                                ✓
                            </Typography>
                        </Box>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                    >
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                            fontWeight: 600,
                            textAlign: 'center',
                            mb: 2
                        }}
                        >
                            Ready to Launch!
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
                    >
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{
                                textAlign: 'center',
                                opacity: 0.8
                            }}
                        >
                            Your workspace is ready. Launching application...
                        </Typography>
                    </motion.div>
                </Box>
            </Fade>
        );
    }

    // Show error state
    if (startupState.currentStep === 'error') {
        return (
            <Fade in={true}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        gap: 3,
                        backgroundColor: 'background.default',
                        color: 'text.primary',
                        p: 4
                    }}
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.light} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 4px 20px ${theme.palette.error.main}40`
                            }}
                        >
                            <Typography
                                variant="h3"
                                sx={{
                                    color: 'error.contrastText',
                                    fontWeight: 700
                                }}
                            >
                                ✗
                            </Typography>
                        </Box>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                    >
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 600,
                                textAlign: 'center',
                                mb: 2
                            }}
                        >
                            Startup Failed
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
                    >
                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{
                                textAlign: 'center',
                                opacity: 0.8,
                                maxWidth: '600px'
                            }}
                        >
                            {startupState.error || 'An unexpected error occurred during startup. Please try again.'}
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                textAlign: 'center',
                                opacity: 0.6,
                                mt: 2
                            }}
                        >
                            Please restart the application or contact support if the problem persists.
                        </Typography>
                    </motion.div>
                </Box>
            </Fade>
        );
    }

    return null;
};

export default StartupWorkflow;

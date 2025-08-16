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
    Fade
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { StartupOrchestrator } from './StartupOrchestrator';

interface StartupWorkflowProps {
    onStartupComplete?: (projectId: string) => void;
    onStartupError?: (error: string) => void;
    isDashboardMode?: boolean;
}

interface StartupState {
    isInitializing: boolean;
    currentStep: 'initializing' | 'startup' | 'complete' | 'error';
    error?: string;
}

export const StartupWorkflow: React.FC<StartupWorkflowProps> = ({
    onStartupComplete,
    onStartupError,
    isDashboardMode = false
}) => {
    const [startupState, setStartupState] = useState<StartupState>({
        isInitializing: true,
        currentStep: 'initializing'
    });
    const theme = useTheme();
    const navigate = useNavigate();
    
    // Auto-detect if we're in dashboard mode based on current path
    const currentIsDashboardMode = isDashboardMode || window.location.pathname.includes('/dashboard/startup');

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
            
            // Navigate to dashboard or cloud projects based on mode
            if (currentIsDashboardMode) {
                navigate('/dashboard/cloud-projects');
            } else {
                navigate('/dashboard');
            }
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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 4, backgroundColor: 'background.default', color: 'text.primary', position: 'relative', overflow: 'hidden' }} >
                {/* Background gradient effect */}
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(circle at 50% 50%, ${theme.palette.primary.main}15 0%, transparent 70%)`, animation: 'pulse 4s ease-in-out infinite' }} />
                
                {/* Logo/Brand */}
                <div className="startup-logo-animation" >
                    <Box sx={{ width: 120, height: 120, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 32px ${theme.palette.primary.main}40`, mb: 3 }} >
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
                </div>

                {/* Title */}
                <div className="startup-title-animation" >
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
                </div>

                {/* Subtitle */}
                <div className="startup-subtitle-animation" >
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
                </div>

                {/* Loading indicator */}
                <div className="startup-loading-animation" >
                    <CircularProgress
                        size={60}
                        sx={{
                            color: 'primary.main',
                            '& .MuiCircularProgress-circle': {
                                strokeLinecap: 'round',
                            }
                        }}
                    />
                </div>

                {/* Status text */}
                <div className="startup-status-animation" >
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
                </div>
            </Box>
        );
    }

    // Show startup sequence
    if (startupState.currentStep === 'startup') {
        return (
            <Fade in={true}>
                <Box sx={{ minHeight: '100vh' }}>
                    <StartupOrchestrator
                        onStartupComplete={handleStartupComplete}
                    />
                </Box>
            </Fade>
        );
    }

    // Show completion state
    if (startupState.currentStep === 'complete') {
        return (
            <Fade in={true}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 3, backgroundColor: 'background.default', color: 'text.primary' }} >
                    <div className="startup-success-animation" >
                        <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 20px ${theme.palette.success.main}40` }} >
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
                    </div>

                    <div className="startup-success-title-animation" >
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
                    </div>

                    <div className="startup-success-subtitle-animation" >
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
                    </div>
                </Box>
            </Fade>
        );
    }

    // Show error state
    if (startupState.currentStep === 'error') {
        return (
            <Fade in={true}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 3, backgroundColor: 'background.default', color: 'text.primary', p: 4 }} >
                    <div className="startup-error-animation" >
                        <Box sx={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.light} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 20px ${theme.palette.error.main}40` }} >
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
                    </div>

                    <div className="startup-error-title-animation" >
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
                    </div>

                    <div className="startup-error-subtitle-animation" >
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
                    </div>

                    <div className="startup-error-message-animation" >
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
                    </div>
                </Box>
            </Fade>
        );
    }

    return null;
};

export default StartupWorkflow;

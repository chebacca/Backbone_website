/**
 * Example App.tsx Integration
 * 
 * This shows how to integrate the new Simplified Startup System
 * with your main App component, replacing the old ApplicationStartupSequencer.
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// New simplified startup system
import StartupOrchestrator from './components/StartupOrchestrator';
import { simplifiedStartupSequencer } from './services/SimplifiedStartupSequencer';

// Your existing main application components
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import SessionsPage from './pages/SessionsPage';
import SettingsPage from './pages/SettingsPage';

// Theme and providers
import { theme } from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';

// Create query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            refetchOnWindowFocus: false,
        },
    },
});

interface AppState {
    startupComplete: boolean;
    selectedProjectId: string | null;
    userAuthenticated: boolean;
    currentMode: 'standalone' | 'shared_network' | null;
    storageMode: 'local' | 'cloud' | 'hybrid' | null;
}

function App() {
    const [appState, setAppState] = useState<AppState>({
        startupComplete: false,
        selectedProjectId: null,
        userAuthenticated: false,
        currentMode: null,
        storageMode: null
    });

    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // Subscribe to startup sequencer state changes
        const unsubscribe = simplifiedStartupSequencer.subscribe((startupState) => {
            setAppState(prev => ({
                ...prev,
                userAuthenticated: startupState.isAuthenticated,
                currentMode: startupState.selectedMode,
                storageMode: startupState.storageMode,
                selectedProjectId: startupState.selectedProjectId
            }));
        });

        // Check if startup is already complete (page refresh scenario)
        const currentState = simplifiedStartupSequencer.getState();
        if (currentState.currentStep === 'complete' && currentState.selectedProjectId) {
            setAppState(prev => ({
                ...prev,
                startupComplete: true,
                selectedProjectId: currentState.selectedProjectId,
                userAuthenticated: currentState.isAuthenticated,
                currentMode: currentState.selectedMode,
                storageMode: currentState.storageMode
            }));
        }

        setIsInitializing(false);

        return unsubscribe;
    }, []);

    const handleStartupComplete = (projectId: string) => {
        console.log('🎉 Startup completed with project:', projectId);
        
        setAppState(prev => ({
            ...prev,
            startupComplete: true,
            selectedProjectId: projectId
        }));

        // Optional: Emit application-ready event
        window.dispatchEvent(new CustomEvent('app:ready', {
            detail: {
                projectId,
                mode: appState.currentMode,
                storageMode: appState.storageMode,
                authenticated: appState.userAuthenticated
            }
        }));
    };

    const handleResetToStartup = async () => {
        console.log('🔄 Resetting to startup...');
        
        setAppState({
            startupComplete: false,
            selectedProjectId: null,
            userAuthenticated: false,
            currentMode: null,
            storageMode: null
        });

        await simplifiedStartupSequencer.reset();
    };

    // Show loading while initializing
    if (isInitializing) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        backgroundColor: 'background.default'
                    }}
                >
                    <div>Loading Dashboard...</div>
                </Box>
            </ThemeProvider>
        );
    }

    // Show startup flow if not complete
    if (!appState.startupComplete) {
        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <StartupOrchestrator onStartupComplete={handleStartupComplete} />
            </ThemeProvider>
        );
    }

    // Main application with all providers
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryClientProvider client={queryClient}>
                <AuthProvider 
                    initialAuth={appState.userAuthenticated}
                    mode={appState.currentMode}
                >
                    <ProjectProvider 
                        initialProjectId={appState.selectedProjectId}
                        mode={appState.currentMode}
                        storageMode={appState.storageMode}
                    >
                        <Router>
                            <MainLayout
                                currentMode={appState.currentMode}
                                storageMode={appState.storageMode}
                                onResetToStartup={handleResetToStartup}
                            >
                                <Routes>
                                    {/* Main application routes */}
                                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                    <Route 
                                        path="/dashboard" 
                                        element={
                                            <DashboardPage 
                                                projectId={appState.selectedProjectId}
                                                mode={appState.currentMode}
                                            />
                                        } 
                                    />
                                    <Route 
                                        path="/projects" 
                                        element={
                                            <ProjectsPage 
                                                currentProjectId={appState.selectedProjectId}
                                                mode={appState.currentMode}
                                                storageMode={appState.storageMode}
                                            />
                                        } 
                                    />
                                    <Route 
                                        path="/sessions" 
                                        element={
                                            <SessionsPage 
                                                projectId={appState.selectedProjectId}
                                                mode={appState.currentMode}
                                            />
                                        } 
                                    />
                                    <Route 
                                        path="/settings" 
                                        element={
                                            <SettingsPage 
                                                mode={appState.currentMode}
                                                storageMode={appState.storageMode}
                                                onModeChange={handleResetToStartup}
                                            />
                                        } 
                                    />

                                    {/* Catch-all redirect */}
                                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                                </Routes>
                            </MainLayout>
                        </Router>
                    </ProjectProvider>
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}

export default App;

// Optional: Export app state for debugging
if (typeof window !== 'undefined') {
    (window as any).getAppState = () => ({
        startupSequencer: simplifiedStartupSequencer.getState(),
        app: 'Check React DevTools for component state'
    });
}

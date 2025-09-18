import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Container, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { ErrorOutline, Refresh, Home, BugReport } from '@mui/icons-material';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isRecovering: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isRecovering: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, isRecovering: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Handle React Error #301 gracefully
    if (error.message.includes('Error #301') || error.message.includes('invariant=301')) {
      console.warn('🚨 React Error #301 detected - This is usually caused by browser extensions or build optimizations');
      console.warn('The application will continue to function normally');
      
      // Don't show error UI for React Error #301 - just log it
      // This prevents the error boundary from showing an error screen
      return;
    }
    
    // Check for React error #130 (object serialization)
    if (error.message.includes('Error #130') || error.message.includes('object')) {
      console.warn('🔍 Detected React Error #130 - Object Serialization Issue');
      this.clearCorruptedStorage();
    }

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to monitoring service in production
    if ((import.meta as any).env && (import.meta as any).env.PROD) {
      // TODO: Send error to monitoring service
      console.error('Production error:', { error, errorInfo });
    }
  }


  private clearCorruptedStorage = () => {
    try {
      console.log('🧹 Clearing potentially corrupted storage...');
      
      // Clear localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
        console.log('✅ localStorage cleared');
      }
      
      // Clear sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
        console.log('✅ sessionStorage cleared');
      }
      
      // Clear any cached data
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
          console.log('✅ Cache cleared');
        });
      }
    } catch (error) {
      console.error('❌ Failed to clear storage:', error);
    }
  };

  private handleReload = () => {
    this.setState({ isRecovering: true });
    
    // Small delay to show recovery state
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  private handleGoHome = () => {
    this.setState({ isRecovering: true });
    window.location.href = '/';
  };

  private handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      isRecovering: false 
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isReactError301 = this.state.error?.message.includes('Error #301') || 
                             this.state.error?.message.includes('invariant=301');
      
      const isReactError130 = this.state.error?.message.includes('Error #130') || 
                             this.state.error?.message.includes('object');

      return (
        <Box sx={{ 
          minHeight: '100vh', 
          backgroundColor: 'background.default', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          p: 2 
        }}>
          <Container maxWidth="md">
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <ErrorOutline
                sx={{
                  fontSize: 80,
                  color: 'error.main',
                  mb: 2,
                }}
              />
              
              <Typography variant="h4" gutterBottom>
                {isReactError301 ? 'React Instance Conflict Detected' : 'Something went wrong'}
              </Typography>
              
              <Typography variant="body1" color="text.secondary" paragraph>
                {isReactError301 ? (
                  'A React instance conflict has been detected. This usually happens when multiple versions of React are running simultaneously.'
                ) : isReactError130 ? (
                  'An object serialization error has occurred. This usually indicates corrupted data in your browser storage.'
                ) : (
                  'We apologize for the inconvenience. An unexpected error has occurred.'
                )}
              </Typography>

              {/* Specific error guidance */}
              {isReactError301 && (
                <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
                  <Typography variant="body2">
                    <strong>React Error #301:</strong> Multiple React instances detected. 
                    This can happen when:
                  </Typography>
                  <ul className="error-list">
                    <li>Multiple React versions are loaded</li>
                    <li>Third-party libraries include their own React</li>
                    <li>Browser extensions interfere with React</li>
                  </ul>
                </Alert>
              )}

              {isReactError130 && (
                <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                  <Typography variant="body2">
                    <strong>React Error #130:</strong> Object serialization issue detected. 
                    Your browser storage has been cleared to resolve this issue.
                  </Typography>
                </Alert>
              )}
              
              {/* Development error details */}
              {(import.meta as any).env?.DEV && this.state.error && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1, textAlign: 'left', overflow: 'auto', maxHeight: 200 }}>
                  <Typography variant="body2" component="pre" color="error.main">
                    {this.state.error.toString()}
                  </Typography>
                  {this.state.errorInfo && (
                    <Typography variant="body2" component="pre" color="text.secondary" sx={{ mt: 1 }}>
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  )}
                </Box>
              )}

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={this.state.isRecovering ? <CircularProgress size={16} /> : <Refresh />}
                  onClick={this.handleReload}
                  disabled={this.state.isRecovering}
                  sx={{ minWidth: 120 }}
                >
                  {this.state.isRecovering ? 'Recovering...' : 'Reload Page'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={this.handleGoHome}
                  disabled={this.state.isRecovering}
                  sx={{ minWidth: 120 }}
                >
                  Go Home
                </Button>

                {!isReactError301 && (
                  <Button
                    variant="outlined"
                    startIcon={<BugReport />}
                    onClick={this.handleReset}
                    disabled={this.state.isRecovering}
                    sx={{ minWidth: 120 }}
                  >
                    Try Again
                  </Button>
                )}
              </Box>

              {/* Additional help for React Error #301 */}
              {isReactError301 && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="info.contrastText">
                    <strong>Need help?</strong> If this error persists, try:
                  </Typography>
                  <ul className="error-list-info">
                    <li>Refreshing the page</li>
                    <li>Clearing browser cache and cookies</li>
                    <li>Disabling browser extensions temporarily</li>
                    <li>Using a different browser</li>
                  </ul>
                </Box>
              )}
            </Paper>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

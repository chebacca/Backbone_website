import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service in production
    if ((import.meta as any).env && (import.meta as any).env.PROD) {
      // TODO: Send error to monitoring service
      console.error('Production error:', { error, errorInfo });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, }} >
          <Container maxWidth="md">
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: 'background.paper',
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
                Oops! Something went wrong
              </Typography>
              
              <Typography variant="body1" color="text.secondary" paragraph>
                We apologize for the inconvenience. An unexpected error has occurred.
                Our team has been notified and is working to fix this issue.
              </Typography>

              {(import.meta as any).env?.DEV && this.state.error && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1, textAlign: 'left', overflow: 'auto', maxHeight: 200, }} >
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

              <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={this.handleReload}
                >
                  Reload Page
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={this.handleGoHome}
                >
                  Go Home
                </Button>
              </Box>
            </Paper>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

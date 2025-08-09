import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import { theme } from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { StripeProvider } from './context/StripeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingProvider>
          <StripeProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </StripeProvider>
        </LoadingProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

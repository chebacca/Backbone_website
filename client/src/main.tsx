import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { StripeProvider } from './context/StripeContext';
import './index.css';

// Simple error handling for React Error #301
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && 
      (event.error.message.includes('Error #301') || event.error.message.includes('invariant=301'))) {
    console.warn('🚨 React Error #301 caught by global handler - suppressing error display');
    event.preventDefault();
    return false;
  }
});

// Inject Google and Apple scripts (deferred) and set up Google callback
const injectAuthProviderScripts = () => {
  // Google Identity Services
  const googleClientId = (import.meta as any).env.VITE_GOOGLE_CLIENT_ID;
  if (googleClientId && !(window as any).google) {
    const onload = () => {
      const anyWindow = window as any;
      if (!anyWindow.google?.accounts?.id) return;
      anyWindow.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: any) => {
          const credential = response?.credential;
          if (!credential) return;
          // Dispatch a custom event for pages to handle
          window.dispatchEvent(new CustomEvent('google-credential', { detail: { credential } }));
        },
        auto_select: false,
        ux_mode: 'popup',
      });
    };
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = onload;
    document.head.appendChild(script);
  }

  // Apple Sign In JS
  const appleClientId = (import.meta as any).env.VITE_APPLE_CLIENT_ID;
  if (appleClientId && !(window as any).AppleID) {
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.onload = () => {
      const anyWindow = window as any;
      try {
        anyWindow.AppleID?.auth?.init({
          clientId: appleClientId,
          scope: 'name email',
          redirectURI: (import.meta as any).env.VITE_APPLE_REDIRECT_URI || window.location.origin,
          usePopup: true,
        });
      } catch {}
    };
    document.head.appendChild(script);
  }
};

injectAuthProviderScripts();

// Global error handler for React Error #301
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && 
      (event.error.message.includes('Error #301') || event.error.message.includes('invariant=301'))) {
    console.warn('🚨 React Error #301 caught by global handler - suppressing error display');
    event.preventDefault(); // Prevent the error from being logged to console
    return false;
  }
});

// Create React root once and render
const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <BrowserRouter>
    <CssBaseline />
    <LoadingProvider>
      <StripeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </StripeProvider>
    </LoadingProvider>
  </BrowserRouter>
);

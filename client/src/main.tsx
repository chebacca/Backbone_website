import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { StripeProvider } from './context/StripeContext';
import { ReactError301Prevention } from './utils/reactErrorPrevention';
import './index.css';

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

// Initialize React error prevention system
ReactError301Prevention.getInstance().initialize();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
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
  </React.StrictMode>
);

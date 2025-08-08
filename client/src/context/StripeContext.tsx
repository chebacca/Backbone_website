import React, { createContext, useContext, ReactNode } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Type declarations for Vite environment variables
declare global {
  interface ImportMetaEnv {
    readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey || stripeKey === 'pk_test_your_stripe_publishable_key_here') {
  console.warn('Stripe publishable key not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file.');
}

const stripePromise = loadStripe(stripeKey || '');

interface StripeContextType {
  stripe: Promise<Stripe | null>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

interface StripeProviderProps {
  children: ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const contextValue: StripeContextType = {
    stripe: stripePromise,
  };

  const options = {
    // Add global Stripe options here
    appearance: {
      theme: 'night' as const,
      variables: {
        colorPrimary: '#00d4ff',
        colorBackground: '#1a1a2e',
        colorText: '#ffffff',
        colorDanger: '#f44336',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
      rules: {
        '.Input': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
        },
        '.Input:focus': {
          borderColor: '#00d4ff',
          boxShadow: '0 0 0 2px rgba(0, 212, 255, 0.2)',
        },
        '.Label': {
          color: 'rgba(255, 255, 255, 0.7)',
          fontWeight: '500',
        },
        '.Tab': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
        },
        '.Tab:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        '.Tab--selected': {
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
          borderColor: '#00d4ff',
        },
      },
    },
  };

  return (
    <StripeContext.Provider value={contextValue}>
      <Elements stripe={stripePromise} options={options}>
        {children}
      </Elements>
    </StripeContext.Provider>
  );
};

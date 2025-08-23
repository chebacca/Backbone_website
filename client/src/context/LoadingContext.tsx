import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Backdrop, CircularProgress, Box } from '@mui/material';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  loadingMessage?: string;
  setLoadingMessage: (message?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    // Return a safe default instead of throwing an error
    console.warn('useLoading called outside of LoadingProvider, returning default values');
    return {
      isLoading: false,
      setLoading: () => {}, // No-op function
      loadingMessage: undefined,
      setLoadingMessage: () => {}, // No-op function
    };
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>();

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (!loading) {
      setLoadingMessage(undefined);
    }
  };

  const contextValue: LoadingContextType = {
    isLoading,
    setLoading,
    loadingMessage,
    setLoadingMessage,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
        open={isLoading}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="primary" size={60} />
          {loadingMessage && (
            <Box sx={{ marginTop: 2, fontSize: '1.1rem' }}>
              {loadingMessage}
            </Box>
          )}
        </Box>
      </Backdrop>
    </LoadingContext.Provider>
  );
};

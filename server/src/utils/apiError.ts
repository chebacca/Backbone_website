/**
 * API Error Utility
 * 
 * Provides consistent error creation and handling for API responses
 */

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  details?: any;
}

export const createApiError = (
  message: string, 
  statusCode: number = 400, 
  error?: string, 
  details?: any
): ApiError => {
  return {
    message,
    statusCode,
    error,
    details
  };
};

export const isApiError = (error: any): error is ApiError => {
  return error && typeof error === 'object' && 'message' in error && 'statusCode' in error;
};

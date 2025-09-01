/**
 * Validation Utility
 * 
 * Handles Express validation errors and provides consistent error responses
 */

import { ValidationError } from 'express-validator';
import { createApiError } from './apiError.js';

export const validationErrorHandler = (errors: ValidationError[]) => {
  const errorMessages = errors.map(error => error.msg || 'Validation failed');
  const message = errorMessages.join(', ');
  
  return createApiError(message, 400, 'VALIDATION_ERROR', {
    errors: errors.map(error => ({
      field: (error as any).path || (error as any).param || 'unknown',
      message: error.msg || 'Invalid value',
      value: (error as any).value || 'unknown'
    }))
  });
};

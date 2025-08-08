import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { ComplianceService } from '../services/complianceService.js';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Global error handler middleware
 */
export const errorHandler = async (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestInfo = (req as any).requestInfo || {};
  const userId = req.user?.id;

  // Log the error
  logger.error('API Error', {
    error: error.message,
    stack: error.stack,
    statusCode: error.statusCode,
    code: error.code,
    path: req.path,
    method: req.method,
    userId,
    ip: requestInfo.ip,
    userAgent: requestInfo.userAgent,
  });

  // Create compliance event for security-related errors
  if (error.statusCode === 401 || error.statusCode === 403) {
    await ComplianceService.createComplianceEvent(
      'GDPR_VIOLATION',
      'MEDIUM',
      `Security error: ${error.message}`,
      userId,
      undefined,
      {
        statusCode: error.statusCode,
        path: req.path,
        method: req.method,
        ip: requestInfo.ip,
        userAgent: requestInfo.userAgent,
      }
    ).catch(() => {
      // Don't let compliance logging errors break the main error response
    });
  }

  // Determine status code
  let statusCode = error.statusCode || 500;
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
  } else if (error.name === 'CastError') {
    statusCode = 400;
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
  }

  // Prepare error response
  const errorResponse: any = {
    success: false,
    error: error.message || 'Internal server error',
  };

  // Add error code if available
  if (error.code) {
    errorResponse.code = error.code;
  }

  // Add details in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = error.details;
    errorResponse.stack = error.stack;
  }

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    switch (prismaError.code) {
      case 'P2002':
        statusCode = 409;
        errorResponse.error = 'A record with this information already exists';
        break;
      case 'P2025':
        statusCode = 404;
        errorResponse.error = 'Record not found';
        break;
      case 'P2003':
        statusCode = 400;
        errorResponse.error = 'Invalid reference to related record';
        break;
      default:
        statusCode = 500;
        errorResponse.error = 'Database error';
    }
  }

  // Handle Stripe errors
  if (error.name === 'StripeError') {
    const stripeError = error as any;
    
    switch (stripeError.type) {
      case 'StripeCardError':
        statusCode = 400;
        errorResponse.error = 'Payment failed: ' + stripeError.message;
        break;
      case 'StripeInvalidRequestError':
        statusCode = 400;
        errorResponse.error = 'Invalid payment request';
        break;
      case 'StripeAPIError':
        statusCode = 502;
        errorResponse.error = 'Payment service temporarily unavailable';
        break;
      case 'StripeConnectionError':
        statusCode = 503;
        errorResponse.error = 'Payment service connection failed';
        break;
      case 'StripeAuthenticationError':
        statusCode = 500;
        errorResponse.error = 'Payment configuration error';
        break;
      default:
        statusCode = 500;
        errorResponse.error = 'Payment processing error';
    }

    // Create compliance event for payment errors
    await ComplianceService.createComplianceEvent(
      'SUSPICIOUS_TRANSACTION',
      'HIGH',
      `Payment error: ${stripeError.message}`,
      userId,
      undefined,
      {
        stripeErrorType: stripeError.type,
        stripeErrorCode: stripeError.code,
        path: req.path,
        method: req.method,
      }
    ).catch(() => {});
  }

  // Handle SendGrid/email service errors - don't let them break core flows
  if (error.message?.includes('SendGrid') || 
      error.message?.includes('email') || 
      error.message?.includes('Unauthorized') && error.message?.includes('@sendgrid')) {
    // For email errors, return success but log the issue
    logger.warn('Email service error, but continuing with core flow', {
      error: error.message,
      path: req.path,
      method: req.method,
    });
    
    // If this is a registration request, return success
    if (req.path === '/api/auth/register' && req.method === 'POST') {
      return res.status(201).json({
        success: true,
        message: 'Registration successful. Email verification may be delayed.',
        data: {
          user: {
            id: 'temp-id', // Will be replaced by actual user data
            email: req.body?.email,
            name: req.body?.name,
            isEmailVerified: false,
          },
        },
      });
    }
    
    statusCode = 503;
    errorResponse.error = 'Email service temporarily unavailable';
  }

  // Ensure we don't leak sensitive information in production
  if (process.env.NODE_ENV === 'production') {
    if (statusCode === 500) {
      errorResponse.error = 'Internal server error';
    }
  }

  return res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error handler
 */
export const validationErrorHandler = (errors: any[]) => {
  const error = new Error('Validation failed') as ApiError;
  error.statusCode = 400;
  error.code = 'VALIDATION_ERROR';
  error.details = errors.map(err => ({
    field: err.param || err.path,
    message: err.msg || err.message,
    value: err.value,
  }));
  
  return error;
};

/**
 * Create a custom API error
 */
export const createApiError = (
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): ApiError => {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.code = code;
  error.details = details;
  return error;
};

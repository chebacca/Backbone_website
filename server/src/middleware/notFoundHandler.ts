import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response) => {
  const requestInfo = (req as any).requestInfo || {};
  
  logger.warn('404 Not Found', {
    path: req.path,
    method: req.method,
    ip: requestInfo.ip,
    userAgent: requestInfo.userAgent,
    userId: req.user?.id,
  });

  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
};

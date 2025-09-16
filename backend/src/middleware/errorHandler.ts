import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({ success: false, message: 'Not Found' });
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (status >= 500) logger.error('Unhandled error:', { message, stack: err.stack });
  res.status(status).json({ success: false, message });
}

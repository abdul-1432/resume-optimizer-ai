import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized', 401));
  }
  const token = authHeader.substring(7);
  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    return next(new AppError('Unauthorized', 401));
  }
}

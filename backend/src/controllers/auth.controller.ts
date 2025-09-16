import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { signToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const existing = await User.findOne({ email });
    if (existing) {
      return next(new AppError('Email already in use', 409));
    }
    const user = await User.create({ name, email, password });
    await AuditLog.create({
      userId: user._id,
      event: 'USER_REGISTERED',
      ip: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });
    const token = signToken(user.id);
    res.status(201).json({
      success: true,
      data: { user: { id: user.id, name: user.name, email: user.email }, token }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return next(new AppError(err.errors.map(e => e.message).join(', '), 400));
    }
    return next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) {
      await AuditLog.create({
        event: 'USER_LOGIN_FAILED',
        metadata: { reason: 'USER_NOT_FOUND', email },
        ip: req.ip,
        userAgent: req.headers['user-agent'] || ''
      });
      return next(new AppError('Invalid credentials', 401));
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      await AuditLog.create({
        userId: user._id,
        event: 'USER_LOGIN_FAILED',
        metadata: { reason: 'BAD_PASSWORD' },
        ip: req.ip,
        userAgent: req.headers['user-agent'] || ''
      });
      return next(new AppError('Invalid credentials', 401));
    }
    const token = signToken(user.id);
    await AuditLog.create({
      userId: user._id,
      event: 'USER_LOGIN_SUCCESS',
      ip: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });
    res.json({
      success: true,
      data: { user: { id: user.id, name: user.name, email: user.email }, token }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return next(new AppError(err.errors.map(e => e.message).join(', '), 400));
    }
    return next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) return next(new AppError('Unauthorized', 401));
    const user = await User.findById(userId).select('name email');
    if (!user) return next(new AppError('Unauthorized', 401));
    res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email } } });
  } catch (err) {
    next(err);
  }
}

import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { User } from '../models/User';
import { AuditLog } from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new AppError('Only PNG, JPG, and WEBP images are allowed', 400));
  }
});

export const avatarUploadMiddleware = upload.single('avatar');

export async function getMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.userId).select('name email avatarUpdatedAt');
    if (!user) return next(new AppError('Unauthorized', 401));
    res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email, avatarUpdatedAt: user.avatarUpdatedAt ? user.avatarUpdatedAt.getTime() : 0 } } });
  } catch (err) {
    next(err);
  }
}

export async function uploadMyAvatar(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('Unauthorized', 401));
    if (!req.file) return next(new AppError('No file uploaded', 400));
    const user = await User.findById(req.userId);
    if (!user) return next(new AppError('Unauthorized', 401));

    user.avatar = req.file.buffer;
    user.avatarMimeType = req.file.mimetype;
    user.avatarUpdatedAt = new Date();
    await user.save();

    await AuditLog.create({
      userId: user._id,
      event: 'USER_AVATAR_UPDATED',
      ip: req.ip,
      userAgent: req.headers['user-agent'] || ''
    });

    res.json({ success: true, message: 'Avatar updated' });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('Unauthorized', 401));
    const bodySchema = z.object({ name: z.string().min(1) });
    const { name } = bodySchema.parse(req.body);
    const user = await User.findById(req.userId);
    if (!user) return next(new AppError('Unauthorized', 401));
    user.name = name;
    await user.save();
    res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email, avatarUpdatedAt: user.avatarUpdatedAt ? user.avatarUpdatedAt.getTime() : 0 } } });
  } catch (err: any) {
    if (err instanceof z.ZodError) return next(new AppError(err.errors.map(e => e.message).join(', '), 400));
    next(err);
  }
}

export async function updateMyPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.userId) return next(new AppError('Unauthorized', 401));
    const bodySchema = z.object({ currentPassword: z.string().min(6), newPassword: z.string().min(6) });
    const { currentPassword, newPassword } = bodySchema.parse(req.body);
    const user = await User.findById(req.userId);
    if (!user) return next(new AppError('Unauthorized', 401));
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return next(new AppError('Current password is incorrect', 400));
    user.password = newPassword; // will be hashed by pre-save hook
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err: any) {
    if (err instanceof z.ZodError) return next(new AppError(err.errors.map(e => e.message).join(', '), 400));
    next(err);
  }
}

export async function getUserAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    const paramsSchema = z.object({ id: z.string().length(24) });
    const { id } = paramsSchema.parse(req.params);
    const user = await User.findById(id).select('avatar avatarMimeType');
    if (!user || !user.avatar || !user.avatarMimeType) return next(new AppError('Avatar not found', 404));
    res.setHeader('Content-Type', user.avatarMimeType);
    res.setHeader('Cache-Control', 'no-store');
    res.send(user.avatar);
  } catch (err: any) {
    if (err instanceof z.ZodError) return next(new AppError('Invalid user id', 400));
    next(err);
  }
}

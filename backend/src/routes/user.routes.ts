import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { avatarUploadMiddleware, getMyProfile, uploadMyAvatar, getUserAvatar, updateMyProfile, updateMyPassword } from '../controllers/user.controller';

const router = Router();

router.get('/me', requireAuth, getMyProfile);
router.post('/me/avatar', requireAuth, avatarUploadMiddleware, uploadMyAvatar);
router.patch('/me', requireAuth, updateMyProfile);
router.patch('/me/password', requireAuth, updateMyPassword);
router.get('/:id/avatar', getUserAvatar);

export default router;

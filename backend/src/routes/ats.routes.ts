import { Router } from 'express';
import { analyze, enhance, atsUpload, scoreText } from '../controllers/ats.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/analyze', requireAuth, atsUpload, analyze);
router.post('/enhance', requireAuth, enhance);
router.post('/score', requireAuth, scoreText);

export default router;

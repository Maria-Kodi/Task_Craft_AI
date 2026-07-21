import { Router } from 'express';
import { craftFromPrompt, getDailyBrief } from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All AI routes require a valid JWT token
router.post('/craft', protect, craftFromPrompt);
router.get('/daily-brief', protect, getDailyBrief);

export default router;
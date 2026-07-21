import { Router } from 'express';
import { getProfile, updateProfile, changePassword, deleteAccount } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.put('/me/password', protect, changePassword);
router.delete('/me', protect, deleteAccount);

export default router;
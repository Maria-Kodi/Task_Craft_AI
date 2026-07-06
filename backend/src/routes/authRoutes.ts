import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';

const router = Router();

// Route for user registration
router.post('/register', registerUser);

// Route for user login
router.post('/login', loginUser);

export default router;
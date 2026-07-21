import { Router } from 'express';
import { createTask, getTasks, updateTask, deleteTask, decomposeTask } from '../controllers/taskController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// All task routes require a valid JWT token
router.post('/', protect, createTask);
router.get('/', protect, getTasks);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);
router.post('/:id/decompose', protect, decomposeTask);
export default router;
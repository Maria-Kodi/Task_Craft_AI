import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes'; // Import the task routes
import aiRoutes from './routes/aiRoutes';
import userRoutes from './routes/userRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Integration
app.use('/api/auth', authRoutes); // All auth routes will start with /api/auth
app.use('/api/tasks', taskRoutes); // All task routes will start with /api/tasks
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
// Base health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TaskCraft AI API is running smoothly.' });
});

export default app;
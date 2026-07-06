import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes'; // Import the auth routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes Integration
app.use('/api/auth', authRoutes); // All auth routes will start with /api/auth

// Base health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TaskCraft AI API is running smoothly.' });
});

export default app;
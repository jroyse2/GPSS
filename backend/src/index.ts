import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Import routes
import userRoutes from './routes/userRoutes';
import jobRoutes from './routes/jobRoutes';
import pipeOptimizationRoutes from './routes/pipeOptimizationRoutes';
import notificationRoutes from './routes/notificationRoutes';

// Import error handling middleware
import { AppError, errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Define allowed origins for CORS
const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://gpss-dmi4-test4-ch319th3d-justins-projects-f8f5b49f.vercel.app', // Your Vercel frontend
  process.env.FRONTEND_URL, // Environment variable override
].filter(Boolean); // Remove any undefined values

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/pipe-optimization', pipeOptimizationRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date()
  });
});

// Test database connection endpoint
app.get('/api/test-db', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pool } = require('./config/database');
    const result = await pool.query('SELECT NOW()');
    res.status(200).json({
      success: true,
      message: 'Database connection successful',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    // Type assertion for error
    const err = error as Error;
    next(new AppError(`Database connection failed: ${err.message}`, 500));
  }
});

// Handle undefined routes
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware - IMPORTANT: This must be after all routes
app.use(errorHandler);

// Start server (only if not in Vercel environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Export for Vercel
export default app;
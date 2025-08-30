import express from 'express';
import { PipeOptimizationController } from '../controllers/pipeOptimizationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { pipeOptimizationSchema } from '../models/pipeModel';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Pipe optimization routes
router.post('/', validate(pipeOptimizationSchema), PipeOptimizationController.optimizePipeCutting);
router.post('/upload', ...PipeOptimizationController.uploadAndProcessFile);
router.get('/history/:jobId', PipeOptimizationController.getOptimizationHistory);
router.post('/filter/:jobId', PipeOptimizationController.filterByDateRange);
router.get('/visualization/:jobId', PipeOptimizationController.generateVisualization);

export default router;
import express from 'express';
import { JobController } from '../controllers/jobController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { jobCreationSchema, jobUpdateSchema } from '../models/jobModel';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Job routes - specific routes first
router.get('/stats', JobController.getJobStats);
router.get('/user/:userId', JobController.getJobsByUserId);

// Standard CRUD routes
router.post('/', validate(jobCreationSchema), JobController.createJob);
router.get('/', JobController.getAllJobs);
router.get('/:id', JobController.getJobById);
router.put('/:id', validate(jobUpdateSchema), JobController.updateJob);
router.delete('/:id', JobController.deleteJob);

// Additional job routes
router.put('/:id/status', JobController.updateJobStatus);
router.put('/:id/priority', JobController.updateJobPriority);

export default router;
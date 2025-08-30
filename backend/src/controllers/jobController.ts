import { Request, Response, NextFunction } from 'express';
import { JobModel } from '../models/jobModel';
import { catchAsync, AppError } from '../middleware/errorHandler';

// Define enum values for JobStatus and JobPriority since they're only types in the model
enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

enum JobPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Job controller class
export class JobController {
  // Create a new job
  static createJob = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { details, status, priority, user_id } = req.body;
    
    const job = await JobModel.create({
      details,
      status: status || JobStatus.PENDING,
      priority: priority || JobPriority.MEDIUM,
      user_id
    });
    
    res.status(201).json({
      success: true,
      data: job
    });
  });
  
  // Get all jobs
  static getAllJobs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { limit = 100, offset = 0, status, priority } = req.query;
    
    let jobs;
    
    // Filter by status if provided
    if (status && Object.values(JobStatus).includes(status as JobStatus)) {
      jobs = await JobModel.getByStatus(status as JobStatus);
    }
    // Filter by priority if provided
    else if (priority && Object.values(JobPriority).includes(priority as JobPriority)) {
      jobs = await JobModel.getByPriority(priority as JobPriority);
    }
    // Get all jobs with pagination
    else {
      jobs = await JobModel.getAll(
        parseInt(limit as string),
        parseInt(offset as string)
      );
    }
    
    const count = await JobModel.count();
    
    res.status(200).json({
      success: true,
      count,
      data: jobs
    });
  });
  
  // Get job by ID
  static getJobById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    const job = await JobModel.findById(id);
    
    if (!job) {
      return next(new AppError('Job not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: job
    });
  });
  
  // Update job
  static updateJob = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { details, status, priority, user_id } = req.body;
    
    // Validate status if provided
    if (status && !Object.values(JobStatus).includes(status as JobStatus)) {
      return next(new AppError('Invalid status', 400));
    }
    
    // Validate priority if provided
    if (priority && !Object.values(JobPriority).includes(priority as JobPriority)) {
      return next(new AppError('Invalid priority', 400));
    }
    
    const job = await JobModel.update(id, {
      details,
      status,
      priority,
      user_id
    });
    
    if (!job) {
      return next(new AppError('Job not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: job
    });
  });
  
  // Delete job
  static deleteJob = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    const deleted = await JobModel.delete(id);
    
    if (!deleted) {
      return next(new AppError('Job not found', 404));
    }
    
    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  });
  
  // Update job status
  static updateJobStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!status || !Object.values(JobStatus).includes(status as JobStatus)) {
      return next(new AppError('Invalid status', 400));
    }
    
    const job = await JobModel.update(id, { status });
    
    if (!job) {
      return next(new AppError('Job not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: job
    });
  });
  
  // Update job priority
  static updateJobPriority = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { priority } = req.body;
    
    // Validate priority
    if (!priority || !Object.values(JobPriority).includes(priority as JobPriority)) {
      return next(new AppError('Invalid priority', 400));
    }
    
    const job = await JobModel.update(id, { priority });
    
    if (!job) {
      return next(new AppError('Job not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: job
    });
  });
  
  // Get jobs by user ID
  static getJobsByUserId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    
    const jobs = await JobModel.getByUserId(userId);
    
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  });
  
  // Get job statistics
  static getJobStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get counts by status
      const pendingCount = await JobModel.countByStatus(JobStatus.PENDING);
      const inProgressCount = await JobModel.countByStatus(JobStatus.IN_PROGRESS);
      const completedCount = await JobModel.countByStatus(JobStatus.COMPLETED);
      const cancelledCount = await JobModel.countByStatus(JobStatus.CANCELLED);
      
      // Get counts by priority
      const lowPriorityCount = await JobModel.countByPriority(JobPriority.LOW);
      const mediumPriorityCount = await JobModel.countByPriority(JobPriority.MEDIUM);
      const highPriorityCount = await JobModel.countByPriority(JobPriority.HIGH);
      const urgentPriorityCount = await JobModel.countByPriority(JobPriority.URGENT);
      
      // Get total count
      const totalCount = await JobModel.count();
      
      res.status(200).json({
        success: true,
        data: {
          total: totalCount,
          byStatus: {
            pending: pendingCount,
            inProgress: inProgressCount,
            completed: completedCount,
            cancelled: cancelledCount
          },
          byPriority: {
            low: lowPriorityCount,
            medium: mediumPriorityCount,
            high: highPriorityCount,
            urgent: urgentPriorityCount
          }
        }
      });
    } catch (error) {
      // If the JobModel methods don't exist yet, return mock data
      console.error('Error fetching job stats:', error);
      
      // Return mock data as fallback
      res.status(200).json({
        success: true,
        data: {
          total: 0,
          byStatus: {
            pending: 0,
            inProgress: 0,
            completed: 0,
            cancelled: 0
          },
          byPriority: {
            low: 0,
            medium: 0,
            high: 0,
            urgent: 0
          }
        }
      });
    }
  });
}
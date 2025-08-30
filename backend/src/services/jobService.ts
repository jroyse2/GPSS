import { JobModel, Job, JobStatus, JobPriority } from '../models/jobModel';
import { NotificationModel, NotificationType } from '../models/notificationModel';
import { AppError } from '../middleware/errorHandler';
import { io } from '../index';

// Job service class
export class JobService {
  // Create a new job
  static async createJob(
    details: Record<string, any>,
    priority: JobPriority,
    userId: string
  ): Promise<Job> {
    try {
      // Create job
      const job = await JobModel.create({
        details,
        status: JobStatus.PENDING,
        priority,
        user_id: userId
      });
      
      // Create notification for job creation
      await NotificationModel.create({
        type: NotificationType.JOB_UPDATE,
        message: `New job created with priority: ${priority}`,
        user_id: userId
      });
      
      // Emit socket event for real-time updates
      io.emit('job:created', {
        jobId: job.id,
        status: job.status,
        priority: job.priority
      });
      
      return job;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }
  
  // Update job
  static async updateJob(
    jobId: string,
    updateData: Partial<Job>,
    userId: string
  ): Promise<Job> {
    try {
      // Find job
      const job = await JobModel.findById(jobId);
      if (!job) {
        throw new AppError('Job not found', 404);
      }
      
      // Update job
      const updatedJob = await JobModel.update(jobId, updateData);
      if (!updatedJob) {
        throw new AppError('Failed to update job', 500);
      }
      
      // Create notification for job update
      let notificationMessage = 'Job updated';
      
      if (updateData.status && updateData.status !== job.status) {
        notificationMessage = `Job status changed from ${job.status} to ${updateData.status}`;
      } else if (updateData.priority && updateData.priority !== job.priority) {
        notificationMessage = `Job priority changed from ${job.priority} to ${updateData.priority}`;
      }
      
      await NotificationModel.create({
        type: NotificationType.JOB_UPDATE,
        message: notificationMessage,
        user_id: userId
      });
      
      // Emit socket event for real-time updates
      io.emit('job:updated', {
        jobId: updatedJob.id,
        status: updatedJob.status,
        priority: updatedJob.priority,
        details: updatedJob.details
      });
      
      return updatedJob;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }
  
  // Get job by ID
  static async getJobById(jobId: string): Promise<Job> {
    try {
      const job = await JobModel.findById(jobId);
      if (!job) {
        throw new AppError('Job not found', 404);
      }
      
      return job;
    } catch (error) {
      console.error('Error getting job by ID:', error);
      throw error;
    }
  }
  
  // Get all jobs with optional filters
  static async getJobs(filters: Partial<{
    status: JobStatus;
    priority: JobPriority;
    user_id: string;
  }> = {}): Promise<Job[]> {
    try {
      return await JobModel.getAll(filters);
    } catch (error) {
      console.error('Error getting jobs:', error);
      throw error;
    }
  }
  
  // Delete job
  static async deleteJob(jobId: string, userId: string): Promise<boolean> {
    try {
      // Find job
      const job = await JobModel.findById(jobId);
      if (!job) {
        throw new AppError('Job not found', 404);
      }
      
      // Delete job
      const deleted = await JobModel.delete(jobId);
      if (!deleted) {
        throw new AppError('Failed to delete job', 500);
      }
      
      // Create notification for job deletion
      await NotificationModel.create({
        type: NotificationType.JOB_UPDATE,
        message: `Job #${jobId} has been deleted`,
        user_id: userId
      });
      
      // Emit socket event for real-time updates
      io.emit('job:deleted', {
        jobId
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }
  
  // Change job status
  static async changeJobStatus(
    jobId: string,
    status: JobStatus,
    userId: string
  ): Promise<Job> {
    return this.updateJob(jobId, { status }, userId);
  }
  
  // Change job priority
  static async changeJobPriority(
    jobId: string,
    priority: JobPriority,
    userId: string
  ): Promise<Job> {
    return this.updateJob(jobId, { priority }, userId);
  }
}
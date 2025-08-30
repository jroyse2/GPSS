import { pool } from '../config/database';
import { z } from 'zod';

// Job status enum
export enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Job priority enum
export enum JobPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Job interface
export interface Job {
  id: string;
  details: {
    salesOrderNumber?: string;
    [key: string]: any;  // Allow other properties
  };
  status: JobStatus;
  priority: JobPriority;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
}

// Job creation schema for validation using Zod
export const jobCreationSchema = z.object({
  body: z.object({
    details: z.object({
      salesOrderNumber: z.string().optional(),
    }).passthrough(), // Allow additional properties
    status: z.enum([JobStatus.PENDING, JobStatus.IN_PROGRESS, JobStatus.COMPLETED, JobStatus.CANCELLED])
      .default(JobStatus.PENDING),
    priority: z.enum([JobPriority.LOW, JobPriority.MEDIUM, JobPriority.HIGH, JobPriority.URGENT])
      .default(JobPriority.MEDIUM),
    user_id: z.string().min(1, { message: 'User ID is required' })
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

// Job update schema for validation using Zod
export const jobUpdateSchema = z.object({
  body: z.object({
    details: z.object({
      salesOrderNumber: z.string().optional(),
    }).passthrough().optional(), // Allow additional properties
    status: z.enum([JobStatus.PENDING, JobStatus.IN_PROGRESS, JobStatus.COMPLETED, JobStatus.CANCELLED])
      .optional(),
    priority: z.enum([JobPriority.LOW, JobPriority.MEDIUM, JobPriority.HIGH, JobPriority.URGENT])
      .optional(),
    user_id: z.string().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().min(1, { message: 'Job ID is required' })
  })
});

// Function to generate UUID
function generateUUID(): string {
  // Simple UUID generator for demonstration
  // In production, use a proper UUID library
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Job model class
export class JobModel {
  // Create a new job
  static async create(jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> {
    try {
      const id = generateUUID();
      const now = new Date();
      
      const query = `
        INSERT INTO jobs (id, details, status, priority, user_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const values = [
        id,
        jobData.details || {}, // Ensure details is an object
        jobData.status,
        jobData.priority,
        jobData.user_id,
        now,
        now
      ];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }
  
  // Find job by ID
  static async findById(id: string): Promise<Job | null> {
    try {
      const query = 'SELECT * FROM jobs WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding job by ID:', error);
      throw error;
    }
  }
  
  // Update job
  static async update(id: string, jobData: Partial<Omit<Job, 'id' | 'created_at' | 'updated_at'>>): Promise<Job | null> {
    try {
      // Build dynamic query based on provided fields
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      // Add each field to updates if provided
      if (jobData.details !== undefined) {
        updates.push(`details = $${paramIndex}`);
        values.push(jobData.details);
        paramIndex++;
      }
      
      if (jobData.status !== undefined) {
        updates.push(`status = $${paramIndex}`);
        values.push(jobData.status);
        paramIndex++;
      }
      
      if (jobData.priority !== undefined) {
        updates.push(`priority = $${paramIndex}`);
        values.push(jobData.priority);
        paramIndex++;
      }
      
      if (jobData.user_id !== undefined) {
        updates.push(`user_id = $${paramIndex}`);
        values.push(jobData.user_id);
        paramIndex++;
      }
      
      // Add updated_at
      updates.push(`updated_at = $${paramIndex}`);
      values.push(new Date());
      paramIndex++;
      
      // Add ID as the last parameter
      values.push(id);
      
      // If no updates, return the job
      if (updates.length === 0) {
        return this.findById(id);
      }
      
      const query = `
        UPDATE jobs
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;
      
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }
  
  // Delete job
  static async delete(id: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM jobs WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);
      
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }
  
  // Get all jobs with pagination
  static async getAll(limit: number = 100, offset: number = 0): Promise<Job[]> {
    try {
      const query = 'SELECT * FROM jobs ORDER BY created_at DESC LIMIT $1 OFFSET $2';
      const result = await pool.query(query, [limit, offset]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting all jobs:', error);
      throw error;
    }
  }
  
  // Count all jobs
  static async count(): Promise<number> {
    try {
      const query = 'SELECT COUNT(*) FROM jobs';
      const result = await pool.query(query);
      
      return parseInt(result.rows[0]?.count || '0');
    } catch (error) {
      console.error('Error counting jobs:', error);
      return 0;
    }
  }
  
  // Get jobs by status
  static async getByStatus(status: JobStatus): Promise<Job[]> {
    try {
      const query = 'SELECT * FROM jobs WHERE status = $1 ORDER BY created_at DESC';
      const result = await pool.query(query, [status]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting jobs by status:', error);
      throw error;
    }
  }
  
  // Get jobs by priority
  static async getByPriority(priority: JobPriority): Promise<Job[]> {
    try {
      const query = 'SELECT * FROM jobs WHERE priority = $1 ORDER BY created_at DESC';
      const result = await pool.query(query, [priority]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting jobs by priority:', error);
      throw error;
    }
  }
  
  // Get jobs by user ID
  static async getByUserId(userId: string): Promise<Job[]> {
    try {
      const query = 'SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC';
      const result = await pool.query(query, [userId]);
      
      return result.rows;
    } catch (error) {
      console.error('Error getting jobs by user ID:', error);
      throw error;
    }
  }
  
  // Count jobs by status
  static async countByStatus(status: JobStatus): Promise<number> {
    try {
      const query = 'SELECT COUNT(*) FROM jobs WHERE status = $1';
      const result = await pool.query(query, [status]);
      
      return parseInt(result.rows[0]?.count || '0');
    } catch (error) {
      console.error('Error counting jobs by status:', error);
      return 0;
    }
  }
  
  // Count jobs by priority
  static async countByPriority(priority: JobPriority): Promise<number> {
    try {
      const query = 'SELECT COUNT(*) FROM jobs WHERE priority = $1';
      const result = await pool.query(query, [priority]);
      
      return parseInt(result.rows[0]?.count || '0');
    } catch (error) {
      console.error('Error counting jobs by priority:', error);
      return 0;
    }
  }
}
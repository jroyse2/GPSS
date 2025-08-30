import { z } from 'zod';
import { pool } from '../config/database';

// Pipe interface
export interface Pipe {
  id: string;
  length: number;
  diameter: number;
  stock_length: number;
  job_id: string;
  created_at: Date;
  updated_at: Date;
}

// Pipe validation schemas
export const pipeCreationSchema = z.object({
  body: z.object({
    length: z.number().positive('Length must be a positive number'),
    diameter: z.number().positive('Diameter must be a positive number'),
    stock_length: z.number().positive('Stock length must be a positive number'),
    job_id: z.string().uuid('Invalid job ID')
  })
});

export const pipeUpdateSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid pipe ID')
  }),
  body: z.object({
    length: z.number().positive('Length must be a positive number').optional(),
    diameter: z.number().positive('Diameter must be a positive number').optional(),
    stock_length: z.number().positive('Stock length must be a positive number').optional()
  })
});

// Pipe optimization schema
export const pipeOptimizationSchema = z.object({
  body: z.object({
    pipes: z.array(z.object({
      length: z.number().positive('Length must be a positive number'),
      diameter: z.number().positive('Diameter must be a positive number')
    })).min(1, 'At least one pipe is required'),
    jobId: z.string().uuid('Invalid job ID')
  })
});

// Pipe model class
export class PipeModel {
  // Create a new pipe
  static async create(pipeData: Omit<Pipe, 'id' | 'created_at' | 'updated_at'>): Promise<Pipe> {
    const { length, diameter, stock_length, job_id } = pipeData;
    
    const query = `
      INSERT INTO pipes (length, diameter, stock_length, job_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [length, diameter, stock_length, job_id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating pipe:', error);
      throw error;
    }
  }
  
  // Find pipe by ID
  static async findById(id: string): Promise<Pipe | null> {
    const query = 'SELECT * FROM pipes WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding pipe by ID:', error);
      throw error;
    }
  }
  
  // Update pipe
  static async update(id: string, pipeData: Partial<Pipe>): Promise<Pipe | null> {
    // Build dynamic query based on provided fields
    const fields = Object.keys(pipeData).filter(key => key !== 'id');
    if (fields.length === 0) return null;
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => pipeData[field as keyof typeof pipeData])];
    
    const query = `
      UPDATE pipes
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating pipe:', error);
      throw error;
    }
  }
  
  // Delete pipe
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM pipes WHERE id = $1 RETURNING id';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting pipe:', error);
      throw error;
    }
  }
  
  // Get pipes by job ID
  static async getByJobId(jobId: string): Promise<Pipe[]> {
    const query = 'SELECT * FROM pipes WHERE job_id = $1 ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, [jobId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting pipes by job ID:', error);
      throw error;
    }
  }
  
  // Get all pipes
  static async getAll(): Promise<Pipe[]> {
    const query = 'SELECT * FROM pipes ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting all pipes:', error);
      throw error;
    }
  }
}
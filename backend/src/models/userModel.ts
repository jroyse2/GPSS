import { z } from 'zod';
import { pool } from '../config/database';

// User roles enum
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  ENGINEER = 'engineer',
  OPERATOR = 'operator'
}

// User interface
export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

// User validation schemas
export const userRegistrationSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum([UserRole.ADMIN, UserRole.MANAGER, UserRole.ENGINEER, UserRole.OPERATOR])
      .default(UserRole.OPERATOR)
  })
});

export const userLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
  })
});

export const userUpdateSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    role: z.enum([UserRole.ADMIN, UserRole.MANAGER, UserRole.ENGINEER, UserRole.OPERATOR]).optional()
  })
});

// User model class
export class UserModel {
  // Create a new user
  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { username, email, password, role } = userData;
    
    const query = `
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [username, email, password, role];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
  
  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }
  
  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }
  
  // Update user
  static async update(id: string, userData: Partial<User>): Promise<User | null> {
    // Build dynamic query based on provided fields
    const fields = Object.keys(userData).filter(key => key !== 'id');
    if (fields.length === 0) return null;
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => userData[field as keyof typeof userData])];
    
    const query = `
      UPDATE users
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
  
  // Delete user
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  
  // Get all users
  static async getAll(): Promise<User[]> {
    const query = 'SELECT * FROM users ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }
}
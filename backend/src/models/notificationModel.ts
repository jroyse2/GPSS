import { z } from 'zod';
import { pool } from '../config/database';

// Notification type
export type NotificationType = 'job_update' | 'system' | 'user' | 'alert';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

// Notification validation schemas
export const notificationCreationSchema = z.object({
  body: z.object({
    type: z.enum(['job_update', 'system', 'user', 'alert']),
    message: z.string().min(1, 'Message is required'),
    user_id: z.string().uuid('Invalid user ID')
  })
});

export const notificationUpdateSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid notification ID')
  }),
  body: z.object({
    read: z.boolean().optional()
  })
});

// Notification model class
export class NotificationModel {
  // Create a new notification
  static async create(notificationData: Omit<Notification, 'id' | 'read' | 'created_at' | 'updated_at'>): Promise<Notification> {
    const { type, message, user_id } = notificationData;
    
    const query = `
      INSERT INTO notifications (type, message, user_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [type, message, user_id];
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
  
  // Find notification by ID
  static async findById(id: string): Promise<Notification | null> {
    const query = 'SELECT * FROM notifications WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding notification by ID:', error);
      throw error;
    }
  }
  
  // Update notification
  static async update(id: string, notificationData: Partial<Notification>): Promise<Notification | null> {
    // Build dynamic query based on provided fields
    const fields = Object.keys(notificationData).filter(key => key !== 'id');
    if (fields.length === 0) return null;
    
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [id, ...fields.map(field => notificationData[field as keyof typeof notificationData])];
    
    const query = `
      UPDATE notifications
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  }
  
  // Mark notification as read
  static async markAsRead(id: string): Promise<Notification | null> {
    const query = `
      UPDATE notifications
      SET read = true, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<boolean> {
    const query = `
      UPDATE notifications
      SET read = true, updated_at = NOW()
      WHERE user_id = $1 AND read = false
    `;
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  // Delete notification
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM notifications WHERE id = $1 RETURNING id';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
  
  // Get all notifications for a user
  static async getByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    const query = 'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    
    try {
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting notifications by user ID:', error);
      throw error;
    }
  }
  
  // Get unread notifications count for a user
  static async getUnreadCount(userId: string): Promise<number> {
    const query = 'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = false';
    
    try {
      const result = await pool.query(query, [userId]);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting unread notifications count:', error);
      throw error;
    }
  }
  
  // Delete old notifications
  static async deleteOld(days: number = 30): Promise<boolean> {
    const query = 'DELETE FROM notifications WHERE created_at < NOW() - INTERVAL \'$1 days\'';
    
    try {
      const result = await pool.query(query, [days]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting old notifications:', error);
      throw error;
    }
  }
}
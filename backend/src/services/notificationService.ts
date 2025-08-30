import { NotificationModel, Notification, NotificationType } from '../models/notificationModel';
import { UserModel } from '../models/userModel';
import { AppError } from '../middleware/errorHandler';
import { io } from '../index';

// Notification service class
export class NotificationService {
  // Create a new notification
  static async createNotification(
    type: NotificationType,
    message: string,
    userId: string
  ): Promise<Notification> {
    try {
      // Verify user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Create notification
      const notification = await NotificationModel.create({
        type,
        message,
        user_id: userId
      });
      
      // Emit socket event for real-time updates
      io.emit('notification:new', {
        userId,
        notification: {
          id: notification.id,
          type: notification.type,
          message: notification.message,
          read: notification.read,
          created_at: notification.created_at
        }
      });
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
  
  // Get notifications for a user
  static async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Notification[]> {
    try {
      // Verify user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Get notifications
      return await NotificationModel.getByUserId(userId, limit, offset);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }
  
  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    try {
      // Find notification
      const notification = await NotificationModel.findById(notificationId);
      if (!notification) {
        throw new AppError('Notification not found', 404);
      }
      
      // Verify notification belongs to user
      if (notification.user_id !== userId) {
        throw new AppError('Not authorized to update this notification', 403);
      }
      
      // Mark as read
      const updatedNotification = await NotificationModel.markAsRead(notificationId);
      if (!updatedNotification) {
        throw new AppError('Failed to update notification', 500);
      }
      
      // Emit socket event for real-time updates
      io.emit('notification:read', {
        userId,
        notificationId
      });
      
      return updatedNotification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      // Verify user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Mark all as read
      const success = await NotificationModel.markAllAsRead(userId);
      
      // Emit socket event for real-time updates
      io.emit('notification:all-read', {
        userId
      });
      
      return success;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  // Get unread notifications count for a user
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      // Verify user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Get unread count
      return await NotificationModel.getUnreadCount(userId);
    } catch (error) {
      console.error('Error getting unread notifications count:', error);
      throw error;
    }
  }
  
  // Delete notification
  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      // Find notification
      const notification = await NotificationModel.findById(notificationId);
      if (!notification) {
        throw new AppError('Notification not found', 404);
      }
      
      // Verify notification belongs to user
      if (notification.user_id !== userId) {
        throw new AppError('Not authorized to delete this notification', 403);
      }
      
      // Delete notification
      const deleted = await NotificationModel.delete(notificationId);
      
      // Emit socket event for real-time updates
      io.emit('notification:deleted', {
        userId,
        notificationId
      });
      
      return deleted;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}
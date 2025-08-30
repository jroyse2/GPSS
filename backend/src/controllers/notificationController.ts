import { Request, Response, NextFunction } from 'express';
import { NotificationModel } from '../models/notificationModel';
import { catchAsync, AppError } from '../middleware/errorHandler';

// Define enum values for NotificationType since it's only a type in the model
enum NotificationType {
  JOB_UPDATE = 'job_update',
  SYSTEM = 'system',
  USER = 'user',
  ALERT = 'alert'
}

// Notification controller class
export class NotificationController {
  // Create a new notification
  static createNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { type, message, user_id } = req.body;
    
    // Validate notification type
    if (!Object.values(NotificationType).includes(type as NotificationType)) {
      return next(new AppError('Invalid notification type', 400));
    }
    
    const notification = await NotificationModel.create({
      type: type as NotificationType,
      message,
      user_id
    });
    
    res.status(201).json({
      success: true,
      data: notification
    });
  });
  
  // Get notifications by user ID
  static getNotificationsByUserId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const notifications = await NotificationModel.getByUserId(
      userId,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    const unreadCount = await NotificationModel.getUnreadCount(userId);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  });
  
  // Mark notification as read
  static markAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    const notification = await NotificationModel.markAsRead(id);
    
    if (!notification) {
      return next(new AppError('Notification not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
  });
  
  // Mark all notifications as read for a user
  static markAllAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    
    await NotificationModel.markAllAsRead(userId);
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  });
  
  // Delete notification
  static deleteNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    const deleted = await NotificationModel.delete(id);
    
    if (!deleted) {
      return next(new AppError('Notification not found', 404));
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  });
  
  // Get unread notifications count for a user
  static getUnreadCount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    
    const count = await NotificationModel.getUnreadCount(userId);
    
    res.status(200).json({
      success: true,
      data: { count }
    });
  });
  
  // Delete old notifications
  static deleteOldNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { days = 30 } = req.query;
    
    await NotificationModel.deleteOld(parseInt(days as string));
    
    res.status(200).json({
      success: true,
      message: `Notifications older than ${days} days deleted successfully`
    });
  });
}
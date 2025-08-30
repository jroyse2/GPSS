import express from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { notificationCreationSchema, notificationUpdateSchema } from '../models/notificationModel';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Notification routes
router.post('/', validate(notificationCreationSchema), NotificationController.createNotification);
router.get('/user/:userId', NotificationController.getNotificationsByUserId);
router.put('/:id/read', NotificationController.markAsRead);
router.put('/user/:userId/read-all', NotificationController.markAllAsRead);
router.delete('/:id', NotificationController.deleteNotification);
router.get('/user/:userId/unread-count', NotificationController.getUnreadCount);
router.delete('/old', NotificationController.deleteOldNotifications);

export default router;
import express from 'express';
import {
  getMyNotificationsController,
  getUnreadCountController,
  markAsReadController,
  markAllAsReadController,
  sendNotificationController,
} from '../controllers/notification.js';
import { protect, authorize } from '../middleware/auth.js';
import { requireFields } from '../middleware/validate.js';

const router = express.Router();

// User notification routes
router.get('/', protect, getMyNotificationsController);
router.get('/unread-count', protect, getUnreadCountController);
router.patch('/read-all', protect, markAllAsReadController);
router.patch('/:id/read', protect, markAsReadController);

// Dispatch notification (Admin / Staff)
router.post(
  '/send',
  protect,
  authorize('admin', 'staff'),
  requireFields(['recipientUserId', 'recipientRole', 'notificationType', 'title', 'message']),
  sendNotificationController
);

export default router;

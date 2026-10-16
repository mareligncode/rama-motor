import Notification from '../models/notification.js';
import { createAndSendNotification } from '../services/notification.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc Get notifications for current user
 * @route GET /api/v1/notifications
 * @access Private
 */
export async function getMyNotificationsController(req, res, next) {
  try {
    const { page = 1, limit = 20, isRead } = req.query;
    const query = { recipientUserId: req.user._id };

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Notification.countDocuments(query),
    ]);

    return successResponse(res, {
      statusCode: 200,
      data: { notifications },
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get unread notification count
 * @route GET /api/v1/notifications/unread-count
 * @access Private
 */
export async function getUnreadCountController(req, res, next) {
  try {
    const count = await Notification.countDocuments({
      recipientUserId: req.user._id,
      isRead: false,
    });

    return successResponse(res, {
      statusCode: 200,
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Mark single notification as read
 * @route PATCH /api/v1/notifications/:id/read
 * @access Private
 */
export async function markAsReadController(req, res, next) {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientUserId: req.user._id,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );

    if (!notification) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Notification not found',
      });
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Notification marked as read',
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Mark all notifications as read for current user
 * @route PATCH /api/v1/notifications/read-all
 * @access Private
 */
export async function markAllAsReadController(req, res, next) {
  try {
    await Notification.updateMany(
      {
        recipientUserId: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return successResponse(res, {
      statusCode: 200,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Send notification to a user across channels (Admin/Staff/System)
 * @route POST /api/v1/notifications/send
 * @access Private (Admin, Staff)
 */
export async function sendNotificationController(req, res, next) {
  try {
    const {
      recipientUserId,
      recipientRole,
      notificationType,
      title,
      message,
      data,
      priority,
      channels,
      expiresAt,
    } = req.body;

    if (!recipientUserId || !recipientRole || !notificationType || !title || !message) {
      return errorResponse(res, {
        statusCode: 400,
        message:
          'recipientUserId, recipientRole, notificationType, title, and message are required',
      });
    }

    const result = await createAndSendNotification({
      recipientUserId,
      recipientRole,
      senderUserId: req.user._id,
      notificationType,
      title,
      message,
      data,
      priority,
      channels: channels || ['in_app'],
      expiresAt,
    });

    return successResponse(res, {
      statusCode: 201,
      message: 'Notification dispatched successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  getMyNotificationsController,
  getUnreadCountController,
  markAsReadController,
  markAllAsReadController,
  sendNotificationController,
};

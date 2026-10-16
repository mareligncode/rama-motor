import { apiClient } from './api.client';
import { API_ENDPOINTS } from '../constants/api';
import { Notification } from '../types/notification.types';
import { ApiResponse } from '../types/api.types';

export const notificationService = {
  /**
   * Get notifications for the authenticated user
   */
  async getMyNotifications(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }): Promise<ApiResponse<{ notifications: Notification[] }>> {
    return apiClient.get<{ notifications: Notification[] }>(
      API_ENDPOINTS.NOTIFICATIONS.LIST,
      { params }
    );
  },

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(): Promise<ApiResponse<{ unreadCount: number }>> {
    return apiClient.get<{ unreadCount: number }>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<ApiResponse<{ notification: Notification }>> {
    return apiClient.patch<{ notification: Notification }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)
    );
  },

  /**
   * Mark all notifications as read for current user
   */
  async markAllAsRead(): Promise<ApiResponse<null>> {
    return apiClient.patch<null>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },
};

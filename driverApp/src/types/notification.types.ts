export type NotificationType = 'auth' | 'payment' | 'warning' | 'delivery' | 'other';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationDeliveryStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'partially_sent'
  | 'failed'
  | 'cancelled';

export interface NotificationData {
  deliveryOrderId?: string | null;
  deliveryId?: string | null;
  driverId?: string | null;
  vehicleId?: string | null;
  transactionId?: string | null;
  incidentId?: string | null;
  screen?: string | null;
}

export interface Notification {
  _id: string;
  recipientUserId: string;
  recipientRole: string;
  senderUserId?: string | null;
  notificationType: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  priority: NotificationPriority;
  channels: string[];
  deliveryStatus: NotificationDeliveryStatus;
  isRead: boolean;
  readAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationDelivery {
  _id: string;
  notificationId: string;
  recipientUserId: string;
  channel: 'in_app' | 'push' | 'sms' | 'email';
  provider: string;
  providerMessageId?: string | null;
  deliveryStatus: 'pending' | 'processing' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  attemptCount: number;
  sentAt?: string | null;
  deliveredAt?: string | null;
  failedAt?: string | null;
  lastError?: string | null;
  createdAt: string;
}

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notification, NotificationType } from '../../../types/notification.types';
import { formatTimeAgo } from '../../../utils/formatters';

interface NotificationCardProps {
  notification: Notification;
  onPress?: () => void;
  onMarkAsRead?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onMarkAsRead,
}) => {
  const getTypeConfig = (type: NotificationType) => {
    switch (type) {
      case 'delivery':
        return {
          icon: 'bicycle-outline' as const,
          bgColor: 'bg-[#E6F4EE]',
          iconColor: '#00684A',
          badgeText: 'Trip Order',
        };
      case 'payment':
        return {
          icon: 'cash-outline' as const,
          bgColor: 'bg-[#E6F4EE]',
          iconColor: '#00684A',
          badgeText: 'Settlement',
        };
      case 'warning':
        return {
          icon: 'warning-outline' as const,
          bgColor: 'bg-amber-100',
          iconColor: '#D97706',
          badgeText: 'Safety Alert',
        };
      case 'auth':
        return {
          icon: 'shield-checkmark-outline' as const,
          bgColor: 'bg-[#E6F4EE]',
          iconColor: '#00684A',
          badgeText: 'Driver Security',
        };
      default:
        return {
          icon: 'notifications-outline' as const,
          bgColor: 'bg-slate-100',
          iconColor: '#475569',
          badgeText: 'Dispatch',
        };
    }
  };

  const config = getTypeConfig(notification.notificationType);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`p-4 rounded-2xl mb-3 border ${
        notification.isRead
          ? 'bg-white border-slate-100'
          : 'bg-[#E6F4EE]/40 border-[#00684A]/30 shadow-sm'
      }`}
    >
      <View className="flex-row items-start">
        <View
          className={`w-11 h-11 rounded-full items-center justify-center mr-3.5 ${config.bgColor}`}
        >
          <Ionicons name={config.icon} size={22} color={config.iconColor} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className={`text-base flex-1 mr-2 ${
                notification.isRead ? 'font-semibold text-slate-800' : 'font-bold text-slate-900'
              }`}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            <Text className="text-xs text-slate-400">
              {formatTimeAgo(notification.createdAt)}
            </Text>
          </View>

          <Text
            className={`text-sm leading-snug mb-2 ${
              notification.isRead ? 'text-slate-500' : 'text-slate-700 font-medium'
            }`}
          >
            {notification.message}
          </Text>

          <View className="flex-row items-center justify-between mt-1">
            <View className="flex-row items-center space-x-2">
              <View className="px-2 py-0.5 rounded-full bg-slate-100 mr-2">
                <Text className="text-[10px] font-semibold text-slate-600 uppercase">
                  {config.badgeText}
                </Text>
              </View>
              {notification.priority === 'urgent' || notification.priority === 'high' ? (
                <View className="px-2 py-0.5 rounded-full bg-red-100">
                  <Text className="text-[10px] font-bold text-red-700 uppercase">
                    {notification.priority}
                  </Text>
                </View>
              ) : null}
            </View>

            {!notification.isRead && onMarkAsRead ? (
              <TouchableOpacity
                onPress={onMarkAsRead}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="flex-row items-center"
              >
                <Text className="text-xs font-bold text-[#00684A]">Mark read</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

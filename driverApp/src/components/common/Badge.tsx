import React from 'react';
import { View, Text } from 'react-native';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  icon,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'success':
        return { container: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' };
      case 'warning':
        return { container: 'bg-amber-50 border-amber-200', text: 'text-amber-700' };
      case 'danger':
        return { container: 'bg-red-50 border-red-200', text: 'text-red-700' };
      case 'info':
        return { container: 'bg-blue-50 border-blue-200', text: 'text-blue-700' };
      default:
        return { container: 'bg-slate-100 border-slate-200', text: 'text-slate-700' };
    }
  };

  const colors = getBadgeColors();
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <View className={`flex-row items-center border rounded-full self-start ${colors.container} ${padding}`}>
      {icon ? <View className="mr-1">{icon}</View> : null}
      <Text className={`font-semibold capitalize ${colors.text}`}>{label}</Text>
    </View>
  );
};

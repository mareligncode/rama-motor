import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionTitle?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'bicycle-outline',
  title,
  description,
  actionTitle,
  onActionPress,
}) => {
  return (
    <View className="items-center justify-center p-8 text-center">
      <View className="w-16 h-16 rounded-full bg-emerald-50 items-center justify-center mb-4">
        <Ionicons name={icon} size={32} color="#059669" />
      </View>
      <Text className="text-lg font-bold text-slate-800 text-center mb-1.5">{title}</Text>
      <Text className="text-sm text-slate-500 text-center max-w-xs mb-5 leading-relaxed">
        {description}
      </Text>
      {actionTitle && onActionPress ? (
        <Button title={actionTitle} size="sm" onPress={onActionPress} />
      ) : null}
    </View>
  );
};

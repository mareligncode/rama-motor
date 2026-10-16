import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showBadge?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showBadge = false,
  onBackPress,
  rightAction,
}) => {
  const router = useRouter();
  const { colors } = useTheme();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderBottomColor: colors.border,
      }}
      className="flex-row items-center justify-between px-4 py-3 border-b"
    >
      <View className="flex-row items-center flex-1 mr-2 min-w-0">
        {showBack ? (
          <TouchableOpacity
            onPress={handleBack}
            style={{ backgroundColor: colors.surfaceVariant }}
            className="w-9 h-9 rounded-full items-center justify-center mr-2.5 shrink-0"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : null}

        {(!showBack || showBadge) ? (
          <View className="w-9 h-9 rounded-full overflow-hidden mr-2.5 shadow-sm shrink-0 bg-[#00684A]">
            <Image
              source={require("../../assets/images/image.png")}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        ) : null}

        <View className="flex-1 min-w-0">
          <Text style={{ color: colors.textPrimary }} className="text-lg font-bold" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ color: colors.textSecondary }} className="text-xs" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {rightAction ? <View className="ml-2 shrink-0">{rightAction}</View> : null}
    </View>
  );
};

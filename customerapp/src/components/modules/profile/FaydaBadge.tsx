import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { User } from '../../../types/user.types';
import { formatDate } from '../../../utils/formatters';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTheme } from '../../../hooks/useTheme';

interface FaydaBadgeProps {
  user: User | null;
}

export const FaydaBadge: React.FC<FaydaBadgeProps> = ({ user }) => {
  const router = useRouter();
  const { translations } = useTranslation();
  const { isDark, colors } = useTheme();
  const isVerified = !!user?.nationalIdVerifiedAt || !!user?.nationalIdVerified;

  return (
    <View
      style={{
        backgroundColor: isVerified
          ? isDark ? '#0E3A2B' : '#E6F4EE'
          : isDark ? '#2D1F08' : '#FFFBEB',
        borderColor: isVerified
          ? isDark ? '#00A86B' : 'rgba(0, 104, 74, 0.3)'
          : isDark ? '#B45309' : '#FDE68A',
      }}
      className="rounded-2xl p-4 border"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center flex-1 mr-2">
          <View
            style={{
              backgroundColor: isVerified
                ? isDark ? '#0A261C' : '#FFFFFF'
                : isDark ? '#451A03' : '#FEF3C7',
            }}
            className="w-9 h-9 rounded-full items-center justify-center mr-2.5 shadow-sm"
          >
            <Ionicons
              name={isVerified ? 'checkmark-circle' : 'shield-outline'}
              size={22}
              color={isVerified ? (isDark ? '#4ADE80' : '#00684A') : '#D97706'}
            />
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.textPrimary }} className="text-sm font-bold">
              {translations.fayda.cardTitle}
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs">
              {isVerified ? translations.profile.faydaVerified : translations.profile.faydaUnverified}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: isVerified
              ? '#00684A'
              : isDark ? '#78350F' : '#FEF3C7',
          }}
          className="px-2.5 py-1 rounded-full"
        >
          <Text
            style={{
              color: isVerified
                ? '#FFFFFF'
                : isDark ? '#FDE68A' : '#92400E',
            }}
            className="text-xs font-bold"
          >
            {isVerified ? translations.fayda.verifiedBadge : translations.fayda.unverifiedBadge}
          </Text>
        </View>
      </View>

      {isVerified ? (
        <View
          style={{ borderTopColor: isDark ? 'rgba(74, 222, 128, 0.2)' : 'rgba(0, 104, 74, 0.2)' }}
          className="mt-2 pt-2 border-t flex-row justify-between items-center"
        >
          <Text style={{ color: colors.textSecondary }} className="text-xs">
            FAN:{' '}
            <Text
              style={{ color: isDark ? '#4ADE80' : '#00684A' }}
              className="font-mono font-bold"
            >
              {user?.nationalIdDetail?.fanNumber
                ? `•••• •••• •••• ${user.nationalIdDetail.fanNumber.slice(-4)}`
                : '•••• ' + translations.fayda.verifiedBadge}
            </Text>
          </Text>
          <Text style={{ color: colors.textMuted }} className="text-[11px]">
            {formatDate(user?.nationalIdVerifiedAt)}
          </Text>
        </View>
      ) : (
        <View
          style={{ borderTopColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(251, 191, 36, 0.4)' }}
          className="mt-2 pt-2 border-t flex-row items-center justify-between"
        >
          <Text style={{ color: colors.textSecondary }} className="text-xs flex-1 mr-2 leading-relaxed">
            {translations.profile.faydaDesc}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/fayda-verify' as any)}
            className="px-3 py-1.5 rounded-lg bg-[#00684A] active:bg-[#005038]"
          >
            <Text className="text-xs font-bold text-white">{translations.fayda.verifyNow}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

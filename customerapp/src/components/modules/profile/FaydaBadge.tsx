import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { User } from '../../../types/user.types';
import { formatDate } from '../../../utils/formatters';

interface FaydaBadgeProps {
  user: User | null;
}

export const FaydaBadge: React.FC<FaydaBadgeProps> = ({ user }) => {
  const router = useRouter();
  const isVerified = !!user?.nationalIdVerifiedAt || !!user?.nationalIdVerified;

  return (
    <View
      className={`rounded-2xl p-4 border ${
        isVerified ? 'bg-[#E6F4EE] border-[#00684A]/30' : 'bg-amber-50/60 border-amber-200'
      }`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <View
            className={`w-9 h-9 rounded-full items-center justify-center mr-2.5 ${
              isVerified ? 'bg-white' : 'bg-amber-100'
            }`}
          >
            <Ionicons
              name={isVerified ? 'checkmark-circle' : 'shield-outline'}
              size={22}
              color={isVerified ? '#00684A' : '#D97706'}
            />
          </View>
          <View>
            <Text className="text-sm font-bold text-slate-900">
              Ethiopian Fayda National ID
            </Text>
            <Text className="text-xs text-slate-500">
              {isVerified ? 'Officially Verified & Authenticated' : 'National ID not yet verified'}
            </Text>
          </View>
        </View>

        <View
          className={`px-2.5 py-1 rounded-full ${
            isVerified ? 'bg-[#00684A]' : 'bg-amber-100'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              isVerified ? 'text-white' : 'text-amber-800'
            }`}
          >
            {isVerified ? 'Verified' : 'Action Needed'}
          </Text>
        </View>
      </View>

      {isVerified ? (
        <View className="mt-2 pt-2 border-t border-[#00684A]/20 flex-row justify-between items-center">
          <Text className="text-xs text-slate-700">
            FAN:{' '}
            <Text className="font-mono font-bold text-[#00684A]">
              {user?.nationalIdDetail?.fanNumber
                ? `•••• •••• •••• ${user.nationalIdDetail.fanNumber.slice(-4)}`
                : '•••• Verified'}
            </Text>
          </Text>
          <Text className="text-[11px] text-slate-500">
            Verified on {formatDate(user?.nationalIdVerifiedAt)}
          </Text>
        </View>
      ) : (
        <View className="mt-2 pt-2 border-t border-amber-200/60 flex-row items-center justify-between">
          <Text className="text-xs text-slate-600 flex-1 mr-2">
            Verify your Fayda ID to unlock verified sender trust badge and express delivery priority.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/fayda-verify' as any)}
            className="px-3 py-1.5 rounded-lg bg-[#00684A] active:bg-[#005038]"
          >
            <Text className="text-xs font-bold text-white">Verify Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { User } from '../../../types/user.types';
import { formatDate } from '../../../utils/formatters';

interface FaydaDriverCardProps {
  user: User | null;
}

export const FaydaDriverCard: React.FC<FaydaDriverCardProps> = ({ user }) => {
  const router = useRouter();
  const isVerified = !!user?.nationalIdVerifiedAt || !!user?.nationalIdVerified;

  return (
    <View
      className={`rounded-3xl p-5 border shadow-sm mb-5 ${
        isVerified ? 'bg-[#E6F4EE] border-[#00684A]/30' : 'bg-amber-500/10 border-amber-300'
      }`}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View
            className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${
              isVerified ? 'bg-white' : 'bg-amber-100'
            }`}
          >
            <Ionicons
              name={isVerified ? 'shield-checkmark' : 'alert-circle'}
              size={24}
              color={isVerified ? '#00684A' : '#D97706'}
            />
          </View>
          <View>
            <Text className="text-base font-bold text-slate-900">
              Driver Fayda Verification
            </Text>
            <Text className="text-xs text-slate-500">
              {isVerified
                ? 'Mandatory commercial courier status: Verified'
                : 'Commercial rider verification pending'}
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
            {isVerified ? 'Verified Rider' : 'Action Required'}
          </Text>
        </View>
      </View>

      {isVerified ? (
        <View className="pt-2 border-t border-slate-100 flex-row justify-between items-center">
          <Text className="text-xs text-slate-600">
            FAN: {user?.nationalIdDetail?.fanNumber ? `•••• ${user.nationalIdDetail.fanNumber.slice(-4)}` : '•••• Verified'}
          </Text>
          <Text className="text-[11px] text-slate-400">
            Approved on {formatDate(user?.nationalIdVerifiedAt)}
          </Text>
        </View>
      ) : (
        <View className="pt-2 border-t border-amber-200/50">
          <Text className="text-xs text-slate-600 mb-3">
            In compliance with Addis Ababa transport regulations, couriers must verify their National ID with Fayda before accepting high-value parcels.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/fayda-verify' as any)}
            className="w-full py-3 rounded-xl bg-amber-600 items-center justify-center active:bg-amber-700"
          >
            <Text className="text-xs font-bold text-white uppercase tracking-wider">
              Verify Fayda National ID Now
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

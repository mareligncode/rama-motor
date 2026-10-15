import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverDuty } from '../../../hooks/useDriverDuty';

export const PriorityScoreCard: React.FC = () => {
  const { priorityScore, priorityLevel } = useDriverDuty();

  return (
    <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-5">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-xl bg-amber-50 items-center justify-center mr-3">
            <Ionicons name="trophy" size={22} color="#D97706" />
          </View>
          <View>
            <Text className="text-base font-extrabold text-slate-900">
              Driver Priority Score
            </Text>
            <Text className="text-xs text-slate-500">
              Tier status affects dispatch order frequency
            </Text>
          </View>
        </View>

        <View className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
          <Text className="text-xs font-bold text-emerald-700 uppercase">
            {priorityLevel} Tier
          </Text>
        </View>
      </View>

      {/* Score Progress Bar */}
      <View className="my-2">
        <View className="flex-row justify-between items-center mb-1.5">
          <Text className="text-xs font-bold text-slate-700">Dispatch Ranking Score</Text>
          <Text className="text-sm font-black text-emerald-600">{priorityScore} / 100</Text>
        </View>
        <View className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <View
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${priorityScore}%` }}
          />
        </View>
      </View>

      {/* Driver Quality Factors from Schema */}
      <View className="flex-row justify-between pt-3 mt-2 border-t border-slate-100">
        <View className="items-center">
          <Text className="text-[11px] text-slate-400">Rating</Text>
          <Text className="text-xs font-bold text-slate-800 mt-0.5">⭐ 4.95</Text>
        </View>
        <View className="items-center">
          <Text className="text-[11px] text-slate-400">Acceptance</Text>
          <Text className="text-xs font-bold text-slate-800 mt-0.5">97%</Text>
        </View>
        <View className="items-center">
          <Text className="text-[11px] text-slate-400">On-Time</Text>
          <Text className="text-xs font-bold text-slate-800 mt-0.5">99%</Text>
        </View>
        <View className="items-center">
          <Text className="text-[11px] text-slate-400">Handover OTP</Text>
          <Text className="text-xs font-bold text-slate-800 mt-0.5">100%</Text>
        </View>
      </View>
    </View>
  );
};

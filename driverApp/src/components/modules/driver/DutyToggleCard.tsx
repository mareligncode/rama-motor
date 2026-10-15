import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDriverDuty } from '../../../hooks/useDriverDuty';

export const DutyToggleCard: React.FC = () => {
  const { isOnline, toggleDuty, todayDeliveries, todayEarnings } = useDriverDuty();

  return (
    <View
      className={`rounded-3xl p-5 border shadow-md ${
        isOnline
          ? 'bg-emerald-600 border-emerald-500 shadow-emerald-500/20'
          : 'bg-slate-900 border-slate-800 shadow-slate-900/30'
      }`}
    >
      {/* Top Toggle Row */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View
            className={`w-3.5 h-3.5 rounded-full mr-2.5 ${
              isOnline ? 'bg-emerald-300' : 'bg-slate-500'
            }`}
          />
          <Text className="text-lg font-black text-white uppercase tracking-wider">
            {isOnline ? 'You Are Online' : 'You Are Offline'}
          </Text>
        </View>

        <Switch
          value={isOnline}
          onValueChange={toggleDuty}
          trackColor={{ false: '#334155', true: '#34D399' }}
          thumbColor={isOnline ? '#FFFFFF' : '#94A3B8'}
        />
      </View>

      <Text className="text-xs text-slate-200 leading-relaxed mb-4">
        {isOnline
          ? 'Ready to accept incoming express motorcycle parcel orders. Stay safe & keep your helmet fastened.'
          : 'Switch Online to begin receiving delivery requests in your service zone.'}
      </Text>

      {/* Quick Metrics Bar */}
      <View className="flex-row items-center justify-between bg-black/20 rounded-2xl p-3 border border-white/10">
        <View className="items-center flex-1 border-r border-white/10">
          <Text className="text-[11px] font-semibold text-slate-300 uppercase">Today's Trips</Text>
          <Text className="text-lg font-black text-white mt-0.5">{todayDeliveries}</Text>
        </View>

        <View className="items-center flex-1">
          <Text className="text-[11px] font-semibold text-slate-300 uppercase">Est. Earnings</Text>
          <Text className="text-lg font-black text-emerald-300 mt-0.5">{todayEarnings} ETB</Text>
        </View>
      </View>
    </View>
  );
};

import React from 'react';
import { View, Text } from 'react-native';
import { useDriverDuty } from '../../../hooks/useDriverDuty';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { OnlineOfflineToggle } from './OnlineOfflineToggle';

export const DutyToggleCard: React.FC = () => {
  const { isOnline, toggleDuty, todayDeliveries, todayEarnings } = useDriverDuty();
  const { colors, isDark } = useTheme();
  const { translations } = useTranslation();

  return (
    <View
      style={{
        backgroundColor: isOnline
          ? isDark ? '#064E3B' : '#00684A'
          : isDark ? '#1E293B' : colors.surface,
        borderColor: isOnline ? '#10B981' : colors.border,
      }}
      className="rounded-3xl p-5 border shadow-md"
    >
      {/* Top Toggle Row */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1 mr-3">
          <View
            className={`w-3.5 h-3.5 rounded-full mr-2.5 ${
              isOnline ? 'bg-emerald-300' : 'bg-slate-400'
            }`}
          />
          <Text className="text-base font-black text-white uppercase tracking-wider">
            {isOnline ? translations?.driver?.online || 'Online' : translations?.driver?.offline || 'Offline'}
          </Text>
        </View>

        <OnlineOfflineToggle
          isOnline={isOnline}
          onToggle={toggleDuty}
          variant="switch"
          size="md"
        />
      </View>

      <Text className="text-xs text-slate-200 leading-relaxed mb-4">
        {isOnline
          ? translations?.driver?.stayOnlinePrompt || 'Ready to accept incoming express motorcycle parcel orders.'
          : translations?.driver?.goOnlinePrompt || 'Switch Online to begin receiving delivery requests in your service zone.'}
      </Text>

      {/* Quick Metrics Bar */}
      <View className="flex-row items-center justify-between bg-black/20 rounded-2xl p-3 border border-white/10">
        <View className="items-center flex-1 border-r border-white/10">
          <Text className="text-[11px] font-semibold text-slate-300 uppercase">
            {translations?.driver?.shiftTrips || "Today's Trips"}
          </Text>
          <Text className="text-lg font-black text-white mt-0.5">{todayDeliveries}</Text>
        </View>

        <View className="items-center flex-1">
          <Text className="text-[11px] font-semibold text-slate-300 uppercase">
            {translations?.driver?.todayEarnings || 'Est. Earnings'}
          </Text>
          <Text className="text-lg font-black text-emerald-300 mt-0.5">{todayEarnings} ETB</Text>
        </View>
      </View>
    </View>
  );
};

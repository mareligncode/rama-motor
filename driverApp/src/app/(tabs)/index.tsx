import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useDriverDuty } from "../../hooks/useDriverDuty";
import { useNotifications } from "../../hooks/useNotifications";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import { FaydaDriverCard } from "../../components/modules/driver/FaydaDriverCard";
import { LanguageSelectorModal } from "../../components/common/LanguageSelectorModal";
import { ThemeSelectorModal } from "../../components/common/ThemeSelectorModal";
import { ThemeDropdown } from "../../components/common/ThemeDropdown";

export default function DriverHomeScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { isOnline, toggleDuty, todayDeliveries, todayEarnings } = useDriverDuty();
  const { unreadCount, refreshNotifications } = useNotifications();
  const { colors, isDark } = useTheme();
  const { translations, language, supportedLanguages } = useTranslation();

  const [refreshing, setRefreshing] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([refreshUser(), refreshNotifications()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      {/* Top Header matching driver screen 1 */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
        className="flex-row items-center justify-between px-5 py-3.5 border-b"
      >
        <View className="flex-row items-center space-x-2">
          <View className="w-10 h-10 rounded-full bg-[#00684A] items-center justify-center mr-2">
            <Ionicons name="bicycle" size={20} color="#FFFFFF" />
          </View>
          <View>
            <Text style={{ color: colors.textPrimary }} className="text-base font-black">
              Rama Delivery
            </Text>
            <Text className="text-[10px] font-bold text-[#00684A] tracking-wider uppercase">
              {translations.driver.pilotTitle}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-2">
          {/* Theme Changer Dropdown */}
          <View className="mr-2">
            <ThemeDropdown compact />
          </View>

          {/* Quick Language Toggle */}
          <TouchableOpacity
            onPress={() => setLangModalVisible(true)}
            style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
            className="flex-row items-center px-2.5 py-1 rounded-full mr-2"
          >
            <Text className="text-xs mr-1">{currentLangObj.flag}</Text>
            <Text
              style={{ color: isDark ? '#4ADE80' : '#00684A' }}
              className="text-xs font-bold"
            >
              {currentLangObj.nativeName}
            </Text>
          </TouchableOpacity>

          {/* Notifications shortcut with unread badge */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/notifications" as any)}
            style={{ backgroundColor: colors.surfaceVariant }}
            className="w-10 h-10 rounded-full items-center justify-center relative mr-2"
          >
            <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
            {unreadCount > 0 ? (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          {/* Driver Avatar with Online Indicator */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile" as any)}
            className="w-10 h-10 rounded-full bg-[#00684A] items-center justify-center relative"
          >
            <Text className="text-white font-bold text-sm">
              {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "DR"}
            </Text>
            <View
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isOnline ? "bg-[#00A86B]" : "bg-slate-400"
              }`}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00684A" />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="p-4">
          {/* Floating Shift Earnings & Online Toggle Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-3xl p-4 border shadow-sm mb-3"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View
                  style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
                  className="w-11 h-11 rounded-2xl items-center justify-center mr-3"
                >
                  <Ionicons name="wallet-outline" size={22} color="#00684A" />
                </View>
                <View>
                  <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold">
                    {translations.driver.todayEarnings}
                  </Text>
                  <Text style={{ color: colors.textPrimary }} className="text-xl font-black">
                    ETB {todayEarnings.toLocaleString()}
                  </Text>
                  <Text style={{ color: isDark ? '#4ADE80' : '#00684A' }} className="text-[11px] font-bold">
                    ↗ +18% • {todayDeliveries} {translations.driver.shiftTrips}
                  </Text>
                </View>
              </View>

              {/* Big ONLINE / OFFLINE pill button matching template */}
              <TouchableOpacity
                onPress={toggleDuty}
                activeOpacity={0.8}
                className={`flex-row items-center px-4 py-2.5 rounded-full shadow-sm ${
                  isOnline ? "bg-[#00684A]" : "bg-slate-800"
                }`}
              >
                <View
                  className={`w-2.5 h-2.5 rounded-full mr-2 ${
                    isOnline ? "bg-[#34D399]" : "bg-slate-400"
                  }`}
                />
                <Text className="text-xs font-black text-white uppercase tracking-wider">
                  {isOnline ? translations.driver.online : translations.driver.offline}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Status Pills under card */}
          <View className="flex-row items-center justify-between mb-4">
            <View
              style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
              className="flex-row items-center px-3 py-1.5 rounded-full flex-1 mr-2"
            >
              <View className="w-2 h-2 rounded-full bg-[#00684A] mr-2" />
              <Text
                style={{ color: isDark ? '#4ADE80' : '#00684A' }}
                className="text-xs font-bold"
                numberOfLines={1}
              >
                {isOnline ? translations.driver.stayOnlinePrompt : translations.driver.goOnlinePrompt}
              </Text>
            </View>

            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="flex-row items-center border px-3 py-1.5 rounded-full"
            >
              <Ionicons name="navigate" size={12} color="#00684A" />
              <Text style={{ color: colors.textPrimary }} className="text-xs font-bold ml-1">
                GPS ±3m • 4G+
              </Text>
            </View>
          </View>

          {/* Map View Canvas matching driver screen 1 */}
          <View
            style={{ borderColor: colors.border }}
            className="h-60 bg-emerald-950/15 rounded-3xl overflow-hidden relative border mb-4 justify-between p-3.5"
          >
            <View className="space-y-1">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                BOLE RD (AFRICA AVE) • CAMEROON ST
              </Text>
              <Text className="text-[10px] font-bold text-slate-400">
                ATLAS JUNCTION • RWANDA ST
              </Text>
            </View>

            {/* Central Motorcycle Courier Navigation Marker */}
            <View className="absolute top-20 left-36 items-center">
              <View className="w-14 h-14 rounded-full bg-[#00684A]/20 items-center justify-center">
                <View className="w-10 h-10 rounded-full bg-[#00684A] items-center justify-center shadow-lg">
                  <Ionicons name="navigate" size={20} color="#FFFFFF" />
                </View>
              </View>
              <View
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                className="px-2 py-0.5 rounded-full border mt-1 shadow-sm"
              >
                <Text style={{ color: colors.textPrimary }} className="text-[10px] font-bold">
                  Bole Medhanialem • <Text className="text-amber-500 font-extrabold">1.3x Surge</Text>
                </Text>
              </View>
            </View>

            {/* Floating Map Action Controls on right */}
            <View className="absolute right-3.5 top-14 space-y-2">
              <TouchableOpacity
                onPress={() => Alert.alert(translations.driver.emergencySos, translations.driver.emergencyAlert)}
                className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 items-center justify-center shadow-sm"
              >
                <Ionicons name="shield" size={18} color="#DC2626" />
                <Text className="text-[8px] font-bold text-red-600">SOS</Text>
              </TouchableOpacity>
              <View
                style={{ backgroundColor: colors.surface }}
                className="w-9 h-9 rounded-full items-center justify-center shadow-sm"
              >
                <Ionicons name="layers-outline" size={18} color="#00684A" />
              </View>
              <View
                style={{ backgroundColor: colors.surface }}
                className="w-9 h-9 rounded-full items-center justify-center shadow-sm"
              >
                <Ionicons name="locate-outline" size={18} color="#00684A" />
              </View>
            </View>

            {/* Demand Banner inside map */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="rounded-2xl p-2.5 flex-row items-center justify-between border shadow-sm"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950 items-center justify-center mr-2">
                  <Ionicons name="flame" size={16} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.textPrimary }} className="text-xs font-bold" numberOfLines={1}>
                    {translations.driver.surgeNotice}
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-[10px]">
                    ~3 min wait time • 700m away
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward-circle" size={22} color="#00684A" />
            </View>
          </View>

          {/* Fayda Courier Compliance Card */}
          <FaydaDriverCard user={user} />

          {/* Shift Performance Summary Cards matching driver screen 1 */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-3xl p-5 border shadow-sm mb-5"
          >
            <View
              style={{ backgroundColor: colors.border }}
              className="w-10 h-1 rounded-full self-center mb-4"
            />

            <View className="flex-row justify-between mb-4">
              {/* Card 1: Completed Deliveries */}
              <View
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                }}
                className="w-[31%] p-3 rounded-2xl border"
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text style={{ color: colors.textSecondary }} className="text-[10px] font-semibold">
                    {translations.driver.shiftTrips}
                  </Text>
                  <Ionicons name="checkmark-circle" size={14} color="#00684A" />
                </View>
                <Text style={{ color: colors.textPrimary }} className="text-base font-black">
                  8 Trips
                </Text>
                <Text style={{ color: isDark ? '#4ADE80' : '#00684A' }} className="text-[10px] font-semibold mt-0.5">
                  4 left (+250)
                </Text>
              </View>

              {/* Card 2: On-Duty Hours */}
              <View
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                }}
                className="w-[31%] p-3 rounded-2xl border"
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text style={{ color: colors.textSecondary }} className="text-[10px] font-semibold">
                    {translations.driver.onDutyHours}
                  </Text>
                  <Ionicons name="time-outline" size={14} color="#00684A" />
                </View>
                <Text style={{ color: colors.textPrimary }} className="text-base font-black">
                  4h 15m
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-semibold mt-0.5">
                  {translations.driver.activeShift}
                </Text>
              </View>

              {/* Card 3: Acceptance Rate */}
              <View
                style={{
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                }}
                className="w-[31%] p-3 rounded-2xl border"
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text style={{ color: colors.textSecondary }} className="text-[10px] font-semibold">
                    {translations.driver.acceptanceRate}
                  </Text>
                  <Ionicons name="shield-checkmark" size={14} color="#00684A" />
                </View>
                <Text style={{ color: colors.textPrimary }} className="text-base font-black">
                  96%
                </Text>
                <Text className="text-[10px] text-amber-500 font-bold mt-0.5">
                  {translations.driver.goldPilot}
                </Text>
              </View>
            </View>

            {/* Daily Target Progress Bar */}
            <View
              style={{
                backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE',
                borderColor: isDark ? '#00A86B' : '#00684A',
              }}
              className="p-3.5 rounded-2xl border mb-4"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Ionicons name="trophy-outline" size={16} color="#00684A" />
                  <Text
                    style={{ color: isDark ? '#4ADE80' : '#00684A' }}
                    className="text-xs font-black ml-1.5"
                  >
                    {translations.driver.targetProgress}: 12
                  </Text>
                </View>
                <Text style={{ color: colors.textPrimary }} className="text-xs font-extrabold">
                  8 / 12 (67%)
                </Text>
              </View>
              <View
                style={{ backgroundColor: colors.surface }}
                className="w-full h-2.5 rounded-full overflow-hidden"
              >
                <View className="h-full bg-[#00684A] rounded-full" style={{ width: "67%" }} />
              </View>
            </View>

            {/* Service Wallet Card matching template */}
            <View
              style={{
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
              }}
              className="flex-row items-center justify-between p-3.5 rounded-2xl border mb-4"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View
                  style={{ backgroundColor: colors.surface, borderColor: colors.border }}
                  className="w-10 h-10 rounded-xl border items-center justify-center mr-3"
                >
                  <Ionicons name="card-outline" size={20} color="#00684A" />
                </View>
                <View>
                  <View className="flex-row items-center">
                    <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold">
                      {translations.driver.serviceWallet}
                    </Text>
                    <View
                      style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
                      className="px-1.5 py-0.2 rounded ml-1.5"
                    >
                      <Text
                        style={{ color: isDark ? '#4ADE80' : '#00684A' }}
                        className="text-[9px] font-bold"
                      >
                        {translations.driver.activeStatus}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.textPrimary }} className="text-sm font-black mt-0.5">
                    ETB 420.00 <Text style={{ color: colors.textMuted }} className="text-[10px] font-normal">(Min ETB 100)</Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => Alert.alert("Telebirr Top-Up", "Service wallet recharge with Telebirr")}
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
                className="border px-3 py-1.5 rounded-xl flex-row items-center shadow-sm"
              >
                <Ionicons name="add-circle" size={14} color="#00684A" />
                <Text style={{ color: colors.textPrimary }} className="text-xs font-bold ml-1">
                  Telebirr
                </Text>
              </TouchableOpacity>
            </View>

            {/* Emergency & Safety Hotline */}
            <TouchableOpacity
              onPress={() => Alert.alert(translations.driver.emergencySos, translations.driver.emergencyAlert)}
              style={{ backgroundColor: colors.surfaceVariant }}
              className="flex-row items-center justify-between p-3 rounded-xl"
            >
              <View className="flex-row items-center">
                <Ionicons name="warning" size={16} color="#DC2626" />
                <Text style={{ color: colors.textPrimary }} className="text-xs font-bold ml-2">
                  {translations.driver.emergencyLine}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
      <ThemeSelectorModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
      />
    </SafeAreaView>
  );
}

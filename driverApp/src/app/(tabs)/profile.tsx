import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import { useDriverDuty } from "../../hooks/useDriverDuty";
import { FaydaDriverCard } from "../../components/modules/driver/FaydaDriverCard";
import { Badge } from "../../components/common/Badge";
import { ThemeSelectorModal } from "../../components/common/ThemeSelectorModal";
import { LanguageSelectorModal } from "../../components/common/LanguageSelectorModal";
import { ThemeDropdown } from "../../components/common/ThemeDropdown";
import { formatEthiopianPhone, formatDate } from "../../utils/formatters";

export default function DriverProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isOnline, toggleDuty } = useDriverDuty();
  const { colors, isDark, themeMode } = useTheme();
  const { translations, language, supportedLanguages } = useTranslation();

  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const getThemeLabel = () => {
    if (themeMode === 'light') return translations.profile.themeLight;
    if (themeMode === 'dark') return translations.profile.themeDark;
    return `${translations.profile.themeSystem} (${isDark ? 'Dark' : 'Light'})`;
  };

  const handleLogout = () => {
    Alert.alert(
      translations.profile.logoutConfirmTitle,
      translations.profile.logoutConfirmMessage,
      [
        { text: translations.common.cancel, style: "cancel" },
        {
          text: translations.profile.logout,
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login" as any);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      {/* Top Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
        className="px-5 py-3.5 border-b flex-row items-center justify-between"
      >
        <Text style={{ color: colors.textPrimary }} className="text-xl font-extrabold">
          {translations.profile.title}
        </Text>

        {/* Quick Switchers in Header */}
        <View className="flex-row items-center space-x-2">
          <View className="mr-2">
            <ThemeDropdown compact />
          </View>

          <TouchableOpacity
            onPress={() => setLanguageModalVisible(true)}
            style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
            className="flex-row items-center px-2.5 py-1 rounded-full"
          >
            <Text className="text-xs mr-1">{currentLangObj.flag}</Text>
            <Text
              style={{ color: isDark ? '#4ADE80' : '#00684A' }}
              className="text-xs font-bold"
            >
              {currentLangObj.nativeName}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Driver Card */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-3xl p-5 border shadow-sm mb-5"
        >
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-[#00684A] items-center justify-center mr-4 shadow-sm shadow-[#00684A]/30">
              <Text className="text-white text-2xl font-black">
                {user?.fullName ? user.fullName[0].toUpperCase() : "D"}
              </Text>
            </View>
            <View className="flex-1">
              <Text style={{ color: colors.textPrimary }} className="text-lg font-bold" numberOfLines={1}>
                {user?.fullName || "Courier Partner"}
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-sm font-medium">
                {formatEthiopianPhone(user?.normalizedPhone || user?.phoneNumber || "")}
              </Text>
              <View className="flex-row items-center mt-2 space-x-2">
                <Badge
                  label={user?.accountStatus || "active"}
                  variant={user?.accountStatus === "active" ? "success" : "warning"}
                  size="sm"
                />
                <View className="ml-2">
                  <Badge label={translations.auth.driverRoleBadge} variant="success" size="sm" />
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/edit-profile" as any)}
            style={{
              backgroundColor: colors.surfaceVariant,
              borderColor: colors.border,
            }}
            className="w-full py-2.5 rounded-xl border items-center justify-center active:opacity-80"
          >
            <Text style={{ color: colors.textPrimary }} className="text-xs font-bold">
              {translations.profile.editProfile}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Duty Status Quick Toggle Button */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
          className="rounded-2xl p-4 border shadow-sm mb-5 flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View
              className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                isOnline
                  ? isDark ? "bg-emerald-950" : "bg-emerald-100"
                  : isDark ? "bg-slate-800" : "bg-slate-100"
              }`}
            >
              <Ionicons
                name={isOnline ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={isOnline ? "#059669" : "#64748B"}
              />
            </View>
            <View>
              <Text style={{ color: colors.textPrimary }} className="text-sm font-bold">
                {translations.driver.dutyStatus}: {isOnline ? translations.driver.online : translations.driver.offline}
              </Text>
              <Text style={{ color: colors.textSecondary }} className="text-xs">
                {isOnline ? "Receiving route delivery dispatches" : "Not receiving new dispatch offers"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={toggleDuty}
            className={`px-3 py-1.5 rounded-lg ${
              isOnline
                ? "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900"
                : "bg-emerald-600"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                isOnline ? "text-red-600 dark:text-red-400" : "text-white"
              }`}
            >
              {isOnline ? "Go Offline" : "Go Online"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Preferences: Theme & Language */}
        <View className="mb-5">
          <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider mb-2.5 ml-1">
            {translations.profile.preferences}
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-2xl border overflow-hidden shadow-sm"
          >
            {/* Theme Selector Row */}
            <TouchableOpacity
              onPress={() => setThemeModalVisible(true)}
              style={{ borderBottomColor: colors.border }}
              className="flex-row items-center justify-between p-4 border-b active:opacity-80"
            >
              <View className="flex-row items-center flex-1">
                <View
                  style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
                  className="w-9 h-9 rounded-full items-center justify-center mr-3"
                >
                  <Ionicons
                    name={isDark ? "moon-outline" : "sunny-outline"}
                    size={20}
                    color={isDark ? "#4ADE80" : "#00684A"}
                  />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.textPrimary }} className="text-sm font-bold">
                    {translations.profile.theme}
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-xs">
                    {getThemeLabel()}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Text
                  style={{ color: isDark ? '#4ADE80' : '#00684A' }}
                  className="text-xs font-semibold mr-1 capitalize"
                >
                  {themeMode}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Language Selector Row */}
            <TouchableOpacity
              onPress={() => setLanguageModalVisible(true)}
              className="flex-row items-center justify-between p-4 active:opacity-80"
            >
              <View className="flex-row items-center flex-1">
                <View
                  style={{ backgroundColor: isDark ? '#1E3A5F' : '#EFF6FF' }}
                  className="w-9 h-9 rounded-full items-center justify-center mr-3"
                >
                  <Ionicons name="language-outline" size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.textPrimary }} className="text-sm font-bold">
                    {translations.profile.language}
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-xs">
                    {currentLangObj.label} ({currentLangObj.nativeName})
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <Text className="text-xs mr-1">{currentLangObj.flag}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fayda National ID Section */}
        <View className="mb-5">
          <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider mb-2.5 ml-1">
            {translations.profile.faydaTitle}
          </Text>
          <FaydaDriverCard user={user} />
        </View>

        {/* Security & Registered Devices */}
        <View className="mb-5">
          <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider mb-2.5 ml-1">
            {translations.profile.activeDevices}
          </Text>

          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-2xl border overflow-hidden shadow-sm"
          >
            <TouchableOpacity
              onPress={() => router.push("/devices" as any)}
              style={{ borderBottomColor: colors.border }}
              className="flex-row items-center justify-between p-4 border-b active:opacity-80"
            >
              <View className="flex-row items-center">
                <View
                  style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
                  className="w-9 h-9 rounded-full items-center justify-center mr-3"
                >
                  <Ionicons
                    name="hardware-chip-outline"
                    size={20}
                    color={isDark ? "#4ADE80" : "#00684A"}
                  />
                </View>
                <View>
                  <Text style={{ color: colors.textPrimary }} className="text-sm font-bold">
                    {translations.profile.activeDevices}
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-xs">
                    Active push sessions for order alerts
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/fayda-verify" as any)}
              className="flex-row items-center justify-between p-4 active:opacity-80"
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950 items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark-outline" size={20} color="#2563EB" />
                </View>
                <View>
                  <Text style={{ color: colors.textPrimary }} className="text-sm font-bold">
                    Fayda National ID
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-xs">
                    Verify or view verified FAN number
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Member Info */}
        <View
          style={{
            backgroundColor: colors.surfaceVariant,
          }}
          className="rounded-2xl p-4 mb-6"
        >
          <View className="flex-row justify-between items-center mb-1">
            <Text style={{ color: colors.textSecondary }} className="text-xs">
              Driver Account Since
            </Text>
            <Text style={{ color: colors.textPrimary }} className="text-xs font-semibold">
              {formatDate(user?.createdAt)}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text style={{ color: colors.textSecondary }} className="text-xs">
              Rama Delivery Dispatch Status
            </Text>
            <Text
              style={{ color: isDark ? '#4ADE80' : '#00684A' }}
              className="text-xs font-semibold"
            >
              Phase 1 Connected
            </Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center py-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl active:opacity-80"
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text className="text-sm font-bold text-red-600 ml-2">
            {translations.profile.logout}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
      />

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />
    </SafeAreaView>
  );
}

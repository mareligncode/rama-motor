import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import { Button } from "../../components/common/Button";
import { LanguageSelectorModal } from "../../components/common/LanguageSelectorModal";
import { ThemeDropdown } from "../../components/common/ThemeDropdown";
import { isValidEthiopianPhone, normalizeEthiopianPhone } from "../../utils/validators";

export default function DriverLoginScreen() {
  const router = useRouter();
  const { requestOtp } = useAuth();
  const { colors, isDark } = useTheme();
  const { translations, language, supportedLanguages } = useTranslation();

  const [phone, setPhone] = useState("912345678");
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cleanPhone = phone.replace(/\D/g, "");
  const isValid = isValidEthiopianPhone(phone);
  const carrier = cleanPhone.startsWith("7") ? translations.auth.carrierSafari : translations.auth.carrierEthio;

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const handleSendOtp = async () => {
    setError("");

    if (!cleanPhone) {
      setError(translations.common.error + ": " + translations.auth.phoneLabel);
      return;
    }

    if (!isValid) {
      setError("Please enter a valid 9-digit Ethiopian mobile number (9... / 7...)");
      return;
    }

    const normalized = normalizeEthiopianPhone(cleanPhone);
    setLoading(true);

    try {
      const res = await requestOtp({
        phoneNumber: normalized,
        purpose: "login",
      });

      router.push({
        pathname: "/(auth)/verify-otp" as any,
        params: {
          phoneNumber: normalized,
          devCode: res.devCode || "",
        },
      });
    } catch (err: any) {
      setError(err?.message || "Failed to send courier verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Top App Bar */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          }}
          className="flex-row items-center justify-between px-5 py-3 border-b"
        >
          <View className="flex-row items-center space-x-2">
            <View className="w-10 h-10 rounded-full bg-[#00684A] items-center justify-center mr-2">
              <Ionicons name="bicycle" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text style={{ color: colors.textPrimary }} className="text-base font-black">
                Rama Delivery
              </Text>
              <Text className="text-[10px] font-bold text-[#00684A] uppercase tracking-wider">
                COURIER PILOT ADDIS
              </Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-2">
            {/* Theme Changer Dropdown */}
            <View className="mr-2">
              <ThemeDropdown compact />
            </View>

            {/* Language Switcher Pill */}
            <TouchableOpacity
              onPress={() => setLangModalVisible(true)}
              style={{
                backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE',
                borderColor: isDark ? '#00A86B' : '#00684A',
              }}
              className="flex-row items-center px-3 py-1.5 rounded-full border mr-2"
            >
              <Text className="text-xs mr-1">{currentLangObj.flag}</Text>
              <Text
                style={{ color: isDark ? '#4ADE80' : '#00684A' }}
                className="text-xs font-bold"
              >
                {currentLangObj.nativeName}
              </Text>
              <Ionicons
                name="chevron-down"
                size={12}
                color={isDark ? "#4ADE80" : "#00684A"}
                style={{ marginLeft: 3 }}
              />
            </TouchableOpacity>

            <View className="w-9 h-9 rounded-full bg-[#00684A] items-center justify-center">
              <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Carrier Status pill */}
          <View className="flex-row justify-between items-center mb-3">
            <View
              style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}
              className="flex-row items-center px-2.5 py-1 rounded-full"
            >
              <View className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
              <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold">
                Network: {carrier}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="flash" size={14} color="#00684A" />
              <Text className="text-xs font-bold text-[#00684A] ml-1">Live Dispatch</Text>
            </View>
          </View>

          {/* Role Pill */}
          <View
            style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
            className="self-start px-2.5 py-1 rounded-md mb-2"
          >
            <Text
              style={{ color: isDark ? '#4ADE80' : '#00684A' }}
              className="text-[11px] font-black uppercase tracking-wider"
            >
              DRIVER APP • Commercial Motorcycle Courier
            </Text>
          </View>

          {/* Heading */}
          <Text style={{ color: colors.textPrimary }} className="text-2xl font-black tracking-tight mb-1">
            {translations.auth.loginTitle}
          </Text>
          <Text className="text-sm text-[#00684A] font-semibold mb-2">
            {translations.auth.loginSubtitle}
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-xs leading-relaxed mb-5">
            {translations.auth.loginSubDescription}
          </Text>

          {/* Mobile Number Box Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-2xl p-4 border shadow-sm mb-4"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text style={{ color: colors.textSecondary }} className="text-[11px] font-bold uppercase tracking-wider">
                {translations.auth.phoneLabel}
              </Text>
              <View
                style={{ backgroundColor: colors.surfaceVariant }}
                className="flex-row items-center px-2 py-0.5 rounded-full"
              >
                <Ionicons name="radio" size={12} color="#00684A" />
                <Text style={{ color: colors.textPrimary }} className="text-[11px] font-semibold ml-1">
                  {carrier}
                </Text>
              </View>
            </View>

            {/* Input Row */}
            <View
              style={{
                backgroundColor: colors.inputBackground,
                borderColor: error ? "#EF4444" : colors.border,
              }}
              className="flex-row items-center border rounded-xl px-3 py-2.5 mb-2"
            >
              <View
                style={{ borderRightColor: colors.border }}
                className="flex-row items-center pr-2.5 mr-2.5 border-r"
              >
                <Text className="text-xl mr-1.5">🇪🇹</Text>
                <Text style={{ color: colors.textPrimary }} className="text-base font-bold">
                  +251
                </Text>
                <Ionicons name="chevron-down" size={14} color={colors.textSecondary} style={{ marginLeft: 2 }} />
              </View>

              <TextInput
                value={phone}
                onChangeText={(val) => {
                  setPhone(val);
                  if (error) setError("");
                }}
                placeholder="91 234 5678"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                style={{ color: colors.textPrimary }}
                className="flex-1 text-lg font-bold py-0 tracking-wider"
              />
            </View>

            {error ? (
              <View className="flex-row items-center mt-1">
                <Ionicons name="alert-circle" size={14} color="#EF4444" />
                <Text className="text-xs text-red-500 ml-1 font-medium">{error}</Text>
              </View>
            ) : null}

            {/* Quick Prefixes Row */}
            <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Text style={{ color: colors.textMuted }} className="text-[11px] font-medium">
                {translations.auth.quickNetwork}:
              </Text>
              <View className="flex-row space-x-1.5">
                <TouchableOpacity
                  onPress={() => setPhone("91" + phone.slice(2))}
                  style={{ backgroundColor: colors.surfaceVariant }}
                  className="px-2.5 py-1 rounded-md active:opacity-70 mr-1.5"
                >
                  <Text style={{ color: colors.textPrimary }} className="text-[11px] font-bold">
                    91 Ethio
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPhone("92" + phone.slice(2))}
                  style={{ backgroundColor: colors.surfaceVariant }}
                  className="px-2.5 py-1 rounded-md active:opacity-70 mr-1.5"
                >
                  <Text style={{ color: colors.textPrimary }} className="text-[11px] font-bold">
                    92 Ethio
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPhone("71" + phone.slice(2))}
                  style={{ backgroundColor: colors.surfaceVariant }}
                  className="px-2.5 py-1 rounded-md active:opacity-70"
                >
                  <Text style={{ color: colors.textPrimary }} className="text-[11px] font-bold">
                    71 Safari
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <Button
            title={translations.auth.getOtpBtn}
            onPress={handleSendOtp}
            loading={loading}
            size="lg"
            rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          />

          {/* Driver Feature Cards */}
          <View className="mt-6 space-y-3">
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="flex-row items-center p-3.5 rounded-2xl border shadow-sm mb-2.5"
            >
              <View
                style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
                className="w-11 h-11 rounded-xl items-center justify-center mr-3"
              >
                <Ionicons name="bicycle-outline" size={22} color="#00684A" />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.textPrimary }} className="text-sm font-bold">
                  {translations.auth.featureFleetTitle}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5">
                  {translations.auth.featureFleetDesc}
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="flex-row items-center p-3.5 rounded-2xl border shadow-sm mb-2.5"
            >
              <View className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950 items-center justify-center mr-3">
                <Ionicons name="shield-checkmark-outline" size={22} color="#2563EB" />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.textPrimary }} className="text-sm font-bold">
                  {translations.auth.featureFaydaDriverTitle}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5">
                  {translations.auth.featureFaydaDriverDesc}
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="flex-row items-center p-3.5 rounded-2xl border shadow-sm"
            >
              <View
                style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
                className="w-11 h-11 rounded-xl items-center justify-center mr-3"
              >
                <Ionicons name="cash-outline" size={22} color="#00684A" />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.textPrimary }} className="text-sm font-bold">
                  {translations.auth.featureTelebirrPayoutTitle}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5">
                  {translations.auth.featureTelebirrPayoutDesc}
                </Text>
              </View>
            </View>
          </View>

          {/* Legal Footer */}
          <Text style={{ color: colors.textMuted }} className="text-[11px] text-center leading-relaxed mt-6 mb-2">
            {translations.auth.termsNotice}
          </Text>
          <View className="flex-row items-center justify-center">
            <Ionicons name="shield-checkmark-outline" size={14} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary }} className="text-[11px] font-medium ml-1">
              {translations.auth.driverSafetyProtocol}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
    </SafeAreaView>
  );
}

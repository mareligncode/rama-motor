import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import { OtpInput } from "../../components/modules/auth/OtpInput";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { LanguageSelectorModal } from "../../components/common/LanguageSelectorModal";
import { ThemeDropdown } from "../../components/common/ThemeDropdown";
import { formatEthiopianPhone } from "../../utils/formatters";
import { isValidOtp } from "../../utils/validators";

export default function CustomerVerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phoneNumber: string; devCode?: string; purpose?: string }>();
  const phone = params.phoneNumber || "";
  const devCode = params.devCode || "";

  const { verifyOtp, requestOtp } = useAuth();
  const { colors, isDark } = useTheme();
  const { translations, language, supportedLanguages } = useTranslation();

  const [code, setCode] = useState(devCode);
  const [fullName, setFullName] = useState("");
  const [timer, setTimer] = useState(42);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    setError("");

    if (!isValidOtp(code)) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    try {
      setLoading(true);
      await verifyOtp({
        phoneNumber: phone,
        code,
        role: "sender",
        fullName: fullName.trim() || undefined,
      });

      router.replace("/(tabs)" as any);
    } catch (err: any) {
      setError(err?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (channel: "sms" | "telegram") => {
    if (!canResend) return;

    try {
      setResending(true);
      setError("");
      await requestOtp({
        phoneNumber: phone,
        purpose: "login",
      });

      setTimer(60);
      setCanResend(false);
      Alert.alert("Code Sent", `A fresh 6-digit code has been sent via ${channel.toUpperCase()}`);
    } catch (err: any) {
      setError(err?.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {/* Top Header matching customer screen 3 */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          }}
          className="flex-row items-center justify-between px-5 py-3 border-b"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ backgroundColor: colors.surfaceVariant }}
            className="w-9 h-9 rounded-full items-center justify-center mr-2 shrink-0"
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <View className="flex-row items-center flex-1 mr-2 min-w-0">
            <View className="w-8 h-8 rounded-full overflow-hidden mr-2 shadow-sm shrink-0 bg-[#00684A]">
              <Image
                source={require("../../assets/images/image.png")}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View className="flex-1 min-w-0">
              <Text style={{ color: colors.textPrimary }} className="text-sm font-black leading-tight" numberOfLines={1}>
                Rama Delivery
              </Text>
              <Text className="text-[9px] font-bold text-[#00684A] uppercase" numberOfLines={1}>
                DELIVERY
              </Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-1.5 shrink-0">
            {/* Theme Changer Dropdown */}
            <ThemeDropdown compact />

            <TouchableOpacity
              onPress={() => setLangModalVisible(true)}
              style={{
                backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE',
                borderColor: isDark ? '#00A86B' : '#00684A',
              }}
              className="flex-row items-center px-2 py-1 rounded-full border"
              activeOpacity={0.8}
            >
              <Text className="text-xs mr-1">{currentLangObj.flag}</Text>
              <Text
                style={{ color: isDark ? '#4ADE80' : '#00684A' }}
                className="text-xs font-bold"
                numberOfLines={1}
              >
                {currentLangObj.code.toUpperCase()}
              </Text>
            </TouchableOpacity>

            <View className="w-8 h-8 rounded-full bg-[#00684A] items-center justify-center shadow-sm">
              <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Status Badges */}
          <View className="flex-row items-center justify-between mb-4">
            <View
              style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
              className="flex-row items-center px-3 py-1 rounded-full"
            >
              <View className="w-2 h-2 rounded-full bg-[#00684A] mr-2" />
              <Text
                style={{ color: isDark ? '#4ADE80' : '#00684A' }}
                className="text-xs font-bold"
              >
                {translations.auth.smsGatewayActive}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert(translations.auth.support, translations.auth.supportLine)}
              style={{ backgroundColor: colors.surfaceVariant }}
              className="flex-row items-center px-2.5 py-1 rounded-full"
            >
              <Ionicons name="headset-outline" size={14} color="#00684A" />
              <Text className="text-xs font-bold text-[#00684A] ml-1">{translations.auth.support}</Text>
            </TouchableOpacity>
          </View>

          {/* Heading */}
          <Text style={{ color: colors.textPrimary }} className="text-2xl font-black tracking-tight mb-1">
            {translations.auth.verifyOtpTitle}
          </Text>
          <Text className="text-sm text-[#00684A] font-semibold mb-4">
            {translations.auth.verifyOtpSubtitle}
          </Text>

          {/* Phone Details Card with Edit action */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="flex-row items-center justify-between rounded-2xl p-4 border shadow-sm mb-5"
          >
            <View className="flex-row items-center flex-1 mr-2">
              <View
                style={{ backgroundColor: colors.surfaceVariant }}
                className="w-11 h-11 rounded-xl items-center justify-center mr-3"
              >
                <Ionicons name="phone-portrait-outline" size={22} color={colors.textPrimary} />
              </View>
              <View>
                <Text style={{ color: colors.textSecondary }} className="text-xs font-medium">
                  {translations.auth.otpSentTo}
                </Text>
                <Text style={{ color: colors.textPrimary }} className="text-base font-black tracking-wide">
                  {formatEthiopianPhone(phone)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE',
                borderColor: isDark ? '#00A86B' : '#00684A',
              }}
              className="px-3 py-1.5 rounded-xl border flex-row items-center"
            >
              <Ionicons name="pencil" size={12} color="#00684A" />
              <Text className="text-xs font-bold text-[#00684A] ml-1">{translations.auth.editPhone}</Text>
            </TouchableOpacity>
          </View>

          {/* 6-Digit Cells Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-3xl p-5 border shadow-sm mb-5"
          >
            <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-wider text-center mb-4">
              {translations.auth.enterCode}
            </Text>

            <OtpInput
              length={6}
              code={code}
              onChangeCode={(val: string) => {
                setCode(val);
                if (error) setError("");
              }}
              error={error}
            />

            {/* Circular Countdown Badge */}
            <View className="items-center mt-5">
              <View
                style={{
                  backgroundColor: canResend
                    ? isDark ? '#0E3A2B' : '#E6F4EE'
                    : colors.surfaceVariant,
                }}
                className="flex-row items-center px-4 py-2 rounded-full"
              >
                <Ionicons
                  name={canResend ? "checkmark-circle" : "timer-outline"}
                  size={16}
                  color="#00684A"
                />
                <Text className="text-xs font-bold text-[#00684A] ml-2">
                  {canResend
                    ? translations.auth.readyToResend
                    : `${translations.auth.resendIn} ${timer}s`}
                </Text>
              </View>
            </View>

            {/* Resend Action Channels */}
            <View className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Text style={{ color: colors.textMuted }} className="text-xs text-center mb-3">
                {translations.auth.didntReceive}
              </Text>
              <View className="flex-row justify-center space-x-2">
                <TouchableOpacity
                  onPress={() => handleResend("sms")}
                  disabled={!canResend || resending}
                  style={{
                    backgroundColor: canResend ? "#00684A" : colors.surfaceVariant,
                  }}
                  className="px-4 py-2 rounded-xl flex-row items-center mr-2"
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={14}
                    color={canResend ? "#FFFFFF" : colors.textMuted}
                  />
                  <Text
                    style={{
                      color: canResend ? "#FFFFFF" : colors.textMuted,
                    }}
                    className="text-xs font-bold ml-1.5"
                  >
                    {translations.auth.resendSms}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleResend("telegram")}
                  disabled={!canResend || resending}
                  style={{
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                  }}
                  className="px-4 py-2 rounded-xl border flex-row items-center"
                >
                  <Ionicons
                    name="paper-plane-outline"
                    size={14}
                    color={canResend ? "#0088cc" : colors.textMuted}
                  />
                  <Text
                    style={{
                      color: canResend ? colors.textPrimary : colors.textMuted,
                    }}
                    className="text-xs font-bold ml-1.5"
                  >
                    Telegram
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Full Name field */}
          <View className="mb-4">
            <Input
              label={translations.auth.fullNameLabel}
              placeholder={translations.auth.fullNamePlaceholder}
              value={fullName}
              onChangeText={setFullName}
              helper={translations.auth.fullNameHelper}
            />
          </View>

          {/* Submit Action Button */}
          <Button
            title={translations.auth.verifyAndContinue}
            onPress={handleVerify}
            loading={loading}
            size="lg"
            rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          />

          {/* Footer Security Badges */}
          <View className="items-center mt-6">
            <View className="flex-row items-center mb-1">
              <Ionicons name="lock-closed" size={14} color="#00684A" />
              <Text className="text-xs font-bold text-[#00684A] ml-1">
                Rama Delivery Security Shield
              </Text>
            </View>
            <Text style={{ color: colors.textMuted }} className="text-[11px] text-center">
              {translations.auth.shieldProtected}
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

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Header } from "../components/common/Header";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "../hooks/useTranslation";
import { useTheme } from "../hooks/useTheme";
import { isValidFaydaFan, isValidFaydaFin } from "../utils/validators";

export default function FaydaVerifyScreen() {
  const router = useRouter();
  const { user, verifyFayda } = useAuth();
  const { translations } = useTranslation();
  const { colors, isDark } = useTheme();

  const [fanNumber, setFanNumber] = useState(user?.nationalIdDetail?.fanNumber || "");
  const [finNumber, setFinNumber] = useState(user?.nationalIdDetail?.finNumber || "");
  const [testOtp, setTestOtp] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");

    if (!fanNumber.trim() && !finNumber.trim()) {
      setError(translations.fayda.fanLabel);
      return;
    }

    if (fanNumber.trim() && !isValidFaydaFan(fanNumber)) {
      setError(translations.fayda.fanLabel + " (16 digits)");
      return;
    }

    setLoading(true);

    try {
      await verifyFayda({
        fanNumber: fanNumber.trim() || undefined,
        finNumber: finNumber.trim() || undefined,
        testOtp: testOtp.trim() || "123456",
      });

      Alert.alert(
        translations.fayda.cardTitle,
        translations.common.success,
        [{ text: translations.common.continue, onPress: () => router.back() }]
      );
    } catch (err: any) {
      const msg = err?.message || translations.common.error;
      setError(msg);
      Alert.alert(translations.common.error, msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      <Header title={translations.fayda.cardTitle} showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Fayda Info Card */}
          <View
            style={{
              backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE',
              borderColor: isDark ? '#00A86B' : 'rgba(0, 104, 74, 0.3)',
            }}
            className="border rounded-2xl p-4 mb-6"
          >
            <Text
              style={{ color: isDark ? '#4ADE80' : '#00684A' }}
              className="text-base font-bold mb-1"
            >
              {translations.fayda.cardSub}
            </Text>
            <Text
              style={{ color: isDark ? '#A7F3D0' : '#005038' }}
              className="text-xs leading-relaxed"
            >
              {translations.fayda.verificationDesc}
            </Text>
          </View>

          {/* Form Fields */}
          <Input
            label={translations.fayda.fanLabel}
            placeholder="e.g. 1234567890123456"
            keyboardType="number-pad"
            maxLength={16}
            value={fanNumber}
            onChangeText={(val) => {
              setFanNumber(val.replace(/\D/g, ""));
              if (error) setError("");
            }}
            helper={translations.fayda.fanLabel}
          />

          <Input
            label={translations.fayda.finLabel}
            placeholder="e.g. FIN987654321"
            value={finNumber}
            onChangeText={(val) => {
              setFinNumber(val);
              if (error) setError("");
            }}
            helper={translations.fayda.finLabel}
          />

          <Input
            label="Fayda OTP"
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            value={testOtp}
            onChangeText={setTestOtp}
            helper={translations.fayda.sandboxOtpHelper}
          />

          {error ? (
            <Text className="text-xs text-red-500 font-semibold mb-4 ml-1">{error}</Text>
          ) : null}

          <View className="mt-4">
            <Button
              title={translations.fayda.verifyButton}
              onPress={handleVerify}
              loading={loading}
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

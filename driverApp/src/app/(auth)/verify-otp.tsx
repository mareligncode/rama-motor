import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { OtpInput } from "../../components/modules/auth/OtpInput";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { formatEthiopianPhone } from "../../utils/formatters";
import { isValidOtp } from "../../utils/validators";

export default function DriverVerifyOtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone: string; devCode?: string; purpose?: string }>();
  const phone = params.phone || "";
  const devCode = params.devCode || "";

  const { verifyOtp, requestOtp } = useAuth();

  const [code, setCode] = useState(devCode);
  const [fullName, setFullName] = useState("");
  const [timer, setTimer] = useState(42);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<"EN" | "AM">("EN");

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

    setLoading(true);

    try {
      await verifyOtp({
        phoneNumber: phone,
        code: code.trim(),
        fullName: fullName.trim() || undefined,
        role: "driver",
      });

      router.replace("/(tabs)" as any);
    } catch (err: any) {
      const message = err?.message || "Invalid or expired verification code";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setError("");

    try {
      const res = await requestOtp({
        phoneNumber: phone,
        purpose: "login",
      });

      if (res?.devCode) {
        setCode(res.devCode);
      }

      setTimer(60);
      setCanResend(false);
      Alert.alert("Code Dispatched", "A new driver authentication code has been sent via SMS.");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between px-5 py-3 bg-white border-b border-slate-100">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center mr-2"
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>

          <View className="flex-row items-center flex-1 ml-1">
            <View className="w-8 h-8 rounded-full bg-[#00684A] items-center justify-center mr-2">
              <Ionicons name="bicycle" size={16} color="#FFFFFF" />
            </View>
            <View>
              <Text className="text-sm font-black text-[#111827]">Rama Motor</Text>
              <Text className="text-[9px] font-bold text-[#00684A] uppercase">COURIER DISPATCH</Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-2">
            <TouchableOpacity
              onPress={() => setLanguage(language === "EN" ? "AM" : "EN")}
              className="flex-row items-center bg-slate-100 px-2.5 py-1 rounded-full mr-2"
            >
              <Text className={`text-xs font-bold ${language === "EN" ? "text-[#00684A]" : "text-slate-400"}`}>
                EN
              </Text>
              <Text className="text-xs text-slate-300 mx-1">|</Text>
              <Text className={`text-xs font-bold ${language === "AM" ? "text-[#00684A]" : "text-slate-400"}`}>
                አማ
              </Text>
            </TouchableOpacity>
            <View className="w-8 h-8 rounded-full bg-[#00684A] items-center justify-center">
              <Ionicons name="person" size={16} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center bg-[#E6F4EE] px-3 py-1 rounded-full">
              <View className="w-2 h-2 rounded-full bg-[#00684A] mr-2" />
              <Text className="text-xs font-bold text-[#00684A]">Courier Gateway Active</Text>
            </View>
            <View className="flex-row items-center bg-slate-100 px-2.5 py-1 rounded-full">
              <Ionicons name="headset-outline" size={14} color="#00684A" />
              <Text className="text-xs font-bold text-[#00684A] ml-1">Dispatch Support</Text>
            </View>
          </View>

          <Text className="text-2xl font-black text-[#111827] tracking-tight mb-1">
            Verify Driver Mobile
          </Text>
          <Text className="text-sm text-[#00684A] font-semibold mb-4">
            የማረጋገጫ ኮድ ያስገቡ
          </Text>

          <View className="flex-row items-center justify-between bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-5">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-11 h-11 rounded-xl bg-slate-100 items-center justify-center mr-3">
                <Ionicons name="phone-portrait-outline" size={22} color="#111827" />
              </View>
              <View>
                <Text className="text-xs text-slate-400 font-medium">Courier code sent to</Text>
                <Text className="text-base font-black text-slate-900 tracking-wide">
                  {formatEthiopianPhone(phone)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center bg-slate-100 px-3 py-1.5 rounded-xl"
            >
              <Ionicons name="pencil" size={14} color="#00684A" />
              <Text className="text-xs font-bold text-[#00684A] ml-1">Edit</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between px-1 mb-1">
            <Text className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              6-Digit Security Token
            </Text>
            <Text className="text-xs font-bold text-slate-400">
              Digits ({code.length} / 6)
            </Text>
          </View>

          <OtpInput
            code={code}
            onChangeCode={(val) => {
              setCode(val);
              if (error) setError("");
            }}
            error={error}
            devCodeHint={devCode}
            onDevCodeFill={() => setCode(devCode)}
          />

          <View className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full border-2 border-[#00684A] items-center justify-center mr-3 bg-[#E6F4EE]">
                  <Text className="text-xs font-black text-[#00684A]">{timer}s</Text>
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900">Didn't receive the SMS?</Text>
                  <Text className="text-xs text-slate-400">
                    {canResend ? "Resend is now ready" : `Resend code in 00:${timer < 10 ? `0${timer}` : timer}`}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleResend}
                disabled={!canResend || resending}
                className={`px-3 py-1.5 rounded-xl ${canResend ? "bg-[#00684A]" : "bg-slate-100"}`}
              >
                <Text className={`text-xs font-bold ${canResend ? "text-white" : "text-slate-400"}`}>
                  {resending ? "Sending..." : "Resend"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4">
            <Input
              label="Courier Full Name (optional for new drivers)"
              placeholder="e.g. Dawit Haile"
              value={fullName}
              onChangeText={setFullName}
              helper="Name shown on client dispatch packages and delivery tracking"
            />
          </View>

          <Button
            title="Verify & Start Courier Shift"
            onPress={handleVerify}
            loading={loading}
            size="lg"
            rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

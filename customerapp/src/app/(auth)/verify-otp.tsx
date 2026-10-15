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

export default function CustomerVerifyOtpScreen() {
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
        role: "sender",
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
      Alert.alert("Code Dispatched", "A new SMS verification code has been dispatched to your mobile.");
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
        {/* Top Navigation Bar */}
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
              <Text className="text-[9px] font-bold text-[#00684A] uppercase">DELIVERY</Text>
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
          {/* Status Badges */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center bg-[#E6F4EE] px-3 py-1 rounded-full">
              <View className="w-2 h-2 rounded-full bg-[#00684A] mr-2" />
              <Text className="text-xs font-bold text-[#00684A]">Ethio Telecom • SMS Gateway Active</Text>
            </View>
            <View className="flex-row items-center bg-slate-100 px-2.5 py-1 rounded-full">
              <Ionicons name="headset-outline" size={14} color="#00684A" />
              <Text className="text-xs font-bold text-[#00684A] ml-1">Support</Text>
            </View>
          </View>

          {/* Heading */}
          <Text className="text-2xl font-black text-[#111827] tracking-tight mb-1">
            Verify phone number
          </Text>
          <Text className="text-sm text-[#00684A] font-semibold mb-4">
            ማረጋገጫ ኮድ ያስገቡ
          </Text>

          {/* Phone Details Card with Edit action */}
          <View className="flex-row items-center justify-between bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-5">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="w-11 h-11 rounded-xl bg-slate-100 items-center justify-center mr-3">
                <Ionicons name="phone-portrait-outline" size={22} color="#111827" />
              </View>
              <View>
                <Text className="text-xs text-slate-400 font-medium">Code sent via SMS to</Text>
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

          {/* 6-Digit Token Header */}
          <View className="flex-row items-center justify-between px-1 mb-1">
            <Text className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              6-Digit Security Token
            </Text>
            <Text className="text-xs font-bold text-slate-400">
              Digits ({code.length} / 6)
            </Text>
          </View>

          {/* 6-Digit OtpInput */}
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

          <View className="flex-row items-start px-1 mb-5">
            <Ionicons name="information-circle-outline" size={16} color="#64748B" style={{ marginTop: 1 }} />
            <Text className="text-[11px] text-slate-500 ml-1.5 leading-relaxed flex-1">
              SMS delivery around dense Addis transit hubs (Bole, Meskel Sq, Megenagna) may experience brief telecom delays.
            </Text>
          </View>

          {/* Resend Card with circular countdown */}
          <View className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full border-2 border-[#00684A] items-center justify-center mr-3 bg-[#E6F4EE]">
                  <Text className="text-xs font-black text-[#00684A]">{timer}s</Text>
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900">Didn't receive the code?</Text>
                  <Text className="text-xs text-slate-400">
                    {canResend ? "Resend is now available" : `Resend SMS available in 00:${timer < 10 ? `0${timer}` : timer}`}
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

            {/* Alternative verification channels */}
            <View className="flex-row items-center space-x-2 pt-2 border-t border-slate-100">
              <TouchableOpacity
                onPress={() => Alert.alert("WhatsApp Dispatch", "WhatsApp OTP fallback requested.")}
                className="flex-1 flex-row items-center justify-center bg-slate-50 border border-slate-200 py-2.5 rounded-xl mr-2"
              >
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#00684A" />
                <Text className="text-xs font-bold text-slate-700 ml-1.5">WhatsApp Code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => Alert.alert("Voice Dispatch", "Automated voice call code requested.")}
                className="flex-1 flex-row items-center justify-center bg-slate-50 border border-slate-200 py-2.5 rounded-xl"
              >
                <Ionicons name="call-outline" size={16} color="#00684A" />
                <Text className="text-xs font-bold text-slate-700 ml-1.5">Call Voice Code</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Full Name input for new senders */}
          <View className="mb-4">
            <Input
              label="Sender / Customer Name (optional)"
              placeholder="e.g. Abebe Kebede"
              value={fullName}
              onChangeText={setFullName}
              helper="Name shown on delivery pickup packages and courier handovers"
            />
          </View>

          {/* Action Button */}
          <Button
            title="Verify & Continue"
            onPress={handleVerify}
            loading={loading}
            size="lg"
            rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          />

          <TouchableOpacity
            onPress={() => Alert.alert("24/7 Support", "Calling Rama Motor Addis Support: 991 / +251 11 812 3456")}
            className="flex-row items-center justify-center mt-4 mb-5"
          >
            <Ionicons name="help-circle-outline" size={16} color="#00684A" />
            <Text className="text-xs font-bold text-[#00684A] ml-1">
              Need help receiving SMS? Contact 24/7 Addis Support
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-center bg-[#E6F4EE] rounded-xl p-3">
            <Ionicons name="shield-checkmark" size={16} color="#00684A" />
            <Text className="text-xs font-semibold text-[#00684A] ml-2">
              Protected by Rama Motor Shield • Secure 256-bit authentication
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

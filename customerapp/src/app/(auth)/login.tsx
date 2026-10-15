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
import { Button } from "../../components/common/Button";
import { isValidEthiopianPhone, normalizeEthiopianPhone } from "../../utils/validators";

export default function CustomerLoginScreen() {
  const router = useRouter();
  const { requestOtp } = useAuth();

  const [phone, setPhone] = useState("911234567");
  const [language, setLanguage] = useState<"EN" | "AM">("EN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cleanPhone = phone.replace(/\D/g, "");
  const isValid = isValidEthiopianPhone(phone);
  const carrier = cleanPhone.startsWith("7") ? "Safaricom" : "Ethio Telecom";

  const handleSendOtp = async () => {
    setError("");

    if (!cleanPhone) {
      setError("Please enter your phone number");
      return;
    }

    if (!isValid) {
      setError("Please enter a valid 9-digit Ethiopian mobile number");
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
          phone: normalized,
          devCode: res?.devCode || "",
          purpose: "login",
        },
      });
    } catch (err: any) {
      const message = err?.message || "Failed to send verification code. Please try again.";
      setError(message);
      Alert.alert("Request Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Top Navigation Bar matching UI Template */}
        <View className="flex-row items-center justify-between px-5 py-3 bg-white border-b border-slate-100">
          <View className="flex-row items-center space-x-2">
            <View className="w-10 h-10 rounded-full bg-[#00684A] items-center justify-center">
              <Ionicons name="bicycle" size={20} color="#FFFFFF" />
            </View>
            <View className="ml-2">
              <Text className="text-base font-black text-[#111827] tracking-tight">
                Rama Motor
              </Text>
              <Text className="text-[10px] font-bold text-[#00684A] tracking-wider uppercase">
                ITEM DELIVERY
              </Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-2">
            {/* Language Switcher Pill */}
            <TouchableOpacity
              onPress={() => setLanguage(language === "EN" ? "AM" : "EN")}
              className="flex-row items-center bg-slate-100 px-3 py-1.5 rounded-full mr-2"
            >
              <Text className={`text-xs font-bold ${language === "EN" ? "text-[#00684A]" : "text-slate-400"}`}>
                EN
              </Text>
              <Text className="text-xs text-slate-300 mx-1">|</Text>
              <Text className={`text-xs font-bold ${language === "AM" ? "text-[#00684A]" : "text-slate-400"}`}>
                አማ
              </Text>
            </TouchableOpacity>

            <View className="w-9 h-9 rounded-full bg-[#00684A] items-center justify-center">
              <Ionicons name="person" size={18} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Trust Badges */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center bg-[#E6F4EE] px-3 py-1 rounded-full">
              <View className="w-2 h-2 rounded-full bg-[#00684A] mr-2" />
              <Text className="text-xs font-bold text-[#00684A]">Addis Secure Delivery</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark" size={16} color="#00684A" />
              <Text className="text-xs font-bold text-[#00684A] ml-1">MoT Approved</Text>
            </View>
          </View>

          {/* Role Pill & Sub-indicator */}
          <View className="self-start px-2.5 py-1 rounded-md bg-[#E6F4EE] mb-2">
            <Text className="text-[11px] font-black text-[#00684A] uppercase tracking-wider">
              CUSTOMER APP • Sender & Receiver
            </Text>
          </View>

          {/* Heading */}
          <Text className="text-2xl font-black text-[#111827] tracking-tight mb-1">
            Enter your phone number
          </Text>
          <Text className="text-sm text-[#00684A] font-semibold mb-2">
            ስልክ ቁጥርዎን ያስገቡ
          </Text>
          <Text className="text-xs text-slate-500 leading-relaxed mb-5">
            We'll send an SMS with a 6-digit verification code to log in or instantly create your Rama Motor Delivery pass.
          </Text>

          {/* Mobile Number Box Card */}
          <View className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Mobile Number
              </Text>
              <View className="flex-row items-center bg-slate-100 px-2 py-0.5 rounded-full">
                <Ionicons name="radio" size={12} color="#00684A" />
                <Text className="text-[11px] font-semibold text-slate-700 ml-1">{carrier}</Text>
              </View>
            </View>

            {/* Input Row */}
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 mb-2">
              <View className="flex-row items-center pr-2.5 mr-2.5 border-r border-slate-300">
                <Text className="text-xl mr-1.5">🇪🇹</Text>
                <Text className="text-base font-bold text-slate-900">+251</Text>
                <Ionicons name="chevron-down" size={14} color="#64748B" style={{ marginLeft: 2 }} />
              </View>

              <TextInput
                value={phone}
                onChangeText={(val) => {
                  setPhone(val);
                  if (error) setError("");
                }}
                placeholder="91 123 4567"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={10}
                className="flex-1 text-lg font-bold text-slate-900 py-0 tracking-wider"
              />

              {phone ? (
                <TouchableOpacity onPress={() => setPhone("")}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            <Text className="text-[11px] text-slate-400 mb-2">
              Enter 9 digits without initial 0 (e.g., 91 123 4567 or 71 234 5678)
            </Text>

            {/* Validity Feedback pill */}
            {isValid ? (
              <View className="flex-row items-center bg-[#E6F4EE] px-3 py-1.5 rounded-lg">
                <Ionicons name="checkmark-circle" size={16} color="#00684A" />
                <Text className="text-xs font-bold text-[#00684A] ml-2">
                  Valid Ethiopian number • {carrier} network
                </Text>
              </View>
            ) : null}

            {error ? (
              <Text className="text-xs text-red-500 font-semibold mt-1.5">{error}</Text>
            ) : null}

            {/* Quick Presets matching UI */}
            <View className="flex-row items-center mt-3 pt-3 border-t border-slate-100">
              <Text className="text-[11px] text-slate-400 mr-2">Quick presets:</Text>
              <TouchableOpacity
                onPress={() => setPhone("911234567")}
                className="bg-slate-100 px-2.5 py-1 rounded-full mr-2"
              >
                <Text className="text-[11px] font-bold text-slate-700">91 (Ethio)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPhone("712345678")}
                className="bg-slate-100 px-2.5 py-1 rounded-full mr-2"
              >
                <Text className="text-[11px] font-bold text-slate-700">71 (Safari)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setPhone("")}
                className="bg-red-50 px-2.5 py-1 rounded-full"
              >
                <Text className="text-[11px] font-bold text-red-700">Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Primary Action Button in Deep Forest Green */}
          <Button
            title="Send verification code"
            onPress={handleSendOtp}
            loading={loading}
            size="lg"
            rightIcon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
          />

          {/* Delivery speed notice */}
          <View className="flex-row items-center justify-center mt-3 mb-6">
            <Ionicons name="flash" size={14} color="#00684A" />
            <Text className="text-xs text-slate-500 font-medium ml-1">
              Average code delivery time in Addis:{" "}
              <Text className="font-bold text-slate-800">4 seconds</Text>
            </Text>
          </View>

          {/* 3 Information Cards from Template */}
          <View className="space-y-3 mb-6">
            <View className="flex-row items-center bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
              <View className="w-11 h-11 rounded-xl bg-[#E6F4EE] items-center justify-center mr-3">
                <Ionicons name="cube-outline" size={22} color="#00684A" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-bold text-slate-900">Fast Item & Parcel Pickups</Text>
                  <View className="bg-slate-100 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] font-bold text-slate-600">15k+ Deliveries</Text>
                  </View>
                </View>
                <Text className="text-xs text-slate-500 mt-0.5">
                  Zero traffic delays with express motorcycle couriers
                </Text>
              </View>
            </View>

            <View className="flex-row items-center bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
              <View className="w-11 h-11 rounded-xl bg-[#E6F4EE] items-center justify-center mr-3">
                <Ionicons name="lock-closed-outline" size={22} color="#00684A" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900">Passwordless Security</Text>
                <Text className="text-xs text-slate-500 mt-0.5">
                  End-to-end encrypted SMS verification token directly to your SIM
                </Text>
              </View>
            </View>

            <View className="flex-row items-center bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
              <View className="w-11 h-11 rounded-xl bg-[#E6F4EE] items-center justify-center mr-3">
                <Ionicons name="wallet-outline" size={22} color="#00684A" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-sm font-bold text-slate-900">Telebirr & CBE Birr Ready</Text>
                  <View className="bg-blue-100 px-1.5 py-0.2 rounded ml-1.5">
                    <Text className="text-[10px] font-bold text-blue-700">Auto</Text>
                  </View>
                </View>
                <Text className="text-xs text-slate-500 mt-0.5">
                  Seamless payment support for cashless deliveries & COD handover
                </Text>
              </View>
            </View>
          </View>

          {/* Legal Footer */}
          <Text className="text-[11px] text-slate-400 text-center leading-relaxed mb-2">
            By continuing, you agree to Rama Motor's Terms of Service and Privacy Policy. Standard SMS operator charges may apply.
          </Text>
          <View className="flex-row items-center justify-center">
            <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" />
            <Text className="text-[11px] text-slate-500 font-medium ml-1">
              Licensed by Addis Ababa City Transport Bureau
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

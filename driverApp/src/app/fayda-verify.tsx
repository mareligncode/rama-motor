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
import { isValidFaydaFan } from "../utils/validators";

export default function DriverFaydaVerifyScreen() {
  const router = useRouter();
  const { user, verifyFayda } = useAuth();

  const [fanNumber, setFanNumber] = useState(user?.nationalIdDetail?.fanNumber || "");
  const [finNumber, setFinNumber] = useState(user?.nationalIdDetail?.finNumber || "");
  const [testOtp, setTestOtp] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    setError("");

    if (!fanNumber.trim() && !finNumber.trim()) {
      setError("Please provide your 16-digit FAN or FIN number");
      return;
    }

    if (fanNumber.trim() && !isValidFaydaFan(fanNumber)) {
      setError("Fayda FAN must be 16 digits (e.g. 1234567890123456)");
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
        "Fayda Verified",
        "Your Courier Fayda National ID has been verified with the national database!",
        [{ text: "Done", onPress: () => router.back() }]
      );
    } catch (err: any) {
      const msg = err?.message || "Failed to verify Fayda ID with National ID registry";
      setError(msg);
      Alert.alert("Verification Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Driver Fayda National ID" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-[#E6F4EE] border border-[#00684A]/30 rounded-2xl p-4 mb-6">
            <Text className="text-base font-bold text-[#00684A] mb-1">
              Ethiopian National ID (Fayda / eSignet)
            </Text>
            <Text className="text-xs text-[#005038] leading-relaxed">
              Commercial motorcycle courier regulations require verified Fayda identification to accept parcel dispatches, express documents, and cash-on-delivery shipments.
            </Text>
          </View>

          <Input
            label="Fayda FAN (16-Digit National ID Number)"
            placeholder="e.g. 1234567890123456"
            keyboardType="number-pad"
            maxLength={16}
            value={fanNumber}
            onChangeText={(val) => {
              setFanNumber(val.replace(/\D/g, ""));
              if (error) setError("");
            }}
            helper="16-digit Fayda Access Number on your digital or physical Fayda card"
          />

          <Input
            label="Fayda FIN (Alternative ID / Optional)"
            placeholder="e.g. FIN987654321"
            value={finNumber}
            onChangeText={(val) => {
              setFinNumber(val);
              if (error) setError("");
            }}
            helper="Optional FIN number from the National ID authority"
          />

          <Input
            label="Fayda Verification Sandbox OTP"
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            value={testOtp}
            onChangeText={setTestOtp}
            helper="In dev/sandbox environment, default test OTP is 123456"
          />

          {error ? (
            <Text className="text-xs text-red-500 font-semibold mb-4 ml-1">{error}</Text>
          ) : null}

          <View className="mt-4">
            <Button
              title="Verify Driver Identity"
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

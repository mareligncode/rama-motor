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
import { formatEthiopianPhone } from "../utils/formatters";

export default function DriverEditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full courier name");
      return;
    }

    setLoading(true);

    try {
      await updateProfile({
        fullName: fullName.trim(),
        profileImageUrl: profileImageUrl.trim() || undefined,
      });

      Alert.alert("Profile Updated", "Driver details saved successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header title="Edit Courier Profile" showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center my-4">
            <View className="w-20 h-20 rounded-full bg-[#00684A] items-center justify-center shadow-md shadow-[#00684A]/30 mb-2">
              <Text className="text-white text-3xl font-black">
                {fullName ? fullName[0].toUpperCase() : "D"}
              </Text>
            </View>
            <Text className="text-xs text-slate-400 font-medium">Motorcycle Courier Partner</Text>
          </View>

          <Input
            label="Full Courier Name"
            placeholder="e.g. Dawit Haile"
            value={fullName}
            onChangeText={(val) => {
              setFullName(val);
              if (error) setError("");
            }}
            error={error}
          />

          <View className="w-full mb-4">
            <Text className="text-sm font-semibold text-slate-700 mb-1.5">Registered Mobile</Text>
            <View className="bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-3">
              <Text className="text-slate-500 font-medium">
                {formatEthiopianPhone(user?.normalizedPhone || user?.phoneNumber || "")} (Courier Phone)
              </Text>
            </View>
            <Text className="text-xs text-slate-400 mt-1 ml-1">
              Used for client dispatch contact and pickup OTP verification.
            </Text>
          </View>

          <Input
            label="Driver Photo URL (optional)"
            placeholder="https://example.com/driver-photo.jpg"
            value={profileImageUrl}
            onChangeText={setProfileImageUrl}
          />

          <View className="mt-4">
            <Button
              title="Save Driver Profile"
              onPress={handleSave}
              loading={loading}
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

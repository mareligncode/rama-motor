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
import { formatEthiopianPhone } from "../utils/formatters";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const { translations } = useTranslation();
  const { colors } = useTheme();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");

    if (!fullName.trim()) {
      setError(translations.auth.fullNameLabel);
      return;
    }

    setLoading(true);

    try {
      await updateProfile({
        fullName: fullName.trim(),
        profileImageUrl: profileImageUrl.trim() || undefined,
      });

      Alert.alert(
        translations.common.success,
        translations.common.save,
        [{ text: translations.common.continue, onPress: () => router.back() }]
      );
    } catch (err: any) {
      setError(err?.message || translations.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      <Header title={translations.profile.editProfile} showBack />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Preview */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 rounded-full bg-[#00684A] items-center justify-center mb-2 shadow-sm">
              <Text className="text-white text-3xl font-black">
                {fullName ? fullName[0].toUpperCase() : "D"}
              </Text>
            </View>
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold">
              {formatEthiopianPhone(user?.normalizedPhone || user?.phoneNumber || "")}
            </Text>
          </View>

          <Input
            label={translations.auth.fullNameLabel}
            placeholder={translations.auth.fullNamePlaceholder}
            value={fullName}
            onChangeText={(val) => {
              setFullName(val);
              if (error) setError("");
            }}
            helper={translations.auth.fullNameHelper}
          />

          <Input
            label="Profile Photo URL (Optional)"
            placeholder="https://..."
            value={profileImageUrl}
            onChangeText={setProfileImageUrl}
            helper="Direct HTTPS link to avatar picture"
          />

          {error ? (
            <Text className="text-xs text-red-500 font-semibold mb-4 ml-1">{error}</Text>
          ) : null}

          <View className="mt-4">
            <Button
              title={translations.common.save}
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

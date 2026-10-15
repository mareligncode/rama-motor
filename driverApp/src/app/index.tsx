import React, { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/(tabs)" as any);
      } else {
        router.replace("/(auth)/login" as any);
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <View className="flex-1 items-center justify-center bg-[#F8FAF9] px-6">
      <View className="w-16 h-16 rounded-2xl bg-[#00684A] items-center justify-center mb-5 shadow-lg shadow-[#00684A]/30">
        <Text className="text-3xl font-extrabold text-white">🏍</Text>
      </View>
      <Text className="text-2xl font-black text-[#111827] text-center tracking-tight">
        Rama Motor
      </Text>
      <Text className="text-sm font-semibold text-[#00684A] mt-1 mb-8 text-center uppercase tracking-wider">
        Courier Pilot & Delivery Partner
      </Text>
      <ActivityIndicator size="large" color="#00684A" />
    </View>
  );
}

import React, { useEffect } from "react";
import { View, ActivityIndicator, Text, Image } from "react-native";
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
      <View className="w-16 h-16 rounded-2xl overflow-hidden mb-5 shadow-lg shadow-[#00684A]/30 bg-[#00684A]">
        <Image
          source={require("../assets/images/image.png")}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
      <Text className="text-2xl font-black text-[#111827] text-center tracking-tight">
        Rama Delivery
      </Text>
      <Text className="text-sm font-semibold text-[#00684A] mt-1 mb-8 text-center uppercase tracking-wider">
        Courier Pilot & Delivery Partner
      </Text>
      <ActivityIndicator size="large" color="#00684A" />
    </View>
  );
}

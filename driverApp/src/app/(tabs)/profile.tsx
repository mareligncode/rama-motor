import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useDriverDuty } from "../../hooks/useDriverDuty";
import { FaydaDriverCard } from "../../components/modules/driver/FaydaDriverCard";
import { Badge } from "../../components/common/Badge";
import { formatEthiopianPhone, formatDate } from "../../utils/formatters";

export default function DriverProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isOnline, toggleDuty } = useDriverDuty();

  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to end your courier shift and log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login" as any);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Top Header */}
      <View className="px-5 py-3.5 bg-white border-b border-slate-100">
        <Text className="text-xl font-extrabold text-slate-900">Courier Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Driver Card */}
        <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-5">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-[#00684A] items-center justify-center mr-4 shadow-sm shadow-[#00684A]/30">
              <Text className="text-white text-2xl font-black">
                {user?.fullName ? user.fullName[0].toUpperCase() : "D"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-slate-900" numberOfLines={1}>
                {user?.fullName || "Courier Partner"}
              </Text>
              <Text className="text-sm text-slate-500 font-medium">
                {formatEthiopianPhone(user?.normalizedPhone || user?.phoneNumber || "")}
              </Text>
              <View className="flex-row items-center mt-2 space-x-2">
                <Badge
                  label={user?.accountStatus || "active"}
                  variant={user?.accountStatus === "active" ? "success" : "warning"}
                  size="sm"
                />
                <View className="ml-2">
                  <Badge label="Motorcycle Courier Pilot" variant="success" size="sm" />
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/edit-profile" as any)}
            className="w-full py-2.5 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center active:bg-slate-100"
          >
            <Text className="text-xs font-bold text-slate-700">Edit Name & Driver Info</Text>
          </TouchableOpacity>
        </View>

        {/* Duty Status Quick Toggle Button */}
        <View className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View
              className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                isOnline ? "bg-emerald-100" : "bg-slate-100"
              }`}
            >
              <Ionicons
                name={isOnline ? "radio-button-on" : "radio-button-off"}
                size={20}
                color={isOnline ? "#059669" : "#64748B"}
              />
            </View>
            <View>
              <Text className="text-sm font-bold text-slate-900">
                Shift Duty: {isOnline ? "Active Online" : "Resting Offline"}
              </Text>
              <Text className="text-xs text-slate-500">
                {isOnline ? "Receiving route delivery dispatches" : "Not receiving new dispatch offers"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={toggleDuty}
            className={`px-3 py-1.5 rounded-lg ${
              isOnline ? "bg-red-50 border border-red-200" : "bg-emerald-600"
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                isOnline ? "text-red-600" : "text-white"
              }`}
            >
              {isOnline ? "Go Offline" : "Go Online"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fayda National ID Section */}
        <View className="mb-5">
          <Text className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2.5 ml-1">
            Driver Verification & License
          </Text>
          <FaydaDriverCard user={user} />
        </View>

        {/* Security & Registered Devices */}
        <View className="mb-5">
          <Text className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2.5 ml-1">
            Courier App & Devices
          </Text>

          <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <TouchableOpacity
              onPress={() => router.push("/devices" as any)}
              className="flex-row items-center justify-between p-4 border-b border-slate-100 active:bg-slate-50"
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-full bg-emerald-50 items-center justify-center mr-3">
                  <Ionicons name="hardware-chip-outline" size={20} color="#059669" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900">Registered Devices</Text>
                  <Text className="text-xs text-slate-500">
                    Active push sessions for order alerts
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/fayda-verify" as any)}
              className="flex-row items-center justify-between p-4 active:bg-slate-50"
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-full bg-blue-50 items-center justify-center mr-3">
                  <Ionicons name="shield-checkmark-outline" size={20} color="#2563EB" />
                </View>
                <View>
                  <Text className="text-sm font-bold text-slate-900">Fayda National ID</Text>
                  <Text className="text-xs text-slate-500">
                    Verify or view verified FAN number
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Member Info */}
        <View className="bg-slate-100 rounded-2xl p-4 mb-6">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-xs text-slate-500">Driver Account Since</Text>
            <Text className="text-xs font-semibold text-slate-700">
              {formatDate(user?.createdAt)}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-slate-500">Rama Backend API Status</Text>
            <Text className="text-xs font-semibold text-emerald-600">Phase 1 Connected</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center py-4 bg-red-50 border border-red-200 rounded-2xl active:bg-red-100"
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text className="text-sm font-bold text-red-600 ml-2">End Shift & Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

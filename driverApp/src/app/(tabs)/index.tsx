import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useDriverDuty } from "../../hooks/useDriverDuty";
import { useNotifications } from "../../hooks/useNotifications";
import { FaydaDriverCard } from "../../components/modules/driver/FaydaDriverCard";

export default function DriverHomeScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { isOnline, toggleDuty, todayDeliveries, todayEarnings } = useDriverDuty();
  const { unreadCount, refreshNotifications } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([refreshUser(), refreshNotifications()]);
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9]">
      {/* Top Header matching driver screen 1 */}
      <View className="flex-row items-center justify-between px-5 py-3.5 bg-white border-b border-slate-100">
        <View className="flex-row items-center space-x-2">
          <View className="w-10 h-10 rounded-full bg-[#00684A] items-center justify-center">
            <Ionicons name="bicycle" size={20} color="#FFFFFF" />
          </View>
          <View className="ml-2">
            <Text className="text-base font-black text-[#111827]">Rama Motor</Text>
            <Text className="text-[10px] font-bold text-[#00684A] tracking-wider uppercase">
              PILOT ADDIS • COURIER
            </Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/notifications" as any)}
            className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center relative mr-2"
          >
            <Ionicons name="notifications-outline" size={20} color="#111827" />
            {unreadCount > 0 ? (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          {/* Driver Avatar with Online Indicator */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile" as any)}
            className="w-10 h-10 rounded-full bg-[#00684A] items-center justify-center relative"
          >
            <Text className="text-white font-bold text-sm">
              {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "DR"}
            </Text>
            <View
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                isOnline ? "bg-[#00A86B]" : "bg-slate-400"
              }`}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="p-4">
          {/* Floating Shift Earnings & Online Toggle Card */}
          <View className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-11 h-11 rounded-2xl bg-[#E6F4EE] items-center justify-center mr-3">
                  <Ionicons name="wallet-outline" size={22} color="#00684A" />
                </View>
                <View>
                  <Text className="text-xs font-semibold text-slate-400">Today</Text>
                  <Text className="text-xl font-black text-[#111827]">
                    ETB {todayEarnings.toLocaleString()}
                  </Text>
                  <Text className="text-[11px] font-bold text-[#00684A]">
                    ↗ +18% • {todayDeliveries} deliveries
                  </Text>
                </View>
              </View>

              {/* Big ONLINE / OFFLINE pill button matching template */}
              <TouchableOpacity
                onPress={toggleDuty}
                activeOpacity={0.8}
                className={`flex-row items-center px-4 py-2.5 rounded-full shadow-sm ${
                  isOnline ? "bg-[#00684A]" : "bg-slate-800"
                }`}
              >
                <View
                  className={`w-2.5 h-2.5 rounded-full mr-2 ${
                    isOnline ? "bg-[#34D399]" : "bg-slate-400"
                  }`}
                />
                <Text className="text-xs font-black text-white uppercase tracking-wider">
                  {isOnline ? "ONLINE" : "OFFLINE"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Status Pills under card */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center bg-[#E6F4EE] px-3 py-1.5 rounded-full flex-1 mr-2">
              <View className="w-2 h-2 rounded-full bg-[#00684A] mr-2" />
              <Text className="text-xs font-bold text-[#00684A]" numberOfLines={1}>
                {isOnline ? "Finding package requests in Bole..." : "Shift paused (Offline)"}
              </Text>
            </View>

            <View className="flex-row items-center bg-white border border-slate-200 px-3 py-1.5 rounded-full">
              <Ionicons name="navigate" size={12} color="#00684A" />
              <Text className="text-xs font-bold text-slate-700 ml-1">GPS ±3m • 4G+</Text>
            </View>
          </View>

          {/* Map View Canvas matching driver screen 1 */}
          <View className="h-60 bg-emerald-950/10 rounded-3xl overflow-hidden relative border border-slate-200 mb-4 justify-between p-3.5">
            <View className="space-y-1">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                BOLE RD (AFRICA AVE) • CAMEROON ST
              </Text>
              <Text className="text-[10px] font-bold text-slate-400">
                ATLAS JUNCTION • RWANDA ST
              </Text>
            </View>

            {/* Central Motorcycle Courier Navigation Marker */}
            <View className="absolute top-20 left-36 items-center">
              <View className="w-14 h-14 rounded-full bg-[#00684A]/20 items-center justify-center">
                <View className="w-10 h-10 rounded-full bg-[#00684A] items-center justify-center shadow-lg">
                  <Ionicons name="navigate" size={20} color="#FFFFFF" />
                </View>
              </View>
              <View className="bg-white px-2 py-0.5 rounded-full border border-slate-200 mt-1 shadow-sm">
                <Text className="text-[10px] font-bold text-slate-800">
                  Bole Medhanialem • <Text className="text-amber-600">1.3x Surge</Text>
                </Text>
              </View>
            </View>

            {/* Floating Map Action Controls on right */}
            <View className="absolute right-3.5 top-14 space-y-2">
              <TouchableOpacity
                onPress={() => Alert.alert("SOS Emergency", "Connecting to Addis Police 991 & Rama Safety Center")}
                className="w-10 h-10 rounded-full bg-red-50 border border-red-200 items-center justify-center shadow-sm"
              >
                <Ionicons name="shield" size={18} color="#DC2626" />
                <Text className="text-[8px] font-bold text-red-600">SOS</Text>
              </TouchableOpacity>
              <View className="w-9 h-9 rounded-full bg-white items-center justify-center shadow-sm">
                <Ionicons name="layers-outline" size={18} color="#00684A" />
              </View>
              <View className="w-9 h-9 rounded-full bg-white items-center justify-center shadow-sm">
                <Ionicons name="locate-outline" size={18} color="#00684A" />
              </View>
            </View>

            {/* Demand Banner inside map */}
            <View className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex-row items-center justify-between border border-slate-100 shadow-sm">
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-7 h-7 rounded-lg bg-blue-50 items-center justify-center mr-2">
                  <Ionicons name="flame" size={16} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-slate-900" numberOfLines={1}>
                    High demand at Bole Atlas
                  </Text>
                  <Text className="text-[10px] text-slate-500">
                    ~3 min wait time • 700m away
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward-circle" size={22} color="#00684A" />
            </View>
          </View>

          {/* Fayda Courier Compliance Card */}
          <FaydaDriverCard user={user} />

          {/* Shift Performance Summary Cards matching driver screen 1 */}
          <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-5">
            <View className="w-10 h-1 rounded-full bg-slate-200 self-center mb-4" />

            <View className="flex-row justify-between mb-4">
              {/* Card 1: Completed Deliveries */}
              <View className="w-[31%] bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-[10px] font-semibold text-slate-500">Completed</Text>
                  <Ionicons name="checkmark-circle" size={14} color="#00684A" />
                </View>
                <Text className="text-base font-black text-slate-900">8 Trips</Text>
                <Text className="text-[10px] text-[#00684A] font-semibold mt-0.5">
                  4 left for +250 ETB
                </Text>
              </View>

              {/* Card 2: On-Duty Hours */}
              <View className="w-[31%] bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-[10px] font-semibold text-slate-500">On-Duty</Text>
                  <Ionicons name="time-outline" size={14} color="#00684A" />
                </View>
                <Text className="text-base font-black text-slate-900">4h 15m</Text>
                <Text className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  Active shift
                </Text>
              </View>

              {/* Card 3: Acceptance Rate */}
              <View className="w-[31%] bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-[10px] font-semibold text-slate-500">Acceptance</Text>
                  <Ionicons name="shield-checkmark" size={14} color="#00684A" />
                </View>
                <Text className="text-base font-black text-slate-900">96%</Text>
                <Text className="text-[10px] text-amber-700 font-bold mt-0.5">
                  Tier: Gold Pilot
                </Text>
              </View>
            </View>

            {/* Daily Target Progress Bar */}
            <View className="p-3.5 rounded-2xl bg-[#E6F4EE]/60 border border-[#00684A]/20 mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Ionicons name="trophy-outline" size={16} color="#00684A" />
                  <Text className="text-xs font-black text-[#00684A] ml-1.5">
                    Daily Target: 12 Deliveries
                  </Text>
                </View>
                <Text className="text-xs font-extrabold text-slate-700">8 / 12 (67%)</Text>
              </View>
              <View className="w-full h-2.5 bg-white rounded-full overflow-hidden">
                <View className="h-full bg-[#00684A] rounded-full" style={{ width: "67%" }} />
              </View>
            </View>

            {/* Service Wallet Card matching template */}
            <View className="flex-row items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 mb-4">
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-10 h-10 rounded-xl bg-white border border-slate-200 items-center justify-center mr-3">
                  <Ionicons name="card-outline" size={20} color="#00684A" />
                </View>
                <View>
                  <View className="flex-row items-center">
                    <Text className="text-xs font-semibold text-slate-500">Service Wallet</Text>
                    <View className="bg-[#E6F4EE] px-1.5 py-0.2 rounded ml-1.5">
                      <Text className="text-[9px] font-bold text-[#00684A]">Active</Text>
                    </View>
                  </View>
                  <Text className="text-sm font-black text-slate-900 mt-0.5">
                    ETB 420.00 <Text className="text-[10px] text-slate-400 font-normal">(Min ETB 100)</Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => Alert.alert("Telebirr Top-Up", "Service wallet recharge with Telebirr")}
                className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl flex-row items-center shadow-sm"
              >
                <Ionicons name="add-circle" size={14} color="#00684A" />
                <Text className="text-xs font-bold text-slate-800 ml-1">Telebirr</Text>
              </TouchableOpacity>
            </View>

            {/* Emergency & Safety Hotline */}
            <TouchableOpacity
              onPress={() => Alert.alert("Emergency", "Calling Addis Police 991 & Rama Safety Center")}
              className="flex-row items-center justify-between p-3 rounded-xl bg-slate-50"
            >
              <View className="flex-row items-center">
                <Ionicons name="warning" size={16} color="#DC2626" />
                <Text className="text-xs font-bold text-slate-800 ml-2">
                  Emergency Assist: Police 991 • Rama Safety Line
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

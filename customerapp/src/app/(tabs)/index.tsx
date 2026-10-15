import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { FaydaBadge } from "../../components/modules/profile/FaydaBadge";

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { unreadCount, refreshNotifications } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [pickupSpot, setPickupSpot] = useState("Bole Medhanialem (Gate 2)");
  const [dropoffSpot, setDropoffSpot] = useState("Kazanchis • UNECA Compound");
  const [recipientPhone, setRecipientPhone] = useState("0923456789");
  const [recipientName, setRecipientName] = useState("Yonas G.");
  const [selectedFleet, setSelectedFleet] = useState<"electric" | "standard" | "cargo">("electric");
  const [selectedPayment, setSelectedPayment] = useState<"cash" | "telebirr" | "cbe">("telebirr");
  const [language, setLanguage] = useState<"EN" | "AM">("EN");

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([refreshUser(), refreshNotifications()]);
    setRefreshing(false);
  };

  const handleBookDelivery = () => {
    Alert.alert(
      "Confirm Item Dispatch",
      `Dispatch motorcycle courier from ${pickupSpot} to ${dropoffSpot} for recipient ${recipientName} (${recipientPhone})?\n\nEstimated Fee: ${
        selectedFleet === "electric" ? "165 ETB" : selectedFleet === "standard" ? "180 ETB" : "210 ETB"
      }`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Request Courier",
          onPress: () => {
            Alert.alert(
              "Courier Dispatched! 🏍",
              "Dodai EV Courier Dawit H. has accepted your parcel delivery. Safety pickup OTP is 4819."
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAF9]">
      {/* Top App Bar matching UI Screens */}
      <View className="flex-row items-center justify-between px-5 py-3.5 bg-white border-b border-slate-100">
        <View className="flex-row items-center space-x-2">
          <View className="w-10 h-10 rounded-full bg-[#00684A] items-center justify-center">
            <Ionicons name="bicycle" size={20} color="#FFFFFF" />
          </View>
          <View className="ml-2">
            <Text className="text-lg font-black text-[#111827]">Home</Text>
            <Text className="text-[10px] font-bold text-[#00684A] tracking-wider uppercase">
              RAMA MOTOR COURIER
            </Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-2">
          {/* Notifications shortcut with unread badge */}
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

          {/* Profile Circle with User Initials */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile" as any)}
            className="w-10 h-10 rounded-full bg-[#00684A] items-center justify-center"
          >
            <Text className="text-white font-bold text-sm">
              {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "CU"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Floating Search / Where are you sending card */}
        <View className="p-4">
          <View className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center mr-2.5">
                  <Ionicons name="search" size={18} color="#00684A" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-black text-slate-900 leading-tight">
                    Where are you sending items?
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5" numberOfLines={1}>
                    Pickup: {pickupSpot}
                  </Text>
                </View>
              </View>

              {/* Language Switcher */}
              <TouchableOpacity
                onPress={() => setLanguage(language === "EN" ? "AM" : "EN")}
                className="bg-[#E6F4EE] px-2.5 py-1 rounded-full mr-2"
              >
                <Text className="text-xs font-bold text-[#00684A]">{language === "EN" ? "EN | አማ" : "አማ | EN"}</Text>
              </TouchableOpacity>

              <View className="w-8 h-8 rounded-full bg-[#00684A] items-center justify-center">
                <Text className="text-[11px] font-bold text-white">YA</Text>
              </View>
            </View>

            {/* Ready for dispatch indicator */}
            <View className="flex-row items-center bg-[#E6F4EE] px-3 py-1.5 rounded-full self-start">
              <Ionicons name="locate" size={14} color="#00684A" />
              <Text className="text-xs font-bold text-[#00684A] ml-1.5">
                📍 {pickupSpot} • Ready for instant dispatch
              </Text>
            </View>
          </View>

          {/* Map & Live Courier Canvas Mockup matching customer screen 4 */}
          <View className="h-56 bg-emerald-950/10 rounded-3xl overflow-hidden relative border border-slate-200 mb-4 justify-between p-3.5">
            {/* Street labels mockup */}
            <View className="space-y-1">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                AFRICA AVE (BOLE RD) • CAMEROON ST
              </Text>
              <Text className="text-[10px] font-bold text-slate-400">
                RING ROAD INTERCHANGE • MESKEL SQ
              </Text>
            </View>

            {/* Central Pickup Marker */}
            <View className="absolute top-16 left-28 bg-[#111827] px-3 py-1.5 rounded-full flex-row items-center shadow-lg">
              <View className="w-2 h-2 rounded-full bg-[#00A86B] mr-2" />
              <Text className="text-xs font-bold text-white">Pickup here • 2 min</Text>
            </View>

            {/* Nearby Motorcycle Courier Badges */}
            <View className="absolute top-28 right-12 bg-[#00684A] px-2.5 py-1 rounded-full flex-row items-center shadow">
              <Ionicons name="bicycle" size={14} color="#FFFFFF" />
              <Text className="text-[11px] font-bold text-white ml-1">3 min</Text>
            </View>

            <View className="absolute bottom-12 left-16 bg-[#111827] px-2.5 py-1 rounded-full flex-row items-center shadow">
              <Ionicons name="bicycle" size={14} color="#FFFFFF" />
              <Text className="text-[11px] font-bold text-white ml-1">4 min</Text>
            </View>

            {/* Floating Map Controls on Right */}
            <View className="absolute right-3.5 top-14 space-y-2">
              <View className="w-9 h-9 rounded-full bg-white items-center justify-center shadow-sm">
                <Ionicons name="compass-outline" size={20} color="#00684A" />
              </View>
              <View className="w-9 h-9 rounded-full bg-white items-center justify-center shadow-sm">
                <Ionicons name="shield-outline" size={18} color="#00684A" />
              </View>
              <View className="w-9 h-9 rounded-full bg-white items-center justify-center shadow-sm">
                <Ionicons name="add" size={20} color="#111827" />
              </View>
            </View>

            <View className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full self-start">
              <Text className="text-[11px] font-bold text-[#00684A]">
                ✓ GPS Monitored Fleet
              </Text>
            </View>
          </View>

          {/* Fayda National ID Status Banner */}
          <View className="mb-4">
            <FaydaBadge user={user} />
          </View>

          {/* Delivery Configuration Card (Sender & Receiver Details) */}
          <View className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm mb-5">
            <View className="w-10 h-1 rounded-full bg-slate-200 self-center mb-4" />

            <Text className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">
              Delivery Route & Package
            </Text>

            {/* Pickup Location Row */}
            <View className="flex-row items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-2.5">
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-3.5 h-3.5 rounded-full bg-[#00684A] mr-3" />
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-slate-400">Pickup Spot (Sender)</Text>
                  <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                    {pickupSpot}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert("Change Pickup", "Pickup location editor")}
                className="bg-slate-200 px-2.5 py-1 rounded-lg"
              >
                <Text className="text-xs font-bold text-slate-700">Change</Text>
              </TouchableOpacity>
            </View>

            {/* Dropoff Location Row */}
            <View className="flex-row items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 mb-3">
              <View className="flex-row items-center flex-1 mr-2">
                <Ionicons name="location" size={18} color="#EA580C" style={{ marginRight: 10 }} />
                <View className="flex-1">
                  <Text className="text-[11px] font-semibold text-slate-400">Drop-off Destination (Receiver)</Text>
                  <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
                    {dropoffSpot}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setDropoffSpot("")}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Receiver Contact Details (Crucial for Item Delivery!) */}
            <View className="p-3 rounded-2xl bg-[#E6F4EE]/50 border border-[#00684A]/20 mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs font-bold text-[#00684A]">
                  📦 Recipient Details (Item Receiver)
                </Text>
                <Text className="text-[10px] font-semibold text-slate-500">
                  Will receive SMS Tracking & OTP
                </Text>
              </View>

              <View className="flex-row space-x-2">
                <TextInput
                  value={recipientName}
                  onChangeText={setRecipientName}
                  placeholder="Recipient Name"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 mr-2"
                />
                <TextInput
                  value={recipientPhone}
                  onChangeText={setRecipientPhone}
                  placeholder="Recipient Phone"
                  keyboardType="phone-pad"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                />
              </View>
            </View>

            {/* Preset Frequent Delivery Hubs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              <TouchableOpacity
                onPress={() => setDropoffSpot("Kazanchis • UNECA Compound")}
                className="flex-row items-center bg-slate-100 px-3 py-2 rounded-xl mr-2"
              >
                <Ionicons name="business-outline" size={16} color="#00684A" />
                <View className="ml-1.5">
                  <Text className="text-xs font-bold text-slate-800">Work • Kazanchis</Text>
                  <Text className="text-[10px] text-slate-500">14 min • 95 ETB</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDropoffSpot("Mexico Square Commercial Hub")}
                className="flex-row items-center bg-slate-100 px-3 py-2 rounded-xl mr-2"
              >
                <Ionicons name="cube-outline" size={16} color="#00684A" />
                <View className="ml-1.5">
                  <Text className="text-xs font-bold text-slate-800">Mexico Square</Text>
                  <Text className="text-[10px] text-slate-500">18 min • 120 ETB</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setDropoffSpot("Edna Mall / Megenagna")}
                className="flex-row items-center bg-slate-100 px-3 py-2 rounded-xl"
              >
                <Ionicons name="cart-outline" size={16} color="#00684A" />
                <View className="ml-1.5">
                  <Text className="text-xs font-bold text-slate-800">Edna Mall</Text>
                  <Text className="text-[10px] text-slate-500">6 min • 75 ETB</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            {/* Motorcycle Fleet Selection matching customer screen 6 */}
            <Text className="text-sm font-black text-slate-900 mb-2.5">
              Available Delivery Motos
            </Text>

            <TouchableOpacity
              onPress={() => setSelectedFleet("electric")}
              className={`p-3.5 rounded-2xl border mb-2.5 flex-row items-center justify-between ${
                selectedFleet === "electric"
                  ? "bg-[#E6F4EE]/60 border-[#00684A]"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-11 h-11 rounded-xl bg-white border border-slate-200 items-center justify-center mr-3">
                  <Ionicons name="flash" size={22} color="#00684A" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-sm font-bold text-slate-900">Electric Moto</Text>
                    <View className="bg-[#00684A] px-1.5 py-0.2 rounded ml-1.5">
                      <Text className="text-[10px] font-bold text-white">Dodai EV</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-slate-500 mt-0.5">Quiet • Zero Emission • 2 min pickup</Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-base font-black text-slate-900">ETB 165</Text>
                <Text className="text-[10px] text-slate-400 line-through">ETB 190</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedFleet("standard")}
              className={`p-3.5 rounded-2xl border mb-2.5 flex-row items-center justify-between ${
                selectedFleet === "standard"
                  ? "bg-[#E6F4EE]/60 border-[#00684A]"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-11 h-11 rounded-xl bg-white border border-slate-200 items-center justify-center mr-3">
                  <Ionicons name="bicycle" size={22} color="#111827" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-sm font-bold text-slate-900">Standard Moto</Text>
                    <View className="bg-slate-200 px-1.5 py-0.2 rounded ml-1.5">
                      <Text className="text-[10px] font-bold text-slate-700">Boxer 150</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-slate-500 mt-0.5">Agile in heavy traffic • 4 min pickup</Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-base font-black text-slate-900">ETB 180</Text>
                <Text className="text-[10px] text-slate-400">Standard rate</Text>
              </View>
            </TouchableOpacity>

            {/* Payment Method Selector */}
            <View className="flex-row items-center justify-between mt-3 mb-2">
              <Text className="text-xs font-bold text-slate-700">Payment Method</Text>
              <View className="flex-row items-center">
                <Ionicons name="keypad-outline" size={14} color="#00684A" />
                <Text className="text-[11px] font-bold text-[#00684A] ml-1">
                  Safety OTP on handover
                </Text>
              </View>
            </View>

            <View className="flex-row space-x-2 mb-4">
              <TouchableOpacity
                onPress={() => setSelectedPayment("telebirr")}
                className={`flex-1 py-2 rounded-xl items-center justify-center border mr-2 ${
                  selectedPayment === "telebirr"
                    ? "bg-[#00684A] border-[#00684A]"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <Text className={`text-xs font-bold ${selectedPayment === "telebirr" ? "text-white" : "text-slate-700"}`}>
                  Telebirr
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedPayment("cash")}
                className={`flex-1 py-2 rounded-xl items-center justify-center border mr-2 ${
                  selectedPayment === "cash"
                    ? "bg-[#00684A] border-[#00684A]"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <Text className={`text-xs font-bold ${selectedPayment === "cash" ? "text-white" : "text-slate-700"}`}>
                  Cash on Delivery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedPayment("cbe")}
                className={`flex-1 py-2 rounded-xl items-center justify-center border ${
                  selectedPayment === "cbe"
                    ? "bg-[#00684A] border-[#00684A]"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <Text className={`text-xs font-bold ${selectedPayment === "cbe" ? "text-white" : "text-slate-700"}`}>
                  CBE Birr
                </Text>
              </TouchableOpacity>
            </View>

            {/* Service Guarantee badge */}
            <View className="flex-row items-center bg-[#E6F4EE] rounded-xl p-2.5 mb-4">
              <Ionicons name="shield-checkmark" size={18} color="#00684A" />
              <Text className="text-xs font-semibold text-[#00684A] ml-2 flex-1">
                ⚡ Courier Box Secured • Dodai EV Fleet • OTP Handover
              </Text>
            </View>

            {/* Main Action Button */}
            <TouchableOpacity
              onPress={handleBookDelivery}
              activeOpacity={0.85}
              className="w-full py-4 rounded-2xl bg-[#00684A] flex-row items-center justify-center shadow-md shadow-[#00684A]/30 active:bg-[#005038]"
            >
              <Ionicons name="bicycle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text className="text-white font-extrabold text-base mr-2">
                Choose delivery option • From{" "}
                {selectedFleet === "electric" ? "ETB 165" : selectedFleet === "standard" ? "ETB 180" : "ETB 210"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <Text className="text-[11px] text-slate-400 text-center mt-2.5">
              Free cancellation within 2 minutes of driver match • Regulated rates
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

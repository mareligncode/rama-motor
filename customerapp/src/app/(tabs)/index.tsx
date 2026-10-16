import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import { FaydaBadge } from "../../components/modules/profile/FaydaBadge";
import { LanguageSelectorModal } from "../../components/common/LanguageSelectorModal";
import { ThemeSelectorModal } from "../../components/common/ThemeSelectorModal";
import { ThemeDropdown } from "../../components/common/ThemeDropdown";

export default function CustomerHomeScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { unreadCount, refreshNotifications } = useNotifications();
  const { colors, isDark } = useTheme();
  const { translations, language, supportedLanguages } = useTranslation();

  const [refreshing, setRefreshing] = useState(false);
  const [pickupSpot, setPickupSpot] = useState("Bole Medhanialem (Gate 2)");
  const [dropoffSpot, setDropoffSpot] = useState("Kazanchis • UNECA Compound");
  const [recipientPhone, setRecipientPhone] = useState("0923456789");
  const [recipientName, setRecipientName] = useState("Yonas G.");
  const [selectedFleet, setSelectedFleet] = useState<"electric" | "standard" | "cargo">("electric");
  const [selectedPayment, setSelectedPayment] = useState<"cash" | "telebirr" | "cbe">("telebirr");
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([refreshUser(), refreshNotifications()]);
    setRefreshing(false);
  };

  const handleBookDelivery = () => {
    Alert.alert(
      translations.delivery.requestCourier,
      `Dispatch motorcycle courier from ${pickupSpot} to ${dropoffSpot} for recipient ${recipientName} (${recipientPhone})?\n\nEstimated Fee: ${
        selectedFleet === "electric" ? "165 ETB" : selectedFleet === "standard" ? "180 ETB" : "210 ETB"
      }`,
      [
        { text: translations.common.cancel, style: "cancel" },
        {
          text: translations.common.confirm,
          onPress: () => {
            Alert.alert(
              "Courier Dispatched! 🏍",
              `Dodai EV Courier Dawit H. has accepted your parcel delivery. ${translations.delivery.securityOtp}: 4819.`
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      {/* Top App Bar matching UI Screens */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
        className="flex-row items-center justify-between px-5 py-3.5 border-b"
      >
        <View className="flex-row items-center flex-1 mr-2 min-w-0">
          <View className="w-10 h-10 rounded-full overflow-hidden mr-2.5 shadow-sm shrink-0 bg-[#00684A]">
            <Image
              source={require("../../assets/images/image.png")}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <View className="flex-1 min-w-0">
            <Text
              style={{ color: colors.textPrimary }}
              className="text-base font-black leading-tight"
              numberOfLines={1}
            >
              {translations.navigation.home}
            </Text>
            <Text
              className="text-[10px] font-bold text-[#00684A] tracking-wider uppercase"
              numberOfLines={1}
            >
              {translations.delivery.homeBadge}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-1.5 shrink-0">
          {/* Theme Changer Dropdown */}
          <ThemeDropdown compact />

          {/* Quick Language Switcher */}
          <TouchableOpacity
            onPress={() => setLangModalVisible(true)}
            style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
            className="flex-row items-center px-2 py-1 rounded-full"
            activeOpacity={0.8}
          >
            <Text className="text-xs mr-1">{currentLangObj.flag}</Text>
            <Text
              style={{ color: isDark ? '#4ADE80' : '#00684A' }}
              className="text-xs font-bold"
              numberOfLines={1}
            >
              {currentLangObj.code.toUpperCase()}
            </Text>
          </TouchableOpacity>

          {/* Verified Security Shield Badge */}
          <View className="w-9 h-9 rounded-full bg-[#00684A] items-center justify-center shadow-sm">
            <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
          </View>

          {/* Notifications shortcut with unread badge */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/notifications" as any)}
            style={{ backgroundColor: colors.surfaceVariant }}
            className="w-9 h-9 rounded-full items-center justify-center relative"
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
            {unreadCount > 0 ? (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-[16px] items-center justify-center px-0.5">
                <Text className="text-white text-[9px] font-bold">{unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>

          {/* Profile Circle with User Initials */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile" as any)}
            className="w-9 h-9 rounded-full bg-[#00684A] items-center justify-center shadow-sm"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-xs">
              {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "CU"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00684A" />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Floating Search / Where are you sending card */}
        <View className="p-4">
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-3xl p-4 border shadow-sm mb-3"
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center flex-1 mr-2">
                <View
                  style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
                  className="w-9 h-9 rounded-full items-center justify-center mr-2.5"
                >
                  <Ionicons name="search" size={18} color="#00684A" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.textPrimary }} className="text-base font-black leading-tight">
                    {translations.delivery.whereSending}
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5" numberOfLines={1}>
                    Pickup: {pickupSpot}
                  </Text>
                </View>
              </View>

              {/* Language Switcher Button */}
              <TouchableOpacity
                onPress={() => setLangModalVisible(true)}
                style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
                className="px-2.5 py-1 rounded-full mr-2"
              >
                <Text
                  style={{ color: isDark ? '#4ADE80' : '#00684A' }}
                  className="text-xs font-bold"
                >
                  {currentLangObj.flag} {currentLangObj.nativeName}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Ready for dispatch indicator */}
            <View
              style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
              className="flex-row items-center px-3 py-1.5 rounded-full self-start"
            >
              <Ionicons name="locate" size={14} color="#00684A" />
              <Text
                style={{ color: isDark ? '#4ADE80' : '#00684A' }}
                className="text-xs font-bold ml-1.5"
              >
                📍 {pickupSpot} • Ready for instant dispatch
              </Text>
            </View>
          </View>

          {/* Map & Live Courier Canvas Mockup matching customer screen 4 */}
          <View
            style={{ borderColor: colors.border }}
            className="h-56 bg-emerald-950/15 rounded-3xl overflow-hidden relative border mb-4 justify-between p-3.5"
          >
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
              <View
                style={{ backgroundColor: colors.surface }}
                className="w-9 h-9 rounded-full items-center justify-center shadow-sm"
              >
                <Ionicons name="compass-outline" size={20} color="#00684A" />
              </View>
              <View
                style={{ backgroundColor: colors.surface }}
                className="w-9 h-9 rounded-full items-center justify-center shadow-sm"
              >
                <Ionicons name="shield-outline" size={18} color="#00684A" />
              </View>
            </View>

            <View
              style={{ backgroundColor: colors.surface }}
              className="px-3 py-1 rounded-full self-start shadow-sm"
            >
              <Text className="text-[11px] font-bold text-[#00684A]">
                ✓ GPS Monitored Motorcycle Fleet
              </Text>
            </View>
          </View>

          {/* Fayda National ID Status Banner */}
          <View className="mb-4">
            <FaydaBadge user={user} />
          </View>

          {/* Delivery Configuration Card (Sender & Receiver Details) */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
            className="rounded-3xl p-5 border shadow-sm mb-5"
          >
            <View
              style={{ backgroundColor: colors.border }}
              className="w-10 h-1 rounded-full self-center mb-4"
            />

            <Text style={{ color: colors.textPrimary }} className="text-sm font-black uppercase tracking-wider mb-3">
              Delivery Route & Package
            </Text>

            {/* Pickup Location Row */}
            <View
              style={{
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
              }}
              className="flex-row items-center justify-between p-3 rounded-2xl border mb-2.5"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View className="w-3.5 h-3.5 rounded-full bg-[#00684A] mr-3" />
                <View className="flex-1">
                  <Text style={{ color: colors.textSecondary }} className="text-[11px] font-semibold">
                    {translations.delivery.pickupLocation}
                  </Text>
                  <Text style={{ color: colors.textPrimary }} className="text-sm font-bold" numberOfLines={1}>
                    {pickupSpot}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert(translations.delivery.changeBtn, translations.delivery.pickupLocation)}
                style={{ backgroundColor: colors.surface }}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <Text style={{ color: colors.textPrimary }} className="text-xs font-bold">
                  {translations.delivery.changeBtn}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Dropoff Location Row */}
            <View
              style={{
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
              }}
              className="flex-row items-center justify-between p-3 rounded-2xl border mb-3"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <Ionicons name="location" size={18} color="#EA580C" style={{ marginRight: 10 }} />
                <View className="flex-1">
                  <Text style={{ color: colors.textSecondary }} className="text-[11px] font-semibold">
                    {translations.delivery.dropoffLocation}
                  </Text>
                  <Text style={{ color: colors.textPrimary }} className="text-sm font-bold" numberOfLines={1}>
                    {dropoffSpot}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setDropoffSpot("")}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Receiver Contact Details */}
            <View
              style={{
                backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE',
                borderColor: isDark ? '#00A86B' : '#00684A',
              }}
              className="p-3.5 rounded-2xl border mb-4"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text
                  style={{ color: isDark ? '#4ADE80' : '#00684A' }}
                  className="text-xs font-bold"
                >
                  📦 {translations.delivery.receiverDetails}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-[10px] font-semibold">
                  {translations.delivery.willReceiveOtp}
                </Text>
              </View>

              <View className="flex-row space-x-2">
                <TextInput
                  value={recipientName}
                  onChangeText={setRecipientName}
                  placeholder={translations.delivery.recipientName}
                  placeholderTextColor={colors.textMuted}
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                  className="flex-1 border rounded-xl px-3 py-2 text-xs font-semibold mr-2"
                />
                <TextInput
                  value={recipientPhone}
                  onChangeText={setRecipientPhone}
                  placeholder={translations.delivery.recipientPhone}
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                  className="flex-1 border rounded-xl px-3 py-2 text-xs font-bold"
                />
              </View>
            </View>

            {/* Fleet Options */}
            <Text style={{ color: colors.textPrimary }} className="text-xs font-bold uppercase tracking-wider mb-2">
              {translations.delivery.fleetSelect}
            </Text>

            {/* Option 1: Dodai EV Moto */}
            <TouchableOpacity
              onPress={() => setSelectedFleet("electric")}
              style={{
                backgroundColor: selectedFleet === "electric"
                  ? isDark ? '#0E3A2B' : '#E6F4EE'
                  : colors.surfaceVariant,
                borderColor: selectedFleet === "electric" ? "#00684A" : colors.border,
              }}
              className="p-3.5 rounded-2xl border mb-2.5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 items-center justify-center mr-3 shadow-sm">
                  <Ionicons name="flash" size={24} color="#00684A" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text style={{ color: colors.textPrimary }} className="text-sm font-extrabold mr-2">
                      {translations.delivery.electricMoto}
                    </Text>
                    <View className="bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                      <Text className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        {translations.delivery.zeroEmission}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5">
                    {translations.delivery.electricMotoDesc}
                  </Text>
                </View>
              </View>
              <View className="items-end ml-2">
                <Text style={{ color: colors.textPrimary }} className="text-sm font-black">
                  165 ETB
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-[10px]">
                  ~18 min
                </Text>
              </View>
            </TouchableOpacity>

            {/* Option 2: Standard Boxer 150 */}
            <TouchableOpacity
              onPress={() => setSelectedFleet("standard")}
              style={{
                backgroundColor: selectedFleet === "standard"
                  ? isDark ? '#0E3A2B' : '#E6F4EE'
                  : colors.surfaceVariant,
                borderColor: selectedFleet === "standard" ? "#00684A" : colors.border,
              }}
              className="p-3.5 rounded-2xl border mb-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 items-center justify-center mr-3 shadow-sm">
                  <Ionicons name="bicycle" size={24} color="#00684A" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text style={{ color: colors.textPrimary }} className="text-sm font-extrabold mr-2">
                      {translations.delivery.standardMoto}
                    </Text>
                    <View className="bg-blue-100 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                      <Text className="text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        {translations.delivery.heavyParcel}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.textSecondary }} className="text-xs mt-0.5">
                    {translations.delivery.standardMotoDesc}
                  </Text>
                </View>
              </View>
              <View className="items-end ml-2">
                <Text style={{ color: colors.textPrimary }} className="text-sm font-black">
                  180 ETB
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-[10px]">
                  ~15 min
                </Text>
              </View>
            </TouchableOpacity>

            {/* Payment Method Selector */}
            <Text style={{ color: colors.textPrimary }} className="text-xs font-bold uppercase tracking-wider mb-2">
              {translations.delivery.paymentMethod}
            </Text>
            <View className="flex-row space-x-2 mb-4">
              <TouchableOpacity
                onPress={() => setSelectedPayment("telebirr")}
                style={{
                  backgroundColor: selectedPayment === "telebirr"
                    ? "#00684A"
                    : colors.surfaceVariant,
                  borderColor: selectedPayment === "telebirr" ? "#00684A" : colors.border,
                }}
                className="flex-1 py-2 rounded-xl items-center justify-center border mr-2"
              >
                <Text className={`text-xs font-bold ${selectedPayment === "telebirr" ? "text-white" : "text-slate-700 dark:text-slate-300"}`}>
                  Telebirr
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedPayment("cash")}
                style={{
                  backgroundColor: selectedPayment === "cash"
                    ? "#00684A"
                    : colors.surfaceVariant,
                  borderColor: selectedPayment === "cash" ? "#00684A" : colors.border,
                }}
                className="flex-1 py-2 rounded-xl items-center justify-center border mr-2"
              >
                <Text className={`text-xs font-bold ${selectedPayment === "cash" ? "text-white" : "text-slate-700 dark:text-slate-300"}`}>
                  {translations.delivery.cashOnDelivery}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedPayment("cbe")}
                style={{
                  backgroundColor: selectedPayment === "cbe"
                    ? "#00684A"
                    : colors.surfaceVariant,
                  borderColor: selectedPayment === "cbe" ? "#00684A" : colors.border,
                }}
                className="flex-1 py-2 rounded-xl items-center justify-center border"
              >
                <Text className={`text-xs font-bold ${selectedPayment === "cbe" ? "text-white" : "text-slate-700 dark:text-slate-300"}`}>
                  {translations.delivery.cbeBirr}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Service Guarantee badge */}
            <View
              style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
              className="flex-row items-center rounded-xl p-2.5 mb-4"
            >
              <Ionicons name="shield-checkmark" size={18} color="#00684A" />
              <Text
                style={{ color: isDark ? '#4ADE80' : '#00684A' }}
                className="text-xs font-semibold ml-2 flex-1"
              >
                {translations.delivery.courierBoxSecured}
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
                {translations.delivery.requestCourier} •{" "}
                {selectedFleet === "electric" ? "ETB 165" : selectedFleet === "standard" ? "ETB 180" : "ETB 210"}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={{ color: colors.textMuted }} className="text-[11px] text-center mt-2.5">
              {translations.delivery.freeCancellation}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <LanguageSelectorModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
      />
      <ThemeSelectorModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
      />
    </SafeAreaView>
  );
}

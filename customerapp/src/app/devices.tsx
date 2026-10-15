import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../components/common/Header";
import { EmptyState } from "../components/common/EmptyState";
import { deviceService } from "../services/device.service";
import { UserDevice } from "../types/device.types";
import { formatTimeAgo } from "../utils/formatters";
import { useTranslation } from "../hooks/useTranslation";
import { useTheme } from "../hooks/useTheme";

export default function DevicesScreen() {
  const { translations } = useTranslation();
  const { colors, isDark } = useTheme();

  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingToken, setDeletingToken] = useState<string | null>(null);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await deviceService.getMyDevices();
      if (res?.data?.devices) {
        setDevices(res.data.devices);
      }
    } catch (err: any) {
      console.warn("Error fetching devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleUnregister = (token: string) => {
    Alert.alert(
      translations.common.confirm,
      translations.profile.activeDevices,
      [
        { text: translations.common.cancel, style: "cancel" },
        {
          text: translations.common.confirm,
          style: "destructive",
          onPress: async () => {
            setDeletingToken(token);
            try {
              await deviceService.unregisterDevice(token);
              setDevices((prev) => prev.filter((d) => d.deviceToken !== token));
            } catch (err: any) {
              Alert.alert(translations.common.error, err?.message || translations.common.error);
            } finally {
              setDeletingToken(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      <Header title={translations.profile.activeDevices} showBack />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00684A" />
        </View>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item._id || item.deviceToken}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
              className="rounded-2xl p-4 border shadow-sm mb-3 flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1 mr-3">
                <View
                  style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
                  className="w-11 h-11 rounded-xl items-center justify-center mr-3"
                >
                  <Ionicons
                    name={
                      item.platform === "ios"
                        ? "logo-apple"
                        : item.platform === "android"
                        ? "logo-android"
                        : "globe-outline"
                    }
                    size={22}
                    color="#00684A"
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center space-x-2">
                    <Text style={{ color: colors.textPrimary }} className="text-sm font-bold capitalize">
                      {item.platform} Device
                    </Text>
                    <View
                      style={{ backgroundColor: colors.surfaceVariant }}
                      className="px-1.5 py-0.5 rounded ml-2"
                    >
                      <Text style={{ color: colors.textSecondary }} className="text-[10px] font-semibold uppercase">
                        {item.provider}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.textMuted }} className="text-xs mt-0.5" numberOfLines={1}>
                    Token: {item.deviceToken}
                  </Text>
                  <Text style={{ color: colors.textSecondary }} className="text-[11px] mt-1">
                    Last active: {formatTimeAgo(item.lastSeenAt)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleUnregister(item.deviceToken)}
                disabled={deletingToken === item.deviceToken}
                className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-950 items-center justify-center active:bg-red-100"
              >
                {deletingToken === item.deviceToken ? (
                  <ActivityIndicator size="small" color="#DC2626" />
                ) : (
                  <Ionicons name="trash-outline" size={18} color="#DC2626" />
                )}
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="hardware-chip-outline"
              title={translations.profile.activeDevices}
              description={translations.common.loading}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

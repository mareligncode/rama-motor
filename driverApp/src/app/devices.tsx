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

export default function DriverDevicesScreen() {
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
      console.warn("Error fetching driver devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleUnregister = (token: string) => {
    Alert.alert(
      "Revoke Dispatch Alerts",
      "Are you sure you want to revoke push notifications on this device? You won't receive trip alerts.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Revoke",
          style: "destructive",
          onPress: async () => {
            setDeletingToken(token);
            try {
              await deviceService.unregisterDevice(token);
              setDevices((prev) => prev.filter((d) => d.deviceToken !== token));
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Failed to remove device");
            } finally {
              setDeletingToken(null);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Header title="Driver Push Notification Devices" showBack />

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
            <View className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 mr-3">
                <View className="w-11 h-11 rounded-xl bg-[#E6F4EE] items-center justify-center mr-3">
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
                    <Text className="text-sm font-bold text-slate-900 capitalize">
                      {item.platform} Rider Device
                    </Text>
                    <View className="px-1.5 py-0.5 rounded bg-slate-100 ml-2">
                      <Text className="text-[10px] font-semibold text-slate-600 uppercase">
                        {item.provider}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-slate-400 mt-0.5" numberOfLines={1}>
                    Token: {item.deviceToken}
                  </Text>
                  <Text className="text-[11px] text-slate-500 mt-1">
                    Last active: {formatTimeAgo(item.lastSeenAt)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleUnregister(item.deviceToken)}
                disabled={deletingToken === item.deviceToken}
                className="w-9 h-9 rounded-full bg-red-50 items-center justify-center active:bg-red-100"
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
              title="No Registered Devices"
              description="Your driver mobile device will be registered automatically upon shift login."
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

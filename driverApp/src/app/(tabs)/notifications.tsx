import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "../../hooks/useNotifications";
import { NotificationCard } from "../../components/modules/notifications/NotificationCard";
import { EmptyState } from "../../components/common/EmptyState";

export default function DriverNotificationsScreen() {
  const {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [markingAll, setMarkingAll] = useState(false);

  const filters = [
    { key: "all", label: "All Alerts" },
    { key: "unread", label: `Unread (${unreadCount})` },
    { key: "delivery", label: "Orders" },
    { key: "warning", label: "Safety" },
    { key: "payment", label: "Settlement" },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "unread") return !n.isRead;
    return n.notificationType === selectedFilter;
  });

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    await markAllAsRead();
    setMarkingAll(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Top Header */}
      <View className="px-5 py-3.5 bg-white border-b border-slate-100 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-extrabold text-slate-900">Dispatch Alerts</Text>
          <Text className="text-xs text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread courier alert(s)` : "All dispatch alerts clear"}
          </Text>
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            disabled={markingAll}
            className="flex-row items-center bg-[#E6F4EE] px-3 py-1.5 rounded-full"
          >
            {markingAll ? (
              <ActivityIndicator size="small" color="#00684A" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={16} color="#00684A" />
                <Text className="text-xs font-bold text-[#00684A] ml-1.5">Mark All Read</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Chips */}
      <View className="py-2.5 px-4 bg-white border-b border-slate-100">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => {
            const isActive = selectedFilter === item.key;
            return (
              <TouchableOpacity
                onPress={() => setSelectedFilter(item.key)}
                className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                  isActive
                    ? "bg-[#00684A] border-[#00684A]"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    isActive ? "text-white" : "text-slate-600"
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Notification List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshNotifications} />
        }
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onMarkAsRead={() => markAsRead(item._id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title="No Dispatch Alerts"
            description={
              selectedFilter === "unread"
                ? "You have reviewed all your dispatch alerts!"
                : "No orders or system notifications for your route right now."
            }
          />
        }
      />
    </SafeAreaView>
  );
}

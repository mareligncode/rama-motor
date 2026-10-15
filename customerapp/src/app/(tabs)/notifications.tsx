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
import { NotificationType } from "../../types/notification.types";

export default function NotificationsScreen() {
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
    { key: "all", label: "All" },
    { key: "unread", label: `Unread (${unreadCount})` },
    { key: "delivery", label: "Deliveries" },
    { key: "auth", label: "Security" },
    { key: "payment", label: "Payments" },
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
          <Text className="text-xl font-extrabold text-slate-900">Notifications</Text>
          <Text className="text-xs text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread message(s)` : "All caught up"}
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

      {/* Horizontal Filter Chips */}
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
            title="No Notifications"
            description={
              selectedFilter === "unread"
                ? "You have read all your notifications!"
                : "You don't have any notifications right now."
            }
          />
        }
      />
    </SafeAreaView>
  );
}

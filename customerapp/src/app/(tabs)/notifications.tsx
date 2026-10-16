import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "../../hooks/useNotifications";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import { NotificationCard } from "../../components/modules/notifications/NotificationCard";
import { EmptyState } from "../../components/common/EmptyState";

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    isLoading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const { colors, isDark } = useTheme();
  const { translations } = useTranslation();

  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [markingAll, setMarkingAll] = useState(false);

  const filters = [
    { key: "all", label: translations.common.all },
    { key: "unread", label: `${translations.notifications.filterUnread} (${unreadCount})` },
    { key: "delivery", label: translations.notifications.filterOrders },
    { key: "auth", label: translations.notifications.filterSecurity },
    { key: "payment", label: translations.notifications.filterPayments },
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
    <SafeAreaView style={{ backgroundColor: colors.background }} className="flex-1">
      {/* Top Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
        className="px-5 py-3.5 border-b flex-row items-center justify-between"
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
            <Text style={{ color: colors.textPrimary }} className="text-xl font-extrabold" numberOfLines={1}>
              {translations.notifications.title}
            </Text>
            <Text style={{ color: colors.textSecondary }} className="text-xs" numberOfLines={1}>
              {unreadCount > 0 ? `${unreadCount} ${translations.notifications.unreadCountSuffix}` : translations.notifications.allCaughtUp}
            </Text>
          </View>
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            disabled={markingAll}
            style={{ backgroundColor: isDark ? '#0E3A2B' : '#E6F4EE' }}
            className="flex-row items-center px-3 py-1.5 rounded-full"
          >
            {markingAll ? (
              <ActivityIndicator size="small" color="#00684A" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-done"
                  size={16}
                  color={isDark ? "#4ADE80" : "#00684A"}
                />
                <Text
                  style={{ color: isDark ? '#4ADE80' : '#00684A' }}
                  className="text-xs font-bold ml-1.5"
                >
                  {translations.notifications.markAllRead}
                </Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Horizontal Filter Chips */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        }}
        className="py-2.5 px-4 border-b"
      >
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
                style={{
                  backgroundColor: isActive
                    ? "#00684A"
                    : colors.surfaceVariant,
                  borderColor: isActive
                    ? "#00684A"
                    : colors.border,
                }}
                className="px-3.5 py-1.5 rounded-full mr-2 border"
              >
                <Text
                  style={{
                    color: isActive ? "#FFFFFF" : colors.textSecondary,
                  }}
                  className="text-xs font-bold"
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
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshNotifications}
            tintColor="#00684A"
          />
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
            title={translations.notifications.emptyTitle}
            description={translations.notifications.emptySubtitle}
          />
        }
      />
    </SafeAreaView>
  );
}

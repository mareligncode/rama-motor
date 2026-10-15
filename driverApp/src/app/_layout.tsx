import "../../global.css";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../contexts/AuthContext";
import { DriverDutyProvider } from "../contexts/DriverDutyContext";
import { NotificationProvider } from "../contexts/NotificationContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <DriverDutyProvider>
          <NotificationProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="fayda-verify"
                options={{
                  presentation: "modal",
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="devices"
                options={{
                  presentation: "modal",
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="edit-profile"
                options={{
                  presentation: "modal",
                  headerShown: false,
                }}
              />
            </Stack>
          </NotificationProvider>
        </DriverDutyProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

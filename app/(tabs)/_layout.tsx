import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-sharp" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="accounts"
          options={{
            title: "Cuentas",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="card-sharp" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="forecast"
          options={{
            title: "Proyección",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bar-chart-sharp" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="new-transaction"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="new-account"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}

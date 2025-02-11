import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Pressable, Text, View } from "react-native";
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
        <Tabs.Screen
          name="categories-wizzard"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <StatusBar style="dark" />
      <View>
        <Pressable
          className="bg-primary rounded-full w-16 h-16 items-center justify-center absolute bottom-16 right-4"
          onPress={() => router.push("/categories-wizzard")}
        >
          <Text className="text-white text-4xl font-bold">+</Text>
        </Pressable>
      </View>
    </SafeAreaProvider>
  );
}

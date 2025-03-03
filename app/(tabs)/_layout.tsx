import { colors } from "@/common/styles/colors.styles";
import * as schema from "@/database/schema";
import migrations from "@/drizzle/migrations";
import { useAccountsStore } from "@/stores/accounts.store";
import { usePrioritiesStore } from "@/stores/priorities.store";
import { Ionicons } from "@expo/vector-icons";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { router, Tabs } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../../global.css";
const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);

export default function TabLayout() {
  const { success, error } = useMigrations(db, migrations);

  const getInitialData = async () => {
    const accounts = await db.select().from(schema.accounts);
    const resultPriorities = await db.select().from(schema.priorities);

    const prioritiesWithCategories = await Promise.all(
      resultPriorities.map(async (priority) => ({
        ...priority,
        categories: await db
          .select()
          .from(schema.categories)
          .where(eq(schema.categories.priorityId, priority.id)),
      })),
    );
    useAccountsStore.setState({ accounts });
    usePrioritiesStore.setState({ priorities: prioritiesWithCategories });
  };

  useEffect(() => {
    getInitialData();
  }, [success]);

  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }
  if (!success) {
    return (
      <View>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
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
          name="forecast-wizzard"
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
          onPress={() => router.push("/new-transaction")}
        >
          <Text className="text-white text-4xl font-bold">+</Text>
        </Pressable>
      </View>
    </SafeAreaProvider>
  );
}

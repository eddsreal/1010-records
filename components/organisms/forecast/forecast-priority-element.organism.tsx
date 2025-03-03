import * as schema from "@/database/schema";
import { Category, ForecastDetail } from "@/database/schema";
import { useForecastStore } from "@/stores/forecast.store";
import { PriorityWithCategories } from "@/stores/priorities.store";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { MonthCell } from "./month-cell.organism";

const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);

const months = Array.from({ length: 12 }).map((_, monthIndex) => {
  return new Date(2024, monthIndex).toLocaleString("es-CO", {
    month: "long",
  });
});

type Props = {
  priority: PriorityWithCategories;
};

export const ForecastPriorityElement: React.FC<Props> = ({ priority }) => {
  const { syncForecastDetail } = useForecastStore();
  const [forecastDetail, setForecastDetail] = useState<ForecastDetail[]>([]);

  const getForecastDetail = useCallback(async () => {
    const forecastDetail = await db
      .select()
      .from(schema.forecastDetail)
      .where(eq(schema.forecastDetail.priorityId, priority.id));
    setForecastDetail(forecastDetail);

    useForecastStore.setState({
      syncForecastDetail: false,
    });
  }, [priority?.id]);

  useEffect(() => {
    getForecastDetail();
  }, [getForecastDetail, syncForecastDetail]);

  return (
    <View>
      <Text className="text-3xl font-bold text-primary">{priority.name}</Text>

      <View className="mt-4">
        {priority.categories?.map((category: Category) => (
          <View key={category.id} className="flex-row items-center mb-4">
            <View className="w-4/12">
              <Text className="text-gray-500 text-lg font-bold">
                {category.icon} {category.name}
              </Text>
            </View>
            <View className="w-8/12">
              <ScrollView horizontal>
                {months.map((month, monthIndex) => {
                  const monthData = forecastDetail.find(
                    (fd) =>
                      fd.month === monthIndex + 1 &&
                      fd.categoryId === category.id &&
                      fd.priorityId === priority.id,
                  );
                  const amount = monthData?.amount || 0;

                  return (
                    <MonthCell
                      key={monthIndex}
                      monthName={month}
                      amount={amount}
                      onPress={() => {
                        useForecastStore.setState({
                          forecastDetailModal: {
                            priority,
                            category,
                          },
                        });
                        router.push({
                          pathname: "/edit-forecast-element",
                        });
                      }}
                    />
                  );
                })}
              </ScrollView>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

import { useForecasts } from "@/common/hooks/database/use-forecasts.hook";
import { Category, ForecastDetail } from "@/database/schema";
import { useForecastsStore } from "@/stores/forecasts.store";
import { PriorityWithCategories } from "@/stores/priorities.store";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";
import React, { useEffect, useState } from "react";
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
  const { forecastDetailModal } = useForecastsStore();
  const [forecastDetail, setForecastDetail] = useState<ForecastDetail[]>([]);
  const { getForecastDetail } = useForecasts();

  const getForecastDetailValues = async () => {
    const forecastDetail = await getForecastDetail({ priorityId: priority.id });
    setForecastDetail(forecastDetail as ForecastDetail[]);
  };

  useEffect(() => {
    if (priority) {
      getForecastDetailValues();
    }
  }, [priority, forecastDetailModal]);

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
                  const monthData = forecastDetail?.find(
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
                        useForecastsStore.setState({
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

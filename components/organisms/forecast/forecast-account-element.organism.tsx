import * as schema from "@/database/schema";
import { Account, ForecastDetail } from "@/database/schema";
import { useForecastStore } from "@/stores/forecast.store";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { MonthCell } from "./month-cell.organism";

const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);

type Props = {
  account: Account;
};

export const ForecastAccountElement: React.FC<Props> = ({ account }) => {
  const [forecastDetail, setForecastDetail] = useState<ForecastDetail[]>([]);

  const getForecastDetail = useCallback(async () => {
    const detail = await db
      .select()
      .from(schema.forecastDetail)
      .where(eq(schema.forecastDetail.accountId, account.id));
    setForecastDetail(detail);
  }, [account.id]);

  useEffect(() => {
    getForecastDetail();
  }, [getForecastDetail]);

  return (
    <View className="flex-row items-center">
      <View className="w-4/12">
        <Text className="text-lg font-bold text-gray-500">{account.name}</Text>
      </View>

      <View className="w-8/12">
        <ScrollView horizontal>
          {Array.from({ length: 12 }).map((_, monthIndex) => {
            const monthData = forecastDetail.find(
              (fd) =>
                fd.month === monthIndex &&
                fd.accountId === account.id &&
                fd.priorityId === null,
            );
            const amount = monthData?.amount || 0;
            const monthName = new Date(2024, monthIndex).toLocaleString(
              "es-CO",
              {
                month: "long",
              },
            );

            return (
              <MonthCell
                key={monthIndex}
                monthName={monthName}
                amount={amount}
                onPress={() => {
                  useForecastStore.setState({
                    forecastDetailModal: {
                      account,
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
  );
};

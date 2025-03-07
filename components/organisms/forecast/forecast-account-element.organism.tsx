import { useForecasts } from "@/common/hooks/database/use-forecasts.hook";
import { Account, ForecastDetail } from "@/database/schema";
import { useForecastsStore } from "@/stores/forecasts.store";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { openDatabaseSync } from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { MonthCell } from "./month-cell.organism";

const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);

type Props = {
  account: Account;
};

export const ForecastAccountElement: React.FC<Props> = ({ account }) => {
  const { forecastDetailModal } = useForecastsStore();
  const [forecastDetail, setForecastDetail] = useState<ForecastDetail[]>([]);
  const { getForecastDetail } = useForecasts();

  const getForecastDetailValues = async () => {
    const forecastDetail = await getForecastDetail({ accountId: account.id });
    setForecastDetail(forecastDetail as ForecastDetail[]);
  };

  useEffect(() => {
    if (account) {
      getForecastDetailValues();
    }
  }, [account, forecastDetailModal]);

  return (
    <View className="flex-row items-center">
      <View className="w-4/12">
        <Text className="text-lg font-bold text-gray-500">{account.name}</Text>
      </View>

      <View className="w-8/12">
        <ScrollView horizontal>
          {Array.from({ length: 12 }).map((_, monthIndex) => {
            const monthNumber = monthIndex + 1;

            const monthData = forecastDetail.find(
              (fd) => fd.month === monthNumber && fd.accountId === account.id,
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
                  useForecastsStore.setState({
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

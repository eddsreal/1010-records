import * as schema from "@/database/schema";
import { Account, Category, Forecast, ForecastDetail } from "@/database/schema";
import { useAccountsStore } from "@/stores/accounts.store";
import { useForecastStore } from "@/stores/forecast.store";
import {
  PriorityWithCategories,
  usePrioritiesStore,
} from "@/stores/priorities.store";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
const expoDb = openDatabaseSync("1010records");
const db = drizzle(expoDb);

export const ForecastPriorityElement: React.FunctionComponent<{
  priority: PriorityWithCategories;
}> = ({ priority }) => {
  const [forecastDetail, setForecastDetail] = useState<ForecastDetail[]>([]);

  const getForecastDetail = useCallback(async () => {
    const forecastDetail = await db
      .select()
      .from(schema.forecastDetail)
      .where(eq(schema.forecastDetail.priorityId, priority.id));
    setForecastDetail(forecastDetail);
  }, [priority?.id]);

  useEffect(() => {
    getForecastDetail();
  }, [getForecastDetail]);

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
                {Array.from({ length: 12 }).map((_, monthIndex) => {
                  const monthData = forecastDetail.find(
                    (fd) =>
                      fd.month === monthIndex + 1 &&
                      fd.categoryId === category.id &&
                      fd.priorityId === priority.id,
                  );
                  const amount = monthData?.amount || 0;

                  return (
                    <View
                      key={monthIndex}
                      className="w-32 p-2 border-r border-gray-200 items-center"
                    >
                      <Text className="text-sm font-bold text-primary">
                        {new Date(2024, monthIndex).toLocaleString("es-CO", {
                          month: "long",
                        })}
                      </Text>
                      <Text className="text-lg mt-1 text-gray-500">
                        $
                        {amount.toLocaleString("es-CO", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                    </View>
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

export const ForecastAccountElement: React.FunctionComponent<{
  account: Account;
}> = ({ account }) => {
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

      <ScrollView horizontal className="w-8/12">
        {Array.from({ length: 12 }).map((_, monthIndex) => {
          const monthData = forecastDetail.find(
            (fd) => fd.month === monthIndex + 1 && fd.accountId === account.id,
          );
          const amount = monthData?.amount || 0;

          return (
            <View
              key={monthIndex}
              className="w-32 p-2 border-r border-gray-200 items-center"
            >
              <Text className="text-sm font-bold text-primary">
                {new Date(2024, monthIndex).toLocaleString("es-CO", {
                  month: "long",
                })}
              </Text>
              <Text className="text-lg mt-1 text-gray-500">
                $
                {amount.toLocaleString("es-CO", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export const ForecastElement: React.FunctionComponent<{
  priority?: PriorityWithCategories;
  accounts?: Account[];
}> = ({ priority, accounts }) => {
  return (
    <View className="p-4">
      {priority && <ForecastPriorityElement priority={priority} />}
      {accounts && (
        <View>
          <Text className="text-3xl font-bold text-primary">Cuentas</Text>
          {accounts.map((account) => (
            <ForecastAccountElement key={account.id} account={account} />
          ))}
        </View>
      )}
    </View>
  );
};

export default function ForecastWizzardView() {
  const { yearForecast } = useForecastStore();
  const { priorities } = usePrioritiesStore();
  const { accounts } = useAccountsStore();

  const getYearForecasts = async () => {
    let resultYearForecast: Forecast[] = await db
      .select()
      .from(schema.forecast)
      .where(eq(schema.forecast.year, new Date().getFullYear()));

    if (!resultYearForecast) {
      await db.insert(schema.forecast).values({
        year: new Date().getFullYear(),
      });
      resultYearForecast = await db
        .select()
        .from(schema.forecast)
        .where(eq(schema.forecast.year, new Date().getFullYear()));
    }

    useForecastStore.setState({
      yearForecast: resultYearForecast?.[0],
    });
  };

  const getAccounts = async () => {
    const accounts = await db.select().from(schema.accounts);
    useAccountsStore.setState({ accounts });
  };

  const getPriorities = async () => {
    const prioritiesWithCategories = await db
      .select()
      .from(schema.priorities)
      .leftJoin(
        schema.categories,
        eq(schema.categories.priorityId, schema.priorities.id),
      )
      .then((results) => {
        const grouped = results.reduce(
          (acc, row) => {
            if (!acc[row.priorities.id]) {
              acc[row.priorities.id] = {
                ...row.priorities,
                categories: [],
              };
            }
            if (row.categories) {
              acc[row.priorities.id].categories.push(row.categories);
            }
            return acc;
          },
          {} as Record<number, PriorityWithCategories>,
        );

        return Object.values(grouped);
      });

    usePrioritiesStore.setState({ priorities: prioritiesWithCategories });
  };

  useEffect(() => {
    getYearForecasts();
    getAccounts();
    getPriorities();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <Pressable
        onPress={async () => {
          await db.insert(schema.forecastDetail).values({
            forecastId: yearForecast?.id,
            priorityId: 1,
            categoryId: 1,
            amount: 100,
            month: 1,
          });
        }}
      >
        <Text>Agregar Data Forecast</Text>
      </Pressable>
      <PagerView initialPage={0} style={{ flex: 1 }}>
        <ForecastElement accounts={accounts} />
        {priorities.map((priority) => (
          <ForecastElement key={priority.id} priority={priority} />
        ))}
      </PagerView>
    </View>
  );
}
